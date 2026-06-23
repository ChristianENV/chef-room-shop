import 'server-only'

import { GraphQLError } from 'graphql'

import { validateCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import { maskCustomerEmail } from '@/src/server/orders/order-claim-token'
import {
  buildAccountPaymentStatusPayload,
  syncOrderPaymentWithConekta,
} from '@/src/server/payments/verify-order-payment.service'

import type { GraphQLContext } from '../../context'
import { mapOrderToGql } from '../account/account.mappers'
import type { AccountOrderGql } from '../account/account.types'
import type { OrderWithPaymentAttempts } from '../account/account-payment-actions'

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      attempts: { orderBy: { createdAt: 'desc' as const }, take: 5 },
    },
  },
  shipments: { orderBy: { createdAt: 'asc' as const } },
  events: { orderBy: { createdAt: 'asc' as const } },
} as const

export type CheckoutOrderDetailAccessGql = {
  order: AccountOrderGql
  returnTokenValid: boolean
  tokenExpired: boolean
  viewerEmailMatchesOrder: boolean
  maskedCustomerEmail: string
}

function viewerEmailMatchesOrder(context: GraphQLContext, orderEmail: string): boolean {
  const viewerEmail = context.currentUser?.email?.trim().toLowerCase()
  if (!viewerEmail) return false
  return viewerEmail === orderEmail.trim().toLowerCase()
}

async function loadOrderForCheckoutToken(
  context: GraphQLContext,
  orderNumber: string,
  token: string,
): Promise<{
  order: OrderWithPaymentAttempts
  returnTokenValid: boolean
  tokenExpired: boolean
}> {
  const trimmedToken = token.trim()
  const trimmedOrderNumber = orderNumber.trim()

  if (!trimmedToken || !trimmedOrderNumber) {
    throw new GraphQLError('Enlace de pedido inválido.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  const validation = await validateCheckoutReturnToken(trimmedToken)
  if (!validation.order) {
    throw new GraphQLError('Enlace de pedido inválido o expirado.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  if (validation.order.orderNumber !== trimmedOrderNumber) {
    throw new GraphQLError('El enlace no corresponde a este pedido.', {
      extensions: { code: 'FORBIDDEN' },
    })
  }

  const order = await context.prisma.order.findFirst({
    where: { id: validation.order.id, deletedAt: null },
    include: orderInclude,
  })

  if (!order) {
    throw new GraphQLError('Pedido no encontrado.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  return {
    order: order as OrderWithPaymentAttempts,
    returnTokenValid: validation.valid,
    tokenExpired: validation.reason === 'EXPIRED',
  }
}

/**
 * Token-scoped order detail for post-checkout guest access.
 */
export async function getOrderByCheckoutToken(
  context: GraphQLContext,
  orderNumber: string,
  token: string,
): Promise<CheckoutOrderDetailAccessGql> {
  const { order, returnTokenValid, tokenExpired } = await loadOrderForCheckoutToken(
    context,
    orderNumber,
    token,
  )

  return {
    order: mapOrderToGql(order as Parameters<typeof mapOrderToGql>[0]),
    returnTokenValid,
    tokenExpired,
    viewerEmailMatchesOrder: viewerEmailMatchesOrder(context, order.customerEmail),
    maskedCustomerEmail: maskCustomerEmail(order.customerEmail),
  }
}

/**
 * Token-scoped Conekta payment verification (same sync as verifyMyOrderPayment).
 */
export async function verifyCheckoutPaymentByToken(
  context: GraphQLContext,
  orderNumber: string,
  token: string,
) {
  const { order } = await loadOrderForCheckoutToken(context, orderNumber, token)
  const { payload } = await syncOrderPaymentWithConekta(context, order)
  return payload
}

export { buildAccountPaymentStatusPayload }
