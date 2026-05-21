import {
  centsToPesos,
  formatCurrencyMXN,
} from '@/src/lib/formatters'
import {
  parseDesignSnapshot,
  parseProductSnapshot,
} from '@/src/features/storefront/account/order-detail/order-detail.utils'

import type {
  AdminOrder,
  AdminOrderItem,
  AdminOrderStatusSummary,
  AdminProductionSheet,
  AdminOrdersFilterInput,
  AdminOrdersListVariables,
} from '../types'
import type {
  AdminOrderStatusFilter,
  AdminOrdersProductionSheetUi,
  AdminOrdersStatusCardCounts,
  AdminOrdersUiAddress,
  AdminOrdersUiCustomization,
  AdminOrdersUiCustomizationArea,
  AdminOrdersUiItem,
  AdminOrdersUiOrder,
  AdminOrdersUiTableRow,
  AdminOrdersUiTimelineEvent,
  AdminPaymentStatusFilter,
  StatusBadgeVariant,
} from '../types/admin-orders-ui.types'

const BFF_ORDER_STATUS_BY_UI: Record<AdminOrderStatusFilter, string> = {
  'pendiente-pago': 'PENDING_PAYMENT',
  pagado: 'PAID',
  'en-produccion': 'IN_PRODUCTION',
  'listo-envio': 'READY_TO_SHIP',
  enviado: 'SHIPPED',
  entregado: 'DELIVERED',
  cancelado: 'CANCELLED',
}

const UI_ORDER_STATUS_BY_BFF: Record<string, AdminOrderStatusFilter> = {
  PENDING_PAYMENT: 'pendiente-pago',
  PAYMENT_FAILED: 'pendiente-pago',
  PAID: 'pagado',
  IN_PRODUCTION: 'en-produccion',
  READY_TO_SHIP: 'listo-envio',
  SHIPPED: 'enviado',
  DELIVERED: 'entregado',
  CANCELLED: 'cancelado',
  REFUNDED: 'cancelado',
}

const BFF_PAYMENT_STATUS_BY_UI: Record<AdminPaymentStatusFilter, string> = {
  pendiente: 'PENDING',
  completado: 'PAID',
  fallido: 'FAILED',
  reembolsado: 'REFUNDED',
}

const UI_PAYMENT_STATUS_BY_BFF: Record<string, AdminPaymentStatusFilter> = {
  PENDING: 'pendiente',
  AUTHORIZED: 'pendiente',
  PAID: 'completado',
  FAILED: 'fallido',
  REFUNDED: 'reembolsado',
  PARTIALLY_REFUNDED: 'reembolsado',
  CANCELLED: 'fallido',
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_FAILED: 'Pago fallido',
  PAID: 'Pagada',
  IN_PRODUCTION: 'En producción',
  READY_TO_SHIP: 'Lista para envío',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  CANCELLED: 'Cancelada',
  REFUNDED: 'Reembolsada',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  AUTHORIZED: 'Autorizado',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
  CANCELLED: 'Cancelado',
  EXPIRED: 'Expirado',
}

const FULFILLMENT_STATUS_LABELS: Record<string, string> = {
  UNFULFILLED: 'Sin iniciar',
  PROCESSING: 'En proceso',
  PARTIALLY_SHIPPED: 'Envío parcial',
  SHIPPED: 'Enviada',
  DELIVERED: 'Entregada',
  RETURNED: 'Devuelta',
  CANCELLED: 'Cancelada',
  NOT_STARTED: 'Sin iniciar',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  OXXO: 'OXXO',
  SPEI: 'SPEI',
  CASH: 'Efectivo',
  OTHER: 'Otro',
  MANUAL: 'Manual',
}

type LayerSnapshot = {
  type?: string
  areaName?: string
  areaId?: string
  text?: string
  logoUrl?: string
  font?: string
  color?: string
  width?: number
  height?: number
  priceCents?: number
}

/**
 * Human-readable order status label in Spanish.
 */
export function mapOrderStatusToLabel(status: string): string {
  return ORDER_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Human-readable payment status label in Spanish.
 */
export function mapPaymentStatusToLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Human-readable fulfillment status label in Spanish.
 */
export function mapFulfillmentStatusToLabel(status: string): string {
  return FULFILLMENT_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Human-readable payment method label in Spanish.
 */
export function mapPaymentMethodToLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method.toUpperCase()] ?? method
}

