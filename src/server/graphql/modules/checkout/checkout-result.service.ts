import { PaymentMethod } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { CASH_PAYMENT_LOCATIONS } from '@/src/config/payment-vars'
import { routes } from '@/src/config/routes'
import { validateCheckoutReturnToken } from '@/src/server/checkout/checkout-return-token'
import { buildAccountOrderUrl } from '@/src/server/email/email.links'

import type { GraphQLContext } from '../../context'
import {
  mapOrderItemToPublicGql,
  mapPaymentToPublicGql,
} from './checkout.mappers'
import type { CheckoutResultGql } from './checkout.types'
import { getCashPaymentDetailsFromAttempts } from '../payments/payments.mappers'

const orderInclude = {
  items: { orderBy: { createdAt: 'asc' as const } },
  payments: {
    orderBy: { createdAt: 'desc' as const },
    include: {
      attempts: { orderBy: { createdAt: 'desc' as const }, take: 5 },
    },
  },
  checkoutReturnToken: true,
} as const

function derivePaymentStatus(
  payments: Array<{ status: string }>,
): string {
  return payments[0]?.status ?? 'PENDING'
}

/**
 * Public checkout result by opaque return token (no session/email required).
 */
export async function getCheckoutResultByToken(
  context: GraphQLContext,
  token: string,
): Promise<CheckoutResultGql | null> {
  const trimmed = token.trim()
  if (!trimmed) return null

  const validation = await validateCheckoutReturnToken(trimmed)
  if (!validation.order) return null

  const order = await context.prisma.order.findFirst({
    where: { id: validation.order.id, deletedAt: null },
    include: orderInclude,
  })

  if (!order) return null

  const paymentStatus = derivePaymentStatus(order.payments)
  const primaryPayment = order.payments[0]
  const cashDetails = primaryPayment
    ? getCashPaymentDetailsFromAttempts(primaryPayment.attempts)
    : null

  const accountOrderUrl = order.userId
    ? buildAccountOrderUrl(order.orderNumber)
    : null

  const isAuthenticatedOwner =
    Boolean(context.currentUser) && context.currentUser?.id === order.userId

  const canViewDetails = isAuthenticatedOwner

  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    status: order.status,
    paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    totalCents: order.totalCents,
    shippingCents: order.shippingCents,
    currency: order.currency,
    paymentMethod: primaryPayment?.method ?? 'CARD',
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(mapOrderItemToPublicGql),
    payments: order.payments.map(mapPaymentToPublicGql),
    claimUrl: null,
    accountOrderUrl,
    canViewDetails,
    detailUrl: canViewDetails ? accountOrderUrl : null,
    paymentReference: cashDetails?.reference ?? null,
    paymentExpiresAt: cashDetails?.expiresAt ?? null,
    cashPaymentLocations:
      primaryPayment?.method === PaymentMethod.OXXO
        ? [...CASH_PAYMENT_LOCATIONS]
        : null,
    returnTokenValid: validation.valid,
    tokenExpired: validation.reason === 'EXPIRED',
    loginUrl: routes.login,
    registerUrl: routes.register,
  }
}

/**
 * Validates token exists for GraphQL errors (throws when invalid for mutations).
 */
export async function assertValidCheckoutReturnToken(token: string): Promise<string> {
  const validation = await validateCheckoutReturnToken(token.trim())
  if (!validation.valid || !validation.order) {
    throw new GraphQLError('Enlace de pago expirado o inválido.', {
      extensions: { code: 'NOT_FOUND' },
    })
  }
  return token.trim()
}
