import 'server-only'

import { OrderClaimTransferRequestStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { validateCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import { prisma } from '@/src/server/db/prisma'
import { buildOrderClaimTransferAuthorizeUrl } from '@/src/server/email/email.links'
import { sendTransactionalEmail } from '@/src/server/email/email.service'
import type { GraphQLContext } from '@/src/server/graphql/context'

import {
  generateOrderClaimToken,
  hashOrderClaimToken,
  maskCustomerEmail,
} from './order-claim-token'
import { linkGuestOrderToUser } from './link-guest-order-to-user'

const TRANSFER_TTL_HOURS = 48

export type RequestOrderClaimTransferStatus =
  | 'SENT'
  | 'ALREADY_PENDING'
  | 'ALREADY_CLAIMED_BY_USER'
  | 'ORDER_ALREADY_CLAIMED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'EMAIL_MATCHES_USE_DIRECT_CLAIM'
  | 'ERROR'

export type RequestOrderClaimTransferResult = {
  success: boolean
  status: RequestOrderClaimTransferStatus
  message?: string
}

export type ApproveOrderClaimTransferStatus =
  | 'APPROVED'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'ALREADY_USED'
  | 'ORDER_ALREADY_CLAIMED'
  | 'CANCELLED'
  | 'ERROR'

export type ApproveOrderClaimTransferResult = {
  success: boolean
  status: ApproveOrderClaimTransferStatus
  orderNumber?: string
  message?: string
}

export type OrderClaimTransferPreview = {
  orderNumber: string
  maskedOrderEmail: string
  maskedRequestedByEmail: string
  expiresAt: Date
  status: OrderClaimTransferRequestStatus
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

function transferExpiresAt(from = new Date()): Date {
  const expiresAt = new Date(from)
  expiresAt.setHours(expiresAt.getHours() + TRANSFER_TTL_HOURS)
  return expiresAt
}

function isTransferExpired(expiresAt: Date): boolean {
  return expiresAt.getTime() < Date.now()
}

async function loadTransferByToken(token: string) {
  const trimmed = token.trim()
  if (!trimmed) {
    return null
  }

  const tokenHash = hashOrderClaimToken(trimmed)

  return prisma.orderClaimTransferRequest.findUnique({
    where: { tokenHash },
    include: {
      order: {
        select: {
          id: true,
          orderNumber: true,
          userId: true,
          customerEmail: true,
          shippingAddressId: true,
          billingAddressId: true,
          guestSessionId: true,
          deletedAt: true,
        },
      },
    },
  })
}

async function markExpiredIfNeeded(
  requestId: string,
  expiresAt: Date,
  status: OrderClaimTransferRequestStatus,
): Promise<OrderClaimTransferRequestStatus> {
  if (status !== OrderClaimTransferRequestStatus.PENDING) {
    return status
  }

  if (!isTransferExpired(expiresAt)) {
    return status
  }

  await prisma.orderClaimTransferRequest.update({
    where: { id: requestId },
    data: { status: OrderClaimTransferRequestStatus.EXPIRED },
  })

  return OrderClaimTransferRequestStatus.EXPIRED
}

/**
 * Creates a transfer authorization request and emails the original order email.
 */
export async function requestOrderClaimTransfer(input: {
  orderNumber: string
  checkoutToken: string
  requestedByUserId: string
  requestedByEmail: string
}): Promise<RequestOrderClaimTransferResult> {
  try {
    const trimmedToken = input.checkoutToken.trim()
    const trimmedOrderNumber = input.orderNumber.trim()

    if (!trimmedToken || !trimmedOrderNumber) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'El enlace de pedido no es válido.',
      }
    }

    const validation = await validateCheckoutReturnToken(trimmedToken)
    if (!validation.order) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'El enlace de pedido no es válido o expiró.',
      }
    }

    if (validation.reason === 'EXPIRED') {
      return {
        success: false,
        status: 'TOKEN_EXPIRED',
        message: 'El enlace de pedido expiró.',
      }
    }

    if (!validation.valid) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'El enlace de pedido no es válido.',
      }
    }

    if (validation.order.orderNumber !== trimmedOrderNumber) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'El enlace no corresponde a este pedido.',
      }
    }

    const order = await prisma.order.findFirst({
      where: { id: validation.order.id, deletedAt: null },
      select: {
        id: true,
        orderNumber: true,
        userId: true,
        customerEmail: true,
      },
    })

    if (!order) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'No encontramos este pedido.',
      }
    }

    if (order.userId) {
      if (order.userId === input.requestedByUserId) {
        return {
          success: false,
          status: 'ALREADY_CLAIMED_BY_USER',
          message: 'Este pedido ya está en tu cuenta.',
        }
      }

      return {
        success: false,
        status: 'ORDER_ALREADY_CLAIMED',
        message: 'Este pedido ya está vinculado a otra cuenta.',
      }
    }

    const sessionEmail = normalizeEmail(input.requestedByEmail)
    const orderEmail = normalizeEmail(order.customerEmail)

    if (sessionEmail === orderEmail) {
      return {
        success: false,
        status: 'EMAIL_MATCHES_USE_DIRECT_CLAIM',
        message: 'Tu correo coincide con el de la compra. Usa el flujo normal para guardar el pedido.',
      }
    }

    const existingPending = await prisma.orderClaimTransferRequest.findFirst({
      where: {
        orderId: order.id,
        requestedByUserId: input.requestedByUserId,
        status: OrderClaimTransferRequestStatus.PENDING,
        expiresAt: { gt: new Date() },
      },
      orderBy: { createdAt: 'desc' },
    })

    if (existingPending) {
      return {
        success: true,
        status: 'ALREADY_PENDING',
        message:
          'Ya enviamos un correo de autorización al correo usado en la compra. Revisa tu bandeja o espera a que expire para solicitar uno nuevo.',
      }
    }

    await prisma.orderClaimTransferRequest.updateMany({
      where: {
        orderId: order.id,
        requestedByUserId: input.requestedByUserId,
        status: OrderClaimTransferRequestStatus.PENDING,
      },
      data: { status: OrderClaimTransferRequestStatus.CANCELLED },
    })

    const plainToken = generateOrderClaimToken()
    const tokenHash = hashOrderClaimToken(plainToken)
    const expiresAt = transferExpiresAt()

    await prisma.orderClaimTransferRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: input.requestedByUserId,
        requestedByEmail: sessionEmail,
        orderEmail,
        tokenHash,
        expiresAt,
      },
    })

    const authorizeUrl = buildOrderClaimTransferAuthorizeUrl(plainToken)

    await sendTransactionalEmail({
      to: orderEmail,
      templateKey: 'order_claim_transfer_authorization',
      subject: '',
      orderId: order.id,
      userId: input.requestedByUserId,
      payload: {
        orderNumber: order.orderNumber,
        requestedByEmail: sessionEmail,
        links: {
          claimUrl: authorizeUrl,
        },
        claimUrl: authorizeUrl,
      },
    })

    return {
      success: true,
      status: 'SENT',
      message: 'Enviamos un correo de autorización al correo usado en la compra.',
    }
  } catch {
    return {
      success: false,
      status: 'ERROR',
      message: 'No pudimos enviar la solicitud de autorización. Intenta de nuevo.',
    }
  }
}

