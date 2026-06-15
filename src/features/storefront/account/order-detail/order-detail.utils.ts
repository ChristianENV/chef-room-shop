import type { AccountOrder } from '../types'

export type OrderStatusTone = 'pending' | 'success' | 'production' | 'shipping' | 'delivered' | 'cancelled'

export type TimelineStepState = 'completed' | 'current' | 'pending' | 'failed'

export type OrderTimelineStep = {
  id: string
  label: string
  date: string | null
  state: TimelineStepState
}

export type ProductSnapshot = {
  name?: string
  slug?: string
  sku?: string
  imageUrl?: string | null
  sizeName?: string | null
  colorName?: string | null
  colorHex?: string | null
  fabricColorName?: string | null
  detailColorName?: string | null
}

export type DesignSnapshot = {
  designId?: string | null
  previewUrl?: string | null
  previewBackUrl?: string | null
  selectedVariantId?: string | null
  selectedSize?: {
    id?: string | null
    name?: string | null
    label?: string | null
  }
  selectedColor?: {
    id?: string | null
    name?: string | null
    hex?: string | null
    label?: string | null
  }
  fabricColor?: {
    name?: string | null
    hex?: string | null
  }
  detailColor?: {
    name?: string | null
    hex?: string | null
  }
  summary?: string[]
  areas?: string[]
  hasLogo?: boolean
  hasEmbroidery?: boolean
  embroideredName?: string | null
}

const ORDER_STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Pendiente de pago',
  PAYMENT_FAILED: 'Pago fallido',
  PAID: 'Pagado',
  IN_PRODUCTION: 'En producción',
  READY_TO_SHIP: 'Listo para envío',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregado',
  CANCELLED: 'Cancelado',
  REFUNDED: 'Reembolsado',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  PAID: 'Pagado',
  FAILED: 'Fallido',
  CANCELLED: 'Expirado',
  REFUNDED: 'Reembolsado',
  PARTIALLY_REFUNDED: 'Reembolso parcial',
  AUTHORIZED: 'En proceso',
}

const PAYMENT_METHOD_LABELS: Record<string, string> = {
  CARD: 'Tarjeta',
  OXXO: 'OXXO',
  SPEI: 'SPEI',
  OTHER: 'Otro',
}

const FULFILLMENT_LABELS: Record<string, string> = {
  UNFULFILLED: 'Sin iniciar',
  PARTIALLY_FULFILLED: 'Parcial',
  FULFILLED: 'Completado',
}

/**
 * Human-readable order status label in Spanish.
 */
