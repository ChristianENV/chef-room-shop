import type { Order, OrderItem, Payment, PaymentMethod } from '@prisma/client'

import { buildAccountOrderUrl } from '@/src/server/email/email.links'

import type {
  CheckoutOrderPayloadGql,
  CompleteCheckoutPayloadGql,
  OrderWithCheckoutRelations,
  PublicOrderGql,
  PublicOrderItemGql,
  PublicOrderPaymentGql,
} from './checkout.types'

type ProductSnapshot = {
  name?: string
  slug?: string
  sku?: string
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function itemDisplayName(item: OrderItem): string {
  const snapshot = parseJsonRecord(item.productSnapshotJson) as ProductSnapshot
  return snapshot.name ?? 'Producto'
}

function derivePaymentStatus(payments: Payment[]): string {
  return payments[0]?.status ?? 'PENDING'
}

/**
 * Maps an order line to the public GraphQL item shape.
 */
export function mapOrderItemToPublicGql(item: OrderItem): PublicOrderItemGql {
  return {
    id: item.id,
    name: itemDisplayName(item),
    quantity: item.quantity,
    totalPriceCents: item.lineTotalCents,
    customizationPriceCents: item.customizationPriceCents,
    productSnapshotJson: item.productSnapshotJson,
    designSnapshotJson: item.designSnapshotJson,
  }
}

/**
 * Maps a payment row to the public GraphQL payment shape (no raw payloads).
 */
export function mapPaymentToPublicGql(payment: Payment): PublicOrderPaymentGql {
  return {
    id: payment.id,
    provider: payment.provider,
    method: payment.method ?? 'OTHER',
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
  }
}

/**
 * Maps a Prisma order to the guest/public confirmation shape.
 */
export function mapOrderToPublicOrder(order: OrderWithCheckoutRelations): PublicOrderGql {
  const paymentStatus = derivePaymentStatus(order.payments)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    customizationTotalCents: order.customizationTotalCents,
    shippingCostCents: order.shippingCents,
    discountTotalCents: order.discountCents,
    taxTotalCents: order.taxCents,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    items: order.items.map(mapOrderItemToPublicGql),
    payments: order.payments.map(mapPaymentToPublicGql),
  }
}

/**
 * Maps a created order to the checkout mutation payload.
 */
export function mapOrderToCheckoutPayload(
  order: Order,
  payments: Payment[],
  tracking?: { claimUrl?: string | null; accountOrderUrl?: string | null },
): CheckoutOrderPayloadGql {
  return {
    orderNumber: order.orderNumber,
    orderId: order.id,
    status: order.status,
    paymentStatus: derivePaymentStatus(payments),
    totalCents: order.totalCents,
    shippingCents: order.shippingCents,
    currency: order.currency,
    claimUrl: tracking?.claimUrl ?? null,
    accountOrderUrl:
      tracking?.accountOrderUrl ??
      (order.userId ? buildAccountOrderUrl(order.orderNumber) : null),
  }
}

/**
 * Maps order + Conekta redirect to completeCheckout payload.
 */
export function mapOrderToCompleteCheckoutPayload(params: {
  order: Order
  payments: Payment[]
  paymentMethod: PaymentMethod | string
  paymentRedirectUrl: string
  paymentProviderOrderId: string | null
  returnToken: string
  successUrl: string
  claimUrl: string | null
  accountOrderUrl: string | null
}): CompleteCheckoutPayloadGql {
  const base = mapOrderToCheckoutPayload(params.order, params.payments, {
    claimUrl: params.claimUrl,
    accountOrderUrl: params.accountOrderUrl,
  })

  return {
    ...base,
    paymentRedirectUrl: params.paymentRedirectUrl,
    paymentProviderOrderId: params.paymentProviderOrderId,
    paymentMethod: String(params.paymentMethod),
    successUrl: params.successUrl,
    returnToken: params.returnToken,
  }
}