/**
 * Maps BFF order status to badge variant for shadcn Badge.
 */
export function mapStatusToBadgeVariant(status: string): StatusBadgeVariant {
  const normalized = status.toUpperCase()
  if (normalized === 'CANCELLED' || normalized === 'REFUNDED' || normalized === 'PAYMENT_FAILED') {
    return 'destructive'
  }
  if (normalized === 'PENDING_PAYMENT') return 'outline'
  if (normalized === 'IN_PRODUCTION' || normalized === 'SHIPPED') return 'secondary'
  return 'default'
}

function mapUiOrderStatus(status: string): AdminOrderStatusFilter {
  return UI_ORDER_STATUS_BY_BFF[status.toUpperCase()] ?? 'pendiente-pago'
}

function mapUiPaymentStatus(status: string): AdminPaymentStatusFilter {
  return UI_PAYMENT_STATUS_BY_BFF[status.toUpperCase()] ?? 'pendiente'
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

function formatDateOnly(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function resolveCustomerName(
  name: string | null | undefined,
  email: string,
): string {
  const trimmed = name?.trim()
  if (trimmed) return trimmed
  const local = email.split('@')[0]?.trim()
  return local || email
}

function mapAddressToUi(
  address: AdminOrder['shippingAddress'],
  defaults: { isDefaultShipping: boolean; isDefaultBilling: boolean },
): AdminOrdersUiAddress {
  if (!address) {
    return {
      id: 'unknown',
      label: 'Sin dirección',
      firstName: '—',
      lastName: '',
      street: '—',
      exteriorNumber: '',
      neighborhood: '',
      city: '—',
      state: '—',
      postalCode: '—',
      country: 'MX',
      phone: '—',
      isDefaultShipping: defaults.isDefaultShipping,
      isDefaultBilling: defaults.isDefaultBilling,
    }
  }

  return {
    id: address.id,
    label: address.label ?? 'Envío',
    firstName: address.firstName ?? '',
    lastName: address.lastName ?? '',
    street: address.line1,
    exteriorNumber: '',
    interiorNumber: address.line2 ?? undefined,
    neighborhood: address.label ?? '',
    city: address.city,
    state: address.state,
    postalCode: address.postalCode,
    country: address.country,
    phone: address.phone ?? '—',
    isDefaultShipping: defaults.isDefaultShipping,
    isDefaultBilling: defaults.isDefaultBilling,
  }
}

function buildCustomizationFromSnapshots(
  item: AdminOrderItem,
): AdminOrdersUiCustomization | undefined {
  if (!item.hasCustomDesign) return undefined

  const design = parseDesignSnapshot(item.designSnapshotJson)
  const areas: AdminOrdersUiCustomizationArea[] = []

  if (design?.areas?.length) {
    design.areas.forEach((areaName, index) => {
      areas.push({
        areaId: `area-${index}`,
        areaName,
        type: design.hasEmbroidery ? 'bordado' : design.hasLogo ? 'logo' : 'personalización',
        text: design.embroideredName ?? undefined,
        width: 0,
        height: 0,
        price: centsToPesos(item.customizationPriceCents),
      })
    })
  }

  const raw = item.designSnapshotJson
  if (raw && typeof raw === 'object' && !Array.isArray(raw)) {
    const record = raw as Record<string, unknown>
    const layers = record.layers
    if (Array.isArray(layers)) {
      layers.forEach((layer, index) => {
        if (!layer || typeof layer !== 'object') return
        const l = layer as LayerSnapshot
        areas.push({
          areaId: l.areaId ?? `layer-${index}`,
          areaName: l.areaName ?? `Área ${index + 1}`,
          type: l.type ?? 'personalización',
          text: l.text,
          logoUrl: l.logoUrl,
          font: l.font,
          color: l.color,
          width: l.width ?? 0,
          height: l.height ?? 0,
          price: centsToPesos(l.priceCents ?? item.customizationPriceCents),
        })
      })
    }
  }

  if (areas.length === 0 && design?.summary?.length) {
    design.summary.forEach((line, index) => {
      areas.push({
        areaId: `summary-${index}`,
        areaName: line,
        type: 'resumen',
        width: 0,
        height: 0,
        price: 0,
      })
    })
  }

  if (areas.length === 0 && !design) {
    return undefined
  }

  return {
    designId: item.designId ?? design?.designId ?? '—',
    previewUrl: design?.previewUrl ?? '',
    areas,
    productionNotes: item.productionNotes ?? undefined,
    summaryLines: design?.summary,
  }
}

function mapItemToUi(item: AdminOrderItem): AdminOrdersUiItem {
  const product = parseProductSnapshot(item.productSnapshotJson)
  const unitPesos = centsToPesos(item.unitPriceCents)
  const linePesos = centsToPesos(item.lineTotalCents)

  return {
    id: item.id,
    productId: item.productId ?? product.slug ?? item.id,
    productName: item.name,
    productImage: product.imageUrl ?? '',
    sku: item.sku ?? product.sku ?? '—',
    color: product.colorName ?? '—',
    colorHex: '#e5e5e5',
    size: product.sizeName ?? '—',
    quantity: item.quantity,
    unitPrice: unitPesos,
    totalPrice: linePesos,
    hasCustomization: item.hasCustomDesign,
    customization: buildCustomizationFromSnapshots(item),
  }
}

function mapTimeline(order: AdminOrder): AdminOrdersUiTimelineEvent[] {
  return order.events.map((event) => ({
    id: event.id,
    event: event.message ?? mapOrderStatusToLabel(event.type),
    status: mapUiOrderStatus(order.status),
    timestamp: event.createdAt,
    user: event.actorName ?? undefined,
    notes: event.message ?? undefined,
  }))
}

function deriveProductionStatusLabel(order: AdminOrder): string {
  const status = order.status.toUpperCase()
  if (status === 'IN_PRODUCTION') return 'En proceso'
  if (status === 'READY_TO_SHIP') return 'Listo para envío'
  if (status === 'PAID') return 'En cola'
  return mapFulfillmentStatusToLabel(order.fulfillmentStatus)
}

function deriveActionFlags(order: AdminOrder): Pick<
  AdminOrdersUiOrder,
  'canMoveToProduction' | 'canMarkReadyToShip' | 'canAddTracking' | 'canCancel'
> {
  const status = order.status.toUpperCase()
  const payment = order.paymentStatus.toUpperCase()
  const isPaid =
    payment === 'PAID' ||
    ['PAID', 'IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(status)

  return {
    canMoveToProduction:
      isPaid && !['IN_PRODUCTION', 'READY_TO_SHIP', 'SHIPPED', 'DELIVERED', 'CANCELLED', 'REFUNDED'].includes(status),
    canMarkReadyToShip: ['PAID', 'IN_PRODUCTION', 'READY_TO_SHIP'].includes(status),
    canAddTracking: !['CANCELLED', 'REFUNDED', 'DELIVERED'].includes(status),
    canCancel: status !== 'DELIVERED' && status !== 'CANCELLED' && status !== 'REFUNDED',
  }
}

/**
 * Maps a BFF admin order to the full UI detail shape.
 */
export function mapAdminOrderToDetail(order: AdminOrder): AdminOrdersUiOrder {
  const latestPayment = order.payments[0]
  const latestShipment = order.shipments[0]
  const customerName = resolveCustomerName(order.customer.name, order.customer.email)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    status: mapUiOrderStatus(order.status),
    statusLabel: mapOrderStatusToLabel(order.status),
    paymentStatus: mapUiPaymentStatus(order.paymentStatus),
    paymentStatusLabel: mapPaymentStatusToLabel(order.paymentStatus),
    productionStatus: order.fulfillmentStatus,
    productionStatusLabel: deriveProductionStatusLabel(order),
    fulfillmentStatus: order.fulfillmentStatus,
    fulfillmentStatusLabel: mapFulfillmentStatusToLabel(order.fulfillmentStatus),
    customer: {
      id: order.customer.userId ?? order.customer.email,
      name: customerName,
      email: order.customer.email,
      phone: order.customer.phone ?? '—',
      totalOrders: 0,
      customerSince: order.createdAt,
    },
    shippingAddress: mapAddressToUi(order.shippingAddress, {
      isDefaultShipping: true,
      isDefaultBilling: false,
    }),
    billingAddress: order.billingAddress
      ? mapAddressToUi(order.billingAddress, {
          isDefaultShipping: false,
          isDefaultBilling: true,
        })
      : undefined,
    items: order.items.map(mapItemToUi),
    subtotal: centsToPesos(order.subtotalCents),
    shipping: centsToPesos(order.shippingCents),
    discount: centsToPesos(order.discountCents),
    tax: centsToPesos(order.taxCents),
    customizationTotal: centsToPesos(order.customizationTotalCents),
    total: centsToPesos(order.totalCents),
    paymentMethod: latestPayment
      ? mapPaymentMethodToLabel(latestPayment.method)
      : undefined,
    paymentReference: latestPayment?.providerOrderId ?? undefined,
    trackingNumber: latestShipment?.trackingNumber ?? undefined,
    trackingUrl: undefined,
    estimatedDelivery: latestShipment?.deliveredAt ?? latestShipment?.shippedAt ?? undefined,
    notes: order.notes ?? undefined,
    timeline: mapTimeline(order),
    ...deriveActionFlags(order),
  }
}

/**
 * Maps a BFF admin order to a table row.
 */
export function mapAdminOrderToTableRow(order: AdminOrder): AdminOrdersUiTableRow {
  const detail = mapAdminOrderToDetail(order)
  const itemCount = order.items.reduce((sum, item) => sum + item.quantity, 0)

  return {
    id: order.id,
    orderNumber: order.orderNumber,
    customerName: detail.customer.name,
    customerEmail: order.customer.email,
    itemCount,
    hasCustomization: order.hasCustomDesign,
    paymentStatus: detail.paymentStatus,
    paymentStatusLabel: detail.paymentStatusLabel,
    status: detail.status,
    statusLabel: detail.statusLabel,
    statusBadgeVariant: mapStatusToBadgeVariant(order.status),
    productionStatusLabel: detail.productionStatusLabel,
    total: detail.total,
    totalFormatted: formatCurrencyMXN(detail.total),
    createdAt: order.createdAt,
    createdAtFormatted: formatDateTime(order.createdAt),
    order: detail,
  }
}

/**
 * Maps BFF status summary to UI card counts.
 */
export function mapAdminStatusSummaryToCards(
  summary: AdminOrderStatusSummary,
): AdminOrdersStatusCardCounts {
  return {
    'pendiente-pago': summary.pendingPayment,
    pagado: summary.paid,
    'en-produccion': summary.inProduction,
    'listo-envio': summary.readyToShip,
    enviado: summary.shipped,
    entregado: summary.delivered,
    cancelado: summary.cancelled,
  }
}

/**
 * Maps production sheet BFF payload to UI shape.
 */
export function mapAdminOrderToProductionSheet(
  sheet: AdminProductionSheet,
): AdminOrdersProductionSheetUi {
  const items = sheet.items.map(mapItemToUi)
  return {
    orderNumber: sheet.orderNumber,
    customerName: resolveCustomerName(sheet.customerName, sheet.customerEmail),
    customerEmail: sheet.customerEmail,
    notes: sheet.notes,
    generatedAt: sheet.generatedAt,
    generatedAtFormatted: formatDateTime(sheet.generatedAt),
    items,
  }
}

/**
 * Builds GraphQL list variables from UI filter state.
 */
export function buildAdminOrdersListVariables(input: {
  search: string
  statusFilter: AdminOrderStatusFilter | 'all'
  paymentFilter: AdminPaymentStatusFilter | 'all'
  cardStatusFilter: AdminOrderStatusFilter | null
  productionOnly: boolean
  limit?: number
  offset?: number
}): AdminOrdersListVariables {
  const filter: AdminOrdersFilterInput = {}
  const effectiveStatus = input.cardStatusFilter ?? (input.statusFilter !== 'all' ? input.statusFilter : null)

  if (input.search.trim()) {
    filter.search = input.search.trim()
  }
  if (effectiveStatus) {
    filter.status = BFF_ORDER_STATUS_BY_UI[effectiveStatus]
  }
  if (input.paymentFilter !== 'all') {
    filter.paymentStatus = BFF_PAYMENT_STATUS_BY_UI[input.paymentFilter]
  }
  if (input.productionOnly) {
    filter.productionOnly = true
  }

  return {
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    sort: { field: 'createdAt', direction: 'desc' },
    limit: input.limit ?? 50,
    offset: input.offset ?? 0,
  }
}

export { formatDateOnly, formatDateTime, resolveCustomerName }
