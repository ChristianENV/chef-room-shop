import type { AccountOrder, AccountOrderItem } from '@/src/features/storefront/account/types'
import type {
  CheckoutResult,
  PublicOrder,
  PublicOrderItem,
} from '@/src/features/storefront/checkout/types'

function mapPublicItemToAccountItem(item: PublicOrderItem): AccountOrderItem {
  const unitPriceCents =
    item.quantity > 0 ? Math.round(item.totalPriceCents / item.quantity) : item.totalPriceCents

  return {
    id: item.id,
    name: item.name,
    sku: null,
    quantity: item.quantity,
    unitPriceCents,
    customizationPriceCents: item.customizationPriceCents,
    totalPriceCents: item.totalPriceCents,
    productSnapshotJson: item.productSnapshotJson,
    designSnapshotJson: item.designSnapshotJson,
  }
}

/**
 * Maps token-scoped checkout result to the shared account order detail view model.
 */
export function mapCheckoutResultToOrderDetailViewModel(result: CheckoutResult): AccountOrder {
  return {
    id: result.orderId,
    orderNumber: result.orderNumber,
    status: result.status,
    paymentStatus: result.paymentStatus,
    fulfillmentStatus: result.fulfillmentStatus,
    customerEmail: result.maskedCustomerEmail,
    totalCents: result.totalCents,
    currency: result.currency,
    placedAt: result.placedAt ?? null,
    createdAt: result.createdAt,
    subtotalCents: result.subtotalCents,
    customizationTotalCents: result.customizationTotalCents ?? 0,
    shippingCostCents: result.shippingCents,
    discountTotalCents: result.discountTotalCents ?? 0,
    taxTotalCents: result.taxTotalCents ?? 0,
    items: result.items.map(mapPublicItemToAccountItem),
    payments: result.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      method: payment.method,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paidAt: payment.paidAt ?? null,
      expiresAt: payment.expiresAt ?? null,
    })),
    shipments: result.shipments ?? [],
    events: result.events ?? [],
    paymentActions: result.paymentActions,
  }
}

/**
 * Maps legacy email+orderNumber public order to the shared detail view model.
 */
export function mapPublicOrderToOrderDetailViewModel(order: PublicOrder): AccountOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    status: order.status,
    paymentStatus: order.paymentStatus,
    fulfillmentStatus: order.fulfillmentStatus,
    customerEmail: order.customerEmail,
    customerPhone: order.customerPhone,
    totalCents: order.totalCents,
    currency: order.currency,
    placedAt: null,
    createdAt: order.createdAt,
    subtotalCents: order.subtotalCents,
    customizationTotalCents: order.customizationTotalCents,
    shippingCostCents: order.shippingCostCents,
    discountTotalCents: order.discountTotalCents,
    taxTotalCents: order.taxTotalCents,
    items: order.items.map(mapPublicItemToAccountItem),
    payments: order.payments.map((payment) => ({
      id: payment.id,
      provider: payment.provider,
      method: payment.method,
      status: payment.status,
      amountCents: payment.amountCents,
      currency: payment.currency,
      paidAt: payment.paidAt ?? null,
      expiresAt: payment.expiresAt ?? null,
    })),
    shipments: [],
    events: [],
  }
}
