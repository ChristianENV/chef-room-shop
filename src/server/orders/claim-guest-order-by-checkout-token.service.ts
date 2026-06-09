import 'server-only'

import { GraphQLError } from 'graphql'

import { validateCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import { prisma } from '@/src/server/db/prisma'
import type { GraphQLContext } from '@/src/server/graphql/context'

import { linkGuestOrderToUser } from './link-guest-order-to-user'

export type ClaimGuestOrderStatus =
  | 'CLAIMED'
  | 'ALREADY_CLAIMED_BY_USER'
  | 'EMAIL_VERIFICATION_REQUIRED'
  | 'EMAIL_MISMATCH'
  | 'TOKEN_INVALID'
  | 'TOKEN_EXPIRED'
  | 'ORDER_ALREADY_CLAIMED'
  | 'UNAUTHENTICATED'

export type ClaimGuestOrderResult = {
  success: boolean
  status: ClaimGuestOrderStatus
  orderNumber?: string
  message?: string
}

function normalizeEmail(email: string): string {
  return email.trim().toLowerCase()
}

/**
 * Links a guest checkout order to the authenticated user when checkout token + email match.
 */
export async function claimGuestOrderByCheckoutToken(input: {
  token: string
  orderNumber: string
  userId?: string | null
  userEmail?: string | null
  emailVerified?: boolean
  requireVerifiedEmail?: boolean
}): Promise<ClaimGuestOrderResult> {
  const trimmedToken = input.token.trim()
  const trimmedOrderNumber = input.orderNumber.trim()
  const requireVerifiedEmail = input.requireVerifiedEmail ?? true

  if (!input.userId || !input.userEmail) {
    return {
      success: false,
      status: 'UNAUTHENTICATED',
      message: 'Debes iniciar sesión para guardar este pedido en tu cuenta.',
    }
  }

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
      orderNumber: validation.order.orderNumber,
      message: 'El enlace de pedido expiró. Contacta a soporte si necesitas ayuda.',
    }
  }

  if (!validation.valid) {
    return {
      success: false,
      status: 'TOKEN_INVALID',
      orderNumber: validation.order.orderNumber,
      message: 'El enlace de pedido no es válido.',
    }
  }

  if (validation.order.orderNumber !== trimmedOrderNumber) {
    return {
      success: false,
      status: 'TOKEN_INVALID',
      orderNumber: trimmedOrderNumber,
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
      shippingAddressId: true,
      billingAddressId: true,
      guestSessionId: true,
    },
  })

  if (!order) {
    return {
      success: false,
      status: 'TOKEN_INVALID',
      orderNumber: trimmedOrderNumber,
      message: 'No encontramos este pedido.',
    }
  }

  if (order.userId) {
    if (order.userId === input.userId) {
      return {
        success: true,
        status: 'ALREADY_CLAIMED_BY_USER',
        orderNumber: order.orderNumber,
        message: 'Este pedido ya está en tu cuenta.',
      }
    }

    return {
      success: false,
      status: 'ORDER_ALREADY_CLAIMED',
      orderNumber: order.orderNumber,
      message: 'Este pedido ya está vinculado a otra cuenta.',
    }
  }

  const sessionEmail = normalizeEmail(input.userEmail)
  const orderEmail = normalizeEmail(order.customerEmail)

  if (sessionEmail !== orderEmail) {
    return {
      success: false,
      status: 'EMAIL_MISMATCH',
      orderNumber: order.orderNumber,
      message:
        'Esta compra fue realizada con otro correo. El pedido seguirá como compra invitada y no aparecerá en Mis pedidos.',
    }
  }

  if (requireVerifiedEmail && !input.emailVerified) {
    return {
      success: false,
      status: 'EMAIL_VERIFICATION_REQUIRED',
      orderNumber: order.orderNumber,
      message: 'Verifica tu correo para guardar este pedido en tu cuenta.',
    }
  }

  const userId = input.userId

  await prisma.$transaction(async (tx) => {
    await linkGuestOrderToUser(tx, {
      order,
      userId,
      eventMessage: 'Orden vinculada desde flujo post-compra.',
    })
  })

  return {
    success: true,
    status: 'CLAIMED',
    orderNumber: order.orderNumber,
    message: 'Pedido guardado en tu cuenta.',
  }
}

/**
 * GraphQL entry point for post-checkout guest order claim.
 */
export async function claimGuestOrderByCheckoutTokenForGraphQL(
  context: GraphQLContext,
  orderNumber: string,
  token: string,
): Promise<ClaimGuestOrderResult> {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para guardar este pedido.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  const result = await claimGuestOrderByCheckoutToken({
    token,
    orderNumber,
    userId: context.currentUser.id,
    userEmail: context.currentUser.email,
    emailVerified: context.currentUser.emailVerified,
  })

  if (result.status === 'ORDER_ALREADY_CLAIMED') {
    throw new GraphQLError(result.message ?? 'Este pedido ya está vinculado a otra cuenta.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  return result
}