/**
 * GraphQL entry point for requesting order claim transfer authorization.
 */
export async function requestOrderClaimTransferForGraphQL(
  context: GraphQLContext,
  orderNumber: string,
  checkoutToken: string,
): Promise<RequestOrderClaimTransferResult> {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para solicitar autorización.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  return requestOrderClaimTransfer({
    orderNumber,
    checkoutToken,
    requestedByUserId: context.currentUser.id,
    requestedByEmail: context.currentUser.email,
  })
}

/**
 * Returns preview data for an authorization token without consuming it.
 */
export async function getOrderClaimTransferPreview(
  token: string,
): Promise<OrderClaimTransferPreview | null> {
  const transfer = await loadTransferByToken(token)
  if (!transfer || transfer.order.deletedAt) {
    return null
  }

  const status = await markExpiredIfNeeded(transfer.id, transfer.expiresAt, transfer.status)

  if (
    status === OrderClaimTransferRequestStatus.APPROVED ||
    status === OrderClaimTransferRequestStatus.CANCELLED
  ) {
    return {
      orderNumber: transfer.order.orderNumber,
      maskedOrderEmail: maskCustomerEmail(transfer.orderEmail),
      maskedRequestedByEmail: maskCustomerEmail(transfer.requestedByEmail),
      expiresAt: transfer.expiresAt,
      status,
    }
  }

  if (status === OrderClaimTransferRequestStatus.EXPIRED) {
    return null
  }

  if (transfer.consumedAt) {
    return null
  }

  return {
    orderNumber: transfer.order.orderNumber,
    maskedOrderEmail: maskCustomerEmail(transfer.orderEmail),
    maskedRequestedByEmail: maskCustomerEmail(transfer.requestedByEmail),
    expiresAt: transfer.expiresAt,
    status,
  }
}

/**
 * Approves a pending transfer request and links the order to the requester.
 */
