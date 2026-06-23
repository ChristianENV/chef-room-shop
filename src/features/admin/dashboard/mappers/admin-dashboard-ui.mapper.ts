import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

import type { RecentDesign } from '@/src/features/admin/designs/recent-designs'
import type { AdminOrder } from '@/src/features/admin/orders/recent-orders-table'
import type { ProductionItem } from '@/src/features/admin/dashboard/production-queue'
import type {
  AdminDashboardMetrics,
  AdminProductionQueueItem,
  AdminRecentDesign,
  AdminRecentOrder,
} from '../types'

export type AdminMetricsUi = {
  ventasDia: string
  ventasMes: string
  ordenesPendientes: number
  ordenesPendientesSubtitle?: string
  disenosCreados: number
  carritosAbandonados: number
  ticketPromedio: string
}

const ORDER_STATUS_MAP: Record<string, AdminOrder['status']> = {
  PENDING_PAYMENT: 'pendiente',
  PAYMENT_FAILED: 'pendiente',
  PAID: 'pagado',
  IN_PRODUCTION: 'en-produccion',
  READY_TO_SHIP: 'en-produccion',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
  REFUNDED: 'cancelado',
}

const PAYMENT_STATUS_MAP: Record<string, AdminOrder['paymentStatus']> = {
  PENDING: 'pendiente',
  AUTHORIZED: 'pendiente',
  PAID: 'completado',
  FAILED: 'fallido',
  REFUNDED: 'fallido',
  PARTIALLY_REFUNDED: 'pendiente',
  CANCELLED: 'fallido',
}

const DESIGN_STATUS_MAP: Record<string, RecentDesign['status']> = {
  DRAFT: 'borrador',
  SAVED: 'borrador',
  ABANDONED: 'borrador',
  ARCHIVED: 'borrador',
  IN_CART: 'en-carrito',
  PURCHASED: 'comprado',
}

/**
 * Resolves display customer name with email fallback.
 */
export function resolveCustomerDisplayName(name: string | null | undefined, email: string): string {
  const trimmed = name?.trim()
  if (trimmed) return trimmed
  const local = email.split('@')[0]?.trim()
  return local || email
}

function mapOrderStatus(status: string): AdminOrder['status'] {
  return ORDER_STATUS_MAP[status] ?? 'pendiente'
}

function mapPaymentStatus(status: string): AdminOrder['paymentStatus'] {
  return PAYMENT_STATUS_MAP[status] ?? 'pendiente'
}

function mapDesignStatus(status: string): RecentDesign['status'] {
  return DESIGN_STATUS_MAP[status] ?? 'borrador'
}

function inferProductType(productName: string): ProductionItem['productType'] {
  const lower = productName.toLowerCase()
  if (lower.includes('mandil') || lower.includes('apron')) return 'mandil'
  if (lower.includes('pantalon') || lower.includes('pants')) return 'pantalon'
  return 'filipina'
}

function mapCustomizationType(types: string[]): ProductionItem['customizationType'] {
  if (types.length === 0) return 'ninguno'
  const first = types[0]?.toLowerCase() ?? ''
  if (first.includes('nombre')) return 'nombre'
  if (first.includes('inicial')) return 'iniciales'
  if (first.includes('logo') || first.includes('custom')) return 'logo'
  return 'logo'
}

function mapProductionStatus(orderStatus: string): ProductionItem['status'] {
  if (orderStatus === 'PAID') return 'nuevo'
  if (orderStatus === 'READY_TO_SHIP') return 'listo'
  if (orderStatus === 'IN_PRODUCTION') return 'en-produccion'
  return 'en-produccion'
}

function resolveEstimatedDelivery(estimatedDeliveryDate: string | null, createdAt: string): string {
  if (estimatedDeliveryDate) return estimatedDeliveryDate
  const base = new Date(createdAt)
  base.setDate(base.getDate() + 7)
  return base.toISOString()
}

/**
 * Maps BFF dashboard metrics to KPI card display values.
 */
export function mapMetricsToUi(metrics: AdminDashboardMetrics): AdminMetricsUi {
  return {
    ventasDia: formatCurrencyMXN(centsToPesos(metrics.salesTodayCents)),
    ventasMes: formatCurrencyMXN(centsToPesos(metrics.salesMonthCents)),
    ordenesPendientes: metrics.pendingOrders,
    ordenesPendientesSubtitle:
      metrics.pendingOrders > 0 ? `${metrics.pendingOrders} por confirmar` : undefined,
    disenosCreados: metrics.designsCreated,
    carritosAbandonados: metrics.abandonedCarts,
    ticketPromedio: formatCurrencyMXN(centsToPesos(metrics.averageOrderValueCents)),
  }
}

/**
 * Maps BFF recent order to admin orders table row shape.
 */
export function mapRecentOrderToUi(order: AdminRecentOrder): AdminOrder {
  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: resolveCustomerDisplayName(order.customerName, order.customerEmail),
    customerEmail: order.customerEmail,
    status: mapOrderStatus(order.status),
    paymentStatus: mapPaymentStatus(order.paymentStatus),
    total: centsToPesos(order.totalCents),
    itemCount: order.itemCount,
    date: order.createdAt,
    hasCustomization: order.hasCustomDesign,
  }
}

/**
 * Maps BFF production queue order to production card item (one row per order).
 */
export function mapProductionQueueItemToUi(item: AdminProductionQueueItem): ProductionItem {
  const productName = item.productNames.length > 0 ? item.productNames.join(', ') : 'Producto'

  return {
    id: item.id,
    orderNumber: item.orderNumber,
    productName,
    productType: inferProductType(productName),
    quantity: Math.max(item.productNames.length, 1),
    customizationType: mapCustomizationType(item.customizationTypes),
    customizationText:
      item.customizationTypes.length > 1 ? item.customizationTypes.slice(1).join(', ') : undefined,
    estimatedDelivery: resolveEstimatedDelivery(item.estimatedDeliveryDate, item.createdAt),
    status: mapProductionStatus(item.status),
    priority: 'normal',
  }
}

/**
 * Maps BFF recent design to admin recent designs card shape.
 */
export function mapRecentDesignToUi(design: AdminRecentDesign): RecentDesign {
  const customerEmail = design.customerEmail ?? ''
  return {
    id: design.id,
    previewUrl: design.previewUrl ?? '',
    productName: design.productName,
    productType: inferProductType(design.productName),
    userName: resolveCustomerDisplayName(design.customerName, customerEmail),
    userEmail: customerEmail,
    status: mapDesignStatus(design.status),
    estimatedValue: centsToPesos(design.finalPriceCents),
    createdAt: design.updatedAt,
  }
}
