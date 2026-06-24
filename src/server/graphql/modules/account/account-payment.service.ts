import 'server-only'

import { GraphQLError } from 'graphql'

import { createCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import {
  buildAccountPaymentStatusPayload,
  syncOrderPaymentWithConekta,
} from '@/src/server/payments/verify-order-payment.service'

import type { GraphQLContext } from '../../context'
import { requireAuthenticatedAccount } from './account.auth'
import {
  resolveAccountPaymentActions,
  type OrderWithPaymentAttempts,
} from './account-payment-actions'
import { startConektaCheckoutForOrder } from '../payments/payments.service'
import type { AccountPaymentStatusPayloadGql } from './account.types'

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

async function loadOwnedOrder(
  context: GraphQLContext,
  orderNumber: string,
): Promise<OrderWithPaymentAttempts> {
  const userId = requireAuthenticatedAccount(context)

  const order = await context.prisma.order.findFirst({
    where: {
      orderNumber: orderNumber.trim(),
      userId,
      deletedAt: null,
    },
    include: orderInclude,
  })

  if (!order) {
    throw new GraphQLError('Pedido no encontrado.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }

  return order as OrderWithPaymentAttempts
}

/**
 * Manually reconciles an owned order's payment status with Conekta (fallback to webhook).
 */
export async function verifyMyOrderPayment(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AccountPaymentStatusPayloadGql> {
  const order = await loadOwnedOrder(context, orderNumber)
  const { payload } = await syncOrderPaymentWithConekta(context, order)
  return payload
}

/**
 * Retries Conekta checkout for an owned order without creating a new order.
 */
export async function retryMyOrderPayment(
  context: GraphQLContext,
  orderNumber: string,
): Promise<AccountPaymentStatusPayloadGql> {
  const order = await loadOwnedOrder(context, orderNumber)
  const actions = resolveAccountPaymentActions(order)

  if (!actions.canRetryPayment) {
    throw new GraphQLError('Este pedido no admite un nuevo intento de pago.', {
      extensions: { code: 'BAD_REQUEST' },
    })
  }

  const { token: returnToken } = await createCheckoutReturnToken({
    orderId: order.id,
  })

  let conekta
  try {
    conekta = await startConektaCheckoutForOrder(context, {
      orderId: order.id,
      returnToken,
      source: 'retryMyOrderPayment',
    })
  } catch (error) {
    if (error instanceof GraphQLError) {
      throw error
    }
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  if (!conekta.checkoutUrl) {
    throw new GraphQLError('No pudimos preparar el pago. Intenta nuevamente.', {
      extensions: { code: 'CONEKTA_ERROR' },
    })
  }

  const refreshed = await loadOwnedOrder(context, orderNumber)

  return buildAccountPaymentStatusPayload(
    refreshed,
    'Preparamos un nuevo enlace de pago. Serás redirigido a Conekta.',
    conekta.checkoutUrl,
  )
}