export async function approveOrderClaimTransfer(
  token: string,
): Promise<ApproveOrderClaimTransferResult> {
  try {
    const transfer = await loadTransferByToken(token)
    if (!transfer || transfer.order.deletedAt) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'Este enlace ya no es válido.',
      }
    }

    if (transfer.status === OrderClaimTransferRequestStatus.APPROVED || transfer.consumedAt) {
      return {
        success: false,
        status: 'ALREADY_USED',
        orderNumber: transfer.order.orderNumber,
        message: 'Esta autorización ya fue utilizada.',
      }
    }

    if (transfer.status === OrderClaimTransferRequestStatus.CANCELLED) {
      return {
        success: false,
        status: 'ALREADY_USED',
        orderNumber: transfer.order.orderNumber,
        message: 'Esta solicitud fue cancelada.',
      }
    }

    const status = await markExpiredIfNeeded(transfer.id, transfer.expiresAt, transfer.status)

    if (status === OrderClaimTransferRequestStatus.EXPIRED || isTransferExpired(transfer.expiresAt)) {
      return {
        success: false,
        status: 'TOKEN_EXPIRED',
        orderNumber: transfer.order.orderNumber,
        message: 'Este enlace de autorización expiró.',
      }
    }

    if (status !== OrderClaimTransferRequestStatus.PENDING) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        orderNumber: transfer.order.orderNumber,
        message: 'Este enlace ya no es válido.',
      }
    }

    if (transfer.order.userId) {
      return {
        success: false,
        status: 'ORDER_ALREADY_CLAIMED',
        orderNumber: transfer.order.orderNumber,
        message: 'Este pedido ya está vinculado a otra cuenta.',
      }
    }

    const now = new Date()

    await prisma.$transaction(async (tx) => {
      const current = await tx.orderClaimTransferRequest.findUnique({
        where: { id: transfer.id },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              userId: true,
              shippingAddressId: true,
              billingAddressId: true,
              guestSessionId: true,
            },
          },
        },
      })

      if (!current || current.status !== OrderClaimTransferRequestStatus.PENDING) {
        throw new Error('ALREADY_USED')
      }

      if (isTransferExpired(current.expiresAt)) {
        await tx.orderClaimTransferRequest.update({
          where: { id: current.id },
          data: { status: OrderClaimTransferRequestStatus.EXPIRED },
        })
        throw new Error('TOKEN_EXPIRED')
      }

      if (current.order.userId) {
        throw new Error('ORDER_ALREADY_CLAIMED')
      }

      await linkGuestOrderToUser(tx, {
        order: current.order,
        userId: current.requestedByUserId,
        eventMessage: 'Orden vinculada tras autorización del correo de compra.',
      })

      await tx.orderClaimTransferRequest.update({
        where: { id: current.id },
        data: {
          status: OrderClaimTransferRequestStatus.APPROVED,
          consumedAt: now,
        },
      })
    })

    return {
      success: true,
      status: 'APPROVED',
      orderNumber: transfer.order.orderNumber,
      message: 'Pedido vinculado correctamente a la cuenta solicitante.',
    }
  } catch (error) {
    const code = error instanceof Error ? error.message : 'ERROR'

    if (code === 'ALREADY_USED') {
      return {
        success: false,
        status: 'ALREADY_USED',
        message: 'Esta autorización ya fue utilizada.',
      }
    }

    if (code === 'TOKEN_EXPIRED') {
      return {
        success: false,
        status: 'TOKEN_EXPIRED',
        message: 'Este enlace de autorización expiró.',
      }
    }

    if (code === 'ORDER_ALREADY_CLAIMED') {
      return {
        success: false,
        status: 'ORDER_ALREADY_CLAIMED',
        message: 'Este pedido ya está vinculado a otra cuenta.',
      }
    }

    return {
      success: false,
      status: 'ERROR',
      message: 'No pudimos autorizar la vinculación. Intenta de nuevo.',
    }
  }
}

/**
 * Cancels a pending transfer request without linking the order.
 */
export async function cancelOrderClaimTransfer(
  token: string,
): Promise<ApproveOrderClaimTransferResult> {
  try {
    const transfer = await loadTransferByToken(token)
    if (!transfer || transfer.order.deletedAt) {
      return {
        success: false,
        status: 'TOKEN_INVALID',
        message: 'Este enlace ya no es válido.',
      }
    }

    if (transfer.status === OrderClaimTransferRequestStatus.APPROVED || transfer.consumedAt) {
      return {
        success: false,
        status: 'ALREADY_USED',
        orderNumber: transfer.order.orderNumber,
        message: 'Esta autorización ya fue utilizada.',
      }
    }

    const status = await markExpiredIfNeeded(transfer.id, transfer.expiresAt, transfer.status)

    if (status === OrderClaimTransferRequestStatus.EXPIRED || isTransferExpired(transfer.expiresAt)) {
      return {
        success: false,
        status: 'TOKEN_EXPIRED',
        orderNumber: transfer.order.orderNumber,
        message: 'Este enlace de autorización expiró.',
      }
    }

    if (status !== OrderClaimTransferRequestStatus.PENDING) {
      return {
        success: false,
        status: 'ALREADY_USED',
        orderNumber: transfer.order.orderNumber,
        message: 'Esta solicitud ya no puede cancelarse.',
      }
    }

    await prisma.orderClaimTransferRequest.update({
      where: { id: transfer.id },
      data: {
        status: OrderClaimTransferRequestStatus.CANCELLED,
        consumedAt: new Date(),
      },
    })

    return {
      success: true,
      status: 'CANCELLED',
      orderNumber: transfer.order.orderNumber,
      message: 'Solicitud cancelada. El pedido no fue vinculado.',
    }
  } catch {
    return {
      success: false,
      status: 'ERROR',
      message: 'No pudimos cancelar la solicitud. Intenta de nuevo.',
    }
  }
}