export function getOrderStatusLabel(status: string): string {
  return ORDER_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Human-readable payment status label in Spanish.
 */
export function getPaymentStatusLabel(status: string): string {
  return PAYMENT_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Human-readable payment method label in Spanish.
 */
export function getPaymentMethodLabel(method: string): string {
  return PAYMENT_METHOD_LABELS[method.toUpperCase()] ?? method
}

/**
 * Human-readable fulfillment status label in Spanish.
 */
export function getFulfillmentStatusLabel(status: string): string {
  return FULFILLMENT_LABELS[status.toUpperCase()] ?? status
}

/**
 * Visual tone for order status badges.
 */
export function getOrderStatusTone(status: string): OrderStatusTone {
  const normalized = status.toUpperCase()
  if (normalized === 'DELIVERED') return 'delivered'
  if (normalized === 'SHIPPED' || normalized === 'READY_TO_SHIP') return 'shipping'
  if (normalized === 'IN_PRODUCTION') return 'production'
  if (normalized === 'PAID') return 'success'
  if (normalized === 'CANCELLED' || normalized === 'REFUNDED' || normalized === 'PAYMENT_FAILED') {
    return 'cancelled'
  }
  return 'pending'
}

/**
 * Contextual hero message for the current order status.
 */
export function getOrderStatusMessage(status: string): string {
  switch (status.toUpperCase()) {
    case 'PENDING_PAYMENT':
      return 'Tu pedido fue creado. Completa el pago para iniciar producción.'
    case 'PAID':
      return 'Pago confirmado. Prepararemos tu pedido para producción.'
    case 'IN_PRODUCTION':
      return 'Tu pedido está en producción.'
    case 'READY_TO_SHIP':
      return 'Tu pedido está listo para envío.'
    case 'SHIPPED':
      return 'Tu pedido va en camino.'
    case 'DELIVERED':
      return 'Tu pedido fue entregado.'
    case 'CANCELLED':
      return 'Este pedido fue cancelado.'
    case 'PAYMENT_FAILED':
      return 'No pudimos confirmar el pago de este pedido.'
    default:
      return 'Seguimos procesando tu pedido.'
  }
}

/**
 * Badge class names for order status tone (Chef Room primary palette).
 */
export function getOrderStatusBadgeClass(tone: OrderStatusTone): string {
  switch (tone) {
    case 'delivered':
    case 'success':
      return 'border-success/30 bg-success/10 text-success'
    case 'production':
      return 'border-primary/30 bg-primary/10 text-primary'
    case 'shipping':
      return 'border-accent/30 bg-accent/10 text-accent-foreground'
    case 'cancelled':
      return 'border-destructive/30 bg-destructive/10 text-destructive'
    default:
      return 'border-warning/30 bg-warning/10 text-warning'
  }
}

/**
 * Returns true if any line item has customization snapshot data.
 */
export function orderHasCustomization(order: AccountOrder): boolean {
  return order.items.some(
    (item) =>
      item.customizationPriceCents > 0 ||
      (item.designSnapshotJson != null &&
        typeof item.designSnapshotJson === 'object'),
  )
}

/**
 * Parses product snapshot JSON from an order line item.
 */
export function parseProductSnapshot(value: unknown): ProductSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return {}
  }
  const record = value as Record<string, unknown>
  const fabricColor = record.fabricColor
  const fabricRecord =
    fabricColor && typeof fabricColor === 'object' && !Array.isArray(fabricColor)
      ? (fabricColor as Record<string, unknown>)
      : null

  return {
    name: typeof record.name === 'string' ? record.name : undefined,
    slug: typeof record.slug === 'string' ? record.slug : undefined,
    sku: typeof record.sku === 'string' ? record.sku : undefined,
    imageUrl: typeof record.imageUrl === 'string' ? record.imageUrl : null,
    sizeName: typeof record.sizeName === 'string' ? record.sizeName : null,
    colorName: typeof record.colorName === 'string' ? record.colorName : null,
    colorHex: typeof record.colorHex === 'string' ? record.colorHex : null,
    fabricColorName:
      typeof fabricRecord?.name === 'string'
        ? fabricRecord.name
        : typeof record.colorName === 'string'
          ? record.colorName
          : null,
    detailColorName:
      typeof record.detailColorName === 'string' ? record.detailColorName : null,
  }
}

/**
 * Parses design snapshot JSON from an order line item.
 */
export function parseDesignSnapshot(value: unknown): DesignSnapshot | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    return null
  }
  const record = value as Record<string, unknown>
  const selectedSize = record.selectedSize
  const selectedColor = record.selectedColor
  const fabricColor = record.fabricColor
  const detailColor = record.detailColor

  const parseFabric = (input: unknown) => {
    if (!input || typeof input !== 'object' || Array.isArray(input)) return undefined
    const row = input as Record<string, unknown>
    return {
      name: typeof row.name === 'string' ? row.name : null,
      hex: typeof row.hex === 'string' ? row.hex : null,
    }
  }

  return {
    designId: typeof record.designId === 'string' ? record.designId : null,
    previewUrl: typeof record.previewUrl === 'string' ? record.previewUrl : null,
    previewBackUrl: typeof record.previewBackUrl === 'string' ? record.previewBackUrl : null,
    selectedVariantId:
      typeof record.selectedVariantId === 'string' ? record.selectedVariantId : null,
    selectedSize:
      selectedSize && typeof selectedSize === 'object' && !Array.isArray(selectedSize)
        ? {
            id:
              typeof (selectedSize as Record<string, unknown>).id === 'string'
                ? ((selectedSize as Record<string, unknown>).id as string)
                : null,
            name:
              typeof (selectedSize as Record<string, unknown>).name === 'string'
                ? ((selectedSize as Record<string, unknown>).name as string)
                : null,
            label:
              typeof (selectedSize as Record<string, unknown>).label === 'string'
                ? ((selectedSize as Record<string, unknown>).label as string)
                : null,
          }
        : undefined,
    selectedColor:
      selectedColor && typeof selectedColor === 'object' && !Array.isArray(selectedColor)
        ? {
            id:
              typeof (selectedColor as Record<string, unknown>).id === 'string'
                ? ((selectedColor as Record<string, unknown>).id as string)
                : null,
            name:
              typeof (selectedColor as Record<string, unknown>).name === 'string'
                ? ((selectedColor as Record<string, unknown>).name as string)
                : null,
            hex:
              typeof (selectedColor as Record<string, unknown>).hex === 'string'
                ? ((selectedColor as Record<string, unknown>).hex as string)
                : null,
            label:
              typeof (selectedColor as Record<string, unknown>).label === 'string'
                ? ((selectedColor as Record<string, unknown>).label as string)
                : null,
          }
        : undefined,
    fabricColor: parseFabric(fabricColor),
    detailColor: parseFabric(detailColor),
    summary: Array.isArray(record.summary)
      ? record.summary.filter((s): s is string => typeof s === 'string')
      : [],
    areas: Array.isArray(record.areas)
      ? record.areas.filter((s): s is string => typeof s === 'string')
      : [],
    hasLogo: record.hasLogo === true,
    hasEmbroidery: record.hasEmbroidery === true,
    embroideredName:
      typeof record.embroideredName === 'string' ? record.embroideredName : null,
  }
}

