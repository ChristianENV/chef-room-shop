import {
  type Address,
  type Order,
  type OrderEvent,
  type OrderItem,
  type Payment,
  type Shipment,
  type User,
  OrderStatus,
  PaymentStatus,
} from '@prisma/client'

import { derivePaymentStatus, resolveCustomerName } from '../admin-dashboard/admin-dashboard.mappers'
import type {
  AdminOrderAddressGql,
  AdminOrderCustomerGql,
  AdminOrderEventGql,
  AdminOrderGql,
  AdminOrderItemGql,
  AdminOrderPaymentGql,
  AdminOrderShipmentGql,
  AdminProductionSheetGql,
} from './admin-orders.types'

export type AdminOrderWithRelations = Order & {
  user: User | null
  items: OrderItem[]
  payments: Payment[]
  shipments: Shipment[]
  events: OrderEvent[]
  shippingAddress: Address | null
  billingAddress: Address | null
}

type ProductSnapshot = {
  name?: string
  slug?: string
  sku?: string
  productId?: string
  productVariantId?: string
  variantId?: string
}

type EventMetadata = {
  actorName?: string
}

function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null
}

function parseJsonRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  return value as Record<string, unknown>
}

function splitFullName(fullName: string): {
  firstName: string | null
  lastName: string | null
} {
  const parts = fullName.trim().split(/\s+/)
  if (parts.length === 0) return { firstName: null, lastName: null }
  if (parts.length === 1) return { firstName: parts[0], lastName: null }
  return { firstName: parts[0], lastName: parts.slice(1).join(' ') }
}

function itemHasCustomDesign(item: OrderItem): boolean {
  if (item.designId) return true
  return item.designSnapshotJson != null
}

/**
 * Returns whether any line item includes customization.
 */
export function orderHasCustomDesign(items: OrderItem[]): boolean {
  return items.some(itemHasCustomDesign)
}

function mapAddressToGql(address: Address): AdminOrderAddressGql {
  const { firstName, lastName } = splitFullName(address.fullName)
  return {
    id: address.id,
    type: address.type,
    firstName,
    lastName,
    phone: address.phone,
    line1: address.line1,
    line2: address.line2,
    label: address.label,
    city: address.city,
    state: address.state,
    country: address.country,
    postalCode: address.postalCode,
  }
}

function mapCustomer(order: AdminOrderWithRelations): AdminOrderCustomerGql {
  return {
    userId: order.userId,
    name: resolveCustomerName(order.user) ?? order.customerEmail.split('@')[0],
    email: order.customerEmail,
    phone: order.customerPhone ?? order.user?.phone ?? null,
  }
}

function mapOrderItemToGql(item: OrderItem): AdminOrderItemGql {
  const snapshot = parseJsonRecord(item.productSnapshotJson) as ProductSnapshot
  return {
    id: item.id,
    productId: snapshot.productId ?? null,
    productVariantId: snapshot.productVariantId ?? snapshot.variantId ?? null,
    designId: item.designId,
    name: snapshot.name?.trim() || 'Producto',
    sku: snapshot.sku ?? snapshot.slug ?? null,
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    customizationPriceCents: item.customizationPriceCents,
    lineTotalCents: item.lineTotalCents,
    productSnapshotJson: item.productSnapshotJson,
    designSnapshotJson: item.designSnapshotJson,
    productionNotes: null,
    hasCustomDesign: itemHasCustomDesign(item),
  }
}

function mapPaymentToGql(payment: Payment): AdminOrderPaymentGql {
  return {
    id: payment.id,
    provider: payment.provider,
    providerOrderId: payment.providerOrderId,
    method: payment.method ?? 'OTHER',
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    paidAt: toIso(payment.paidAt),
    expiresAt: null,
    createdAt: payment.createdAt.toISOString(),
  }
}

function mapShipmentToGql(shipment: Shipment): AdminOrderShipmentGql {
  return {
    id: shipment.id,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    shippedAt: toIso(shipment.shippedAt),
    deliveredAt: toIso(shipment.deliveredAt),
    createdAt: shipment.createdAt.toISOString(),
  }
}

function mapEventToGql(event: OrderEvent): AdminOrderEventGql {
  const metadata = parseJsonRecord(event.metadataJson) as EventMetadata
  return {
    id: event.id,
    type: event.type,
    message: event.message,
    createdAt: event.createdAt.toISOString(),
    actorName: metadata.actorName ?? null,
  }
}

/**
 * Maps a Prisma order graph to the admin GraphQL order type (no sensitive payment payloads).
 */
export function mapOrderToAdminGql(order: AdminOrderWithRelations): AdminOrderGql {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customer: mapCustomer(order),
    status: order.status,
    paymentStatus: derivePaymentStatus(order),
    fulfillmentStatus: order.fulfillmentStatus,
    currency: order.currency,
    subtotalCents: order.subtotalCents,
    customizationTotalCents: order.customizationTotalCents,
    shippingCents: order.shippingCents,
    discountCents: order.discountCents,
    taxCents: order.taxCents,
    totalCents: order.totalCents,
    notes: order.notes,
    placedAt: toIso(order.placedAt),
    createdAt: order.createdAt.toISOString(),
    updatedAt: order.updatedAt.toISOString(),
    shippingAddress: order.shippingAddress
      ? mapAddressToGql(order.shippingAddress)
      : null,
    billingAddress: order.billingAddress ? mapAddressToGql(order.billingAddress) : null,
    items: order.items.map(mapOrderItemToGql),
    payments: order.payments.map(mapPaymentToGql),
    shipments: order.shipments.map(mapShipmentToGql),
    events: order.events.map(mapEventToGql),
    hasCustomDesign: orderHasCustomDesign(order.items),
  }
}

/**
 * Maps order data to a production sheet payload.
 */
export function mapOrderToProductionSheetGql(
  order: AdminOrderWithRelations,
): AdminProductionSheetGql {
  return {
    orderNumber: order.orderNumber,
    customerName: resolveCustomerName(order.user),
    customerEmail: order.customerEmail,
    items: order.items.map(mapOrderItemToGql),
    notes: order.notes,
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Returns true when order is paid enough to enter production workflow.
 */
export function canMoveToProduction(order: AdminOrderWithRelations): boolean {
  const paymentStatus = derivePaymentStatus(order)
  if (paymentStatus === PaymentStatus.PAID) return true
  return (
    order.status === OrderStatus.PAID ||
    order.status === OrderStatus.IN_PRODUCTION ||
    order.status === OrderStatus.READY_TO_SHIP
  )
}
