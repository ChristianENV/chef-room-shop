import {
  type Design,
  type Order,
  type OrderItem,
  type Payment,
  type User,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
} from '@prisma/client'

import type {
  AdminDashboardMetricsGql,
  AdminProductionQueueItemGql,
  AdminRecentDesignGql,
  AdminRecentOrderGql,
  AdminRecentPaymentGql,
  AdminTopProductGql,
} from './admin-dashboard.types'

type OrderWithItems = Order & {
  items: OrderItem[]
  user: User | null
  payments: Payment[]
}

type OrderQueueRow = Order & {
  items: OrderItem[]
  user: User | null
}

type DesignWithUser = Design & {
  user: User | null
}

type PaymentWithOrder = Payment & {
  order: { orderNumber: string }
}

type ProductSnapshot = {
  slug?: string
  name?: string
  productId?: string
}

type DesignConfig = {
  productSlug?: string
  finalPriceCents?: number
}

type SnapshotCustomization = {
  customization?: string
  layers?: Array<{ type?: string }>
}

const PRODUCTION_ESTIMATE_DAYS = 7

/**
 * Start of the current calendar day (server local time).
 */
export function startOfToday(): Date {
  const d = new Date()
  d.setHours(0, 0, 0, 0)
  return d
}

/**
 * Start of the current calendar month (server local time).
 */
export function startOfMonth(): Date {
  const d = new Date()
  d.setDate(1)
  d.setHours(0, 0, 0, 0)
  return d
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

/**
 * Resolves display name from user profile fields.
 */
export function resolveCustomerName(user: User | null): string | null {
  if (!user) return null
  const fromParts = [user.firstName, user.lastName].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts
  return user.name?.trim() || null
}

/**
 * Uses latest payment status when present; otherwise falls back to order status.
 */
export function derivePaymentStatus(order: OrderWithItems): string {
  const latest = order.payments[0]
  if (latest) return latest.status
  if (order.status === OrderStatus.PENDING_PAYMENT) return PaymentStatus.PENDING
  if (order.status === OrderStatus.PAYMENT_FAILED) return PaymentStatus.FAILED
  if (order.status === OrderStatus.REFUNDED) return PaymentStatus.REFUNDED
  if (
    order.status === OrderStatus.PAID ||
    order.status === OrderStatus.IN_PRODUCTION ||
    order.status === OrderStatus.READY_TO_SHIP ||
    order.status === OrderStatus.SHIPPED ||
    order.status === OrderStatus.DELIVERED
  ) {
    return PaymentStatus.PAID
  }
  return PaymentStatus.PENDING
}

function productNameFromSnapshot(snapshot: ProductSnapshot): string {
  return snapshot.name?.trim() || snapshot.slug?.trim() || 'Producto'
}

/**
 * Extracts customization labels from order item snapshots (no raw configJson on designs).
 */
export function extractCustomizationTypes(items: OrderItem[]): string[] {
  const types = new Set<string>()

  for (const item of items) {
    if (item.designId) {
      types.add('custom-design')
    }
    if (item.customizationPriceCents > 0) {
      types.add('customization')
    }

    const snapshots = [item.designSnapshotJson, item.productSnapshotJson].filter(Boolean)
    for (const raw of snapshots) {
      const record = parseJsonRecord(raw) as SnapshotCustomization
      if (typeof record.customization === 'string' && record.customization.trim()) {
        types.add(record.customization.trim())
      }
      if (Array.isArray(record.layers)) {
        for (const layer of record.layers) {
          if (layer?.type?.trim()) types.add(layer.type.trim())
        }
      }
    }
  }

  return [...types]
}

function hasCustomDesign(items: OrderItem[]): boolean {
  return items.some(
    (item) =>
      item.designId != null || item.designSnapshotJson != null || item.customizationPriceCents > 0,
  )
}

/**
 * Placeholder ETA: order createdAt + 7 days (no dedicated field in schema).
 */
export function estimateDeliveryDate(createdAt: Date): string {
  const eta = new Date(createdAt)
  eta.setDate(eta.getDate() + PRODUCTION_ESTIMATE_DAYS)
  return eta.toISOString()
}

/**
 * Maps aggregated metrics row to GraphQL type.
 */
export function mapMetricsToGql(metrics: AdminDashboardMetricsGql): AdminDashboardMetricsGql {
  return metrics
}

/**
 * Maps order row to admin recent order GraphQL type.
 */
export function mapOrderToAdminRecent(order: OrderWithItems): AdminRecentOrderGql {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: resolveCustomerName(order.user),
    customerEmail: order.customerEmail,
    status: order.status,
    paymentStatus: derivePaymentStatus(order),
    fulfillmentStatus: order.fulfillmentStatus,
    totalCents: order.totalCents,
    createdAt: order.createdAt.toISOString(),
    itemCount: order.items.length,
    hasCustomDesign: hasCustomDesign(order.items),
  }
}