function formatTimelineDate(iso: string | null | undefined): string | null {
  if (!iso) return null
  return new Date(iso).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  })
}

/**
 * Builds progress timeline steps from order status, payments, shipments and events.
 */
export function buildOrderTimeline(order: AccountOrder): OrderTimelineStep[] {
  const status = order.status.toUpperCase()
  const paymentStatus = order.paymentStatus.toUpperCase()
  const payment = order.payments[0]
  const shipment = order.shipments[0]

  const paymentFailed = paymentStatus === 'FAILED' || status === 'PAYMENT_FAILED'
  const paymentDone = paymentStatus === 'PAID' || status === 'PAID' || [
    'IN_PRODUCTION',
    'READY_TO_SHIP',
    'SHIPPED',
    'DELIVERED',
  ].includes(status)

  const productionDone = ['READY_TO_SHIP', 'SHIPPED', 'DELIVERED'].includes(status)
  const productionCurrent = status === 'IN_PRODUCTION'
  const shipped = status === 'SHIPPED' || status === 'DELIVERED'
  const delivered = status === 'DELIVERED'

  const paymentEvent = order.events.find(
    (e) => e.type === 'PAYMENT_UPDATED' || e.message.toLowerCase().includes('pago'),
  )

  const stepPayment: TimelineStepState = paymentFailed
    ? 'failed'
    : paymentDone
      ? 'completed'
      : status === 'PENDING_PAYMENT'
        ? 'current'
        : 'pending'

  const stepProduction: TimelineStepState = productionDone
    ? 'completed'
    : productionCurrent
      ? 'current'
      : paymentDone
        ? 'pending'
        : 'pending'

  const stepShipping: TimelineStepState = delivered
    ? 'completed'
    : shipped
      ? 'current'
      : productionDone
        ? 'pending'
        : 'pending'

  const stepDelivered: TimelineStepState = delivered
    ? 'completed'
    : shipped
      ? 'current'
      : 'pending'

  return [
    {
      id: 'created',
      label: 'Pedido creado',
      date: formatTimelineDate(order.placedAt ?? order.createdAt),
      state: 'completed',
    },
    {
      id: 'payment',
      label: 'Pago',
      date: formatTimelineDate(payment?.paidAt ?? paymentEvent?.createdAt),
      state: stepPayment,
    },
    {
      id: 'production',
      label: 'Producción',
      date: productionCurrent || productionDone ? formatTimelineDate(order.placedAt) : null,
      state: stepProduction,
    },
    {
      id: 'shipping',
      label: 'Envío',
      date: formatTimelineDate(shipment?.shippedAt),
      state: stepShipping,
    },
    {
      id: 'delivered',
      label: 'Entregado',
      date: formatTimelineDate(shipment?.deliveredAt),
      state: stepDelivered,
    },
  ]
}

/**
 * Total item quantity across all lines.
 */
export function getOrderItemCount(order: AccountOrder): number {
  return order.items.reduce((sum, item) => sum + item.quantity, 0)
}
