import { GraphQLError } from 'graphql'

import { routes } from '@/src/config/routes'
import type { GraphQLContext } from '../../context'
import {
  validateOrderClaimToken,
} from '@/src/server/orders/order-claim-token'
import { linkGuestOrderToUser } from '@/src/server/orders/link-guest-order-to-user'

import { mapOrderClaimPreview } from './order-claim.mappers'
import type { OrderClaimPayloadGql, OrderClaimPreviewGql } from './order-claim.types'
import { orderClaimTokenSchema } from './order-claim.validation'

const orderClaimInclude = {
  payments: { orderBy: { createdAt: 'desc' as const }, take: 1 },
} as const

/**
 * Returns minimal preview data for a valid claim token (no order items or totals).
 */
export async function getOrderClaimPreview(
  context: GraphQLContext,
  token: string,
): Promise<OrderClaimPreviewGql | null> {
  const parsed = orderClaimTokenSchema.safeParse(token)
  if (!parsed.success) return null

  const validation = await validateOrderClaimToken(parsed.data)
  if (!validation.valid || !validation.order || !validation.expiresAt) {
    return null
  }

  const order = await context.prisma.order.findUnique({
    where: { id: validation.order.id, deletedAt: null },
    include: orderClaimInclude,
  })

  if (!order) return null

  return mapOrderClaimPreview(order, validation.expiresAt)
}

/**
 * Links a guest order to the authenticated user after validating the claim token and email match.
 */
export async function claimOrder(
  context: GraphQLContext,
  token: string,
): Promise<OrderClaimPayloadGql> {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para reclamar tu pedido.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  const parsed = orderClaimTokenSchema.safeParse(token)
  if (!parsed.success) {
    return {
      success: false,
      orderNumber: null,
      redirectTo: null,
      message: 'Este enlace ya no es válido.',
    }
  }

  const validation = await validateOrderClaimToken(parsed.data)
  if (!validation.valid || !validation.order || !validation.claimTokenId) {
    const message =
      validation.reason === 'EXPIRED' || validation.reason === 'USED'
        ? 'Este enlace ya no es válido.'
        : 'Este enlace ya no es válido.'
    return {
      success: false,
      orderNumber: validation.order?.orderNumber ?? null,
      redirectTo: null,
      message,
    }
  }

  const order = await context.prisma.order.findFirst({
    where: { id: validation.order.id, deletedAt: null },
    include: {
      payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      shippingAddress: true,
      billingAddress: true,
    },
  })

  if (!order) {
    return {
      success: false,
      orderNumber: null,
      redirectTo: null,
      message: 'Este enlace ya no es válido.',
    }
  }

  const sessionEmail = context.currentUser.email.trim().toLowerCase()
  const orderEmail = order.customerEmail.trim().toLowerCase()

  if (sessionEmail !== orderEmail) {
    return {
      success: false,
      orderNumber: order.orderNumber,
      redirectTo: null,
      message: 'Esta orden pertenece a otro correo.',
    }
  }

  if (!context.currentUser.emailVerified) {
    return {
      success: false,
      orderNumber: order.orderNumber,
      redirectTo: null,
      message: 'Verifica tu correo para reclamar este pedido.',
    }
  }

  if (order.userId) {
    if (order.userId === context.currentUser.id) {
      return {
        success: true,
        orderNumber: order.orderNumber,
        redirectTo: routes.accountOrderDetail(order.orderNumber),
        message: null,
      }
    }

    throw new GraphQLError('Este pedido ya está vinculado a otra cuenta.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  const userId = context.currentUser.id
  const redirectTo = routes.accountOrderDetail(order.orderNumber)

  await context.prisma.$transaction(async (tx) => {
    await linkGuestOrderToUser(tx, {
      order,
      userId,
      eventMessage: 'Orden vinculada a cuenta de cliente.',
    })

    await tx.orderClaimToken.update({
      where: { id: validation.claimTokenId },
      data: { usedAt: new Date() },
    })
  })

  return {
    success: true,
    orderNumber: order.orderNumber,
    redirectTo,
    message: null,
  }
}