/**
 * Maps order row to production queue GraphQL type.
 */
export function mapOrderToProductionQueue(order: OrderQueueRow): AdminProductionQueueItemGql {
  const productNames = order.items.map((item) =>
    productNameFromSnapshot(parseJsonRecord(item.productSnapshotJson) as ProductSnapshot),
  )

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: resolveCustomerName(order.user),
    productNames: [...new Set(productNames)],
    customizationTypes: extractCustomizationTypes(order.items),
    status: order.status,
    fulfillmentStatus: order.fulfillmentStatus,
    estimatedDeliveryDate: estimateDeliveryDate(order.createdAt),
    createdAt: order.createdAt.toISOString(),
  }
}

/**
 * Maps design row to admin recent design GraphQL type.
 */
export function mapDesignToAdminRecent(
  design: DesignWithUser,
  productNameBySlug: Map<string, string>,
): AdminRecentDesignGql {
  const config = parseJsonRecord(design.configJson) as DesignConfig
  const slug = config.productSlug?.trim()
  const productName = (slug && productNameBySlug.get(slug)) || slug || 'Producto'

  return {
    id: design.id,
    name: design.name,
    status: design.status,
    previewUrl: design.previewUrl,
    productName,
    customerName: resolveCustomerName(design.user),
    customerEmail: design.user?.email ?? null,
    finalPriceCents: config.finalPriceCents ?? 0,
    updatedAt: design.updatedAt.toISOString(),
  }
}

/**
 * Maps payment row to admin recent payment GraphQL type (no raw webhook payloads).
 */
export function mapPaymentToAdminRecent(payment: PaymentWithOrder): AdminRecentPaymentGql {
  return {
    id: payment.id,
    orderNumber: payment.order.orderNumber,
    provider: payment.provider,
    method: payment.method ?? PaymentMethod.OTHER,
    status: payment.status,
    amountCents: payment.amountCents,
    currency: payment.currency,
    createdAt: payment.createdAt.toISOString(),
    paidAt: toIso(payment.paidAt),
  }
}

export type TopProductAggregate = {
  productId: string
  productName: string
  productSlug: string
  orderIds: Set<string>
  quantitySold: number
  revenueCents: number
  customizedCount: number
}

/**
 * Maps in-memory top product aggregates to GraphQL list (sorted by revenue desc).
 */
export function mapTopProductAggregates(
  aggregates: Map<string, TopProductAggregate>,
  limit: number,
): AdminTopProductGql[] {
  return [...aggregates.values()]
    .sort((a, b) => b.revenueCents - a.revenueCents)
    .slice(0, limit)
    .map((row) => ({
      productId: row.productId,
      productName: row.productName,
      productSlug: row.productSlug,
      orderCount: row.orderIds.size,
      quantitySold: row.quantitySold,
      revenueCents: row.revenueCents,
      customizedCount: row.customizedCount,
    }))
}
