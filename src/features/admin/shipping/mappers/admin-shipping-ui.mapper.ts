import {
  centsToPesos,
  formatCurrencyMXN,
} from '@/src/lib/formatters'

import type { AdminOrder } from '@/src/features/admin/orders/types'
import type { StatusBadgeVariant } from '@/src/features/admin/orders/types/admin-orders-ui.types'

import type { AdminShipment } from '../types'

export type AdminShipmentUi = {
  id: string
  orderNumber: string
  providerLabel: string
  carrier: string
  service: string
  trackingNumber: string | null
  status: string
  statusLabel: string
  statusBadgeVariant: StatusBadgeVariant
  labelUrl: string | null
  labelFormat: string | null
  costFormatted: string | null
  createdAtFormatted: string
  shippedAtFormatted: string | null
  hasActiveLabel: boolean
  events: Array<{
    id: string
    statusLabel: string
    message: string | null
    createdAtFormatted: string
  }>
}

const SHIPMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendiente',
  LABEL_CREATED: 'Etiqueta creada',
  IN_TRANSIT: 'En tránsito',
  OUT_FOR_DELIVERY: 'En reparto',
  DELIVERED: 'Entregada',
  FAILED: 'Incidencia',
  RETURNED: 'Devuelta',
  CANCELLED: 'Cancelada',
  CREATED: 'Creada',
  EXCEPTION: 'Incidencia',
  READY_TO_SHIP: 'Lista para envío',
  SHIPPED: 'Enviada',
}

const PROVIDER_LABELS: Record<string, string> = {
  SKYDROPX: 'Skydropx',
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

/**
 * Human-readable shipment status label in Spanish.
 */
export function mapShipmentStatusToLabel(status: string): string {
  return SHIPMENT_STATUS_LABELS[status.toUpperCase()] ?? status
}

/**
 * Maps shipment status to badge variant.
 */
export function mapShipmentStatusToBadgeVariant(status: string): StatusBadgeVariant {
  const normalized = status.toUpperCase()
  if (normalized === 'CANCELLED' || normalized === 'FAILED' || normalized === 'EXCEPTION') {
    return 'destructive'
  }
  if (normalized === 'PENDING' || normalized === 'LABEL_CREATED') {
    return 'outline'
  }
  if (normalized === 'IN_TRANSIT' || normalized === 'OUT_FOR_DELIVERY') {
    return 'secondary'
  }
  return 'default'
}

/**
 * Human-readable shipping provider label.
 */
export function mapShipmentProviderToLabel(provider: string | null): string {
  if (!provider) return 'Skydropx'
  return PROVIDER_LABELS[provider.toUpperCase()] ?? provider
}

function hasActiveSkydropxLabel(shipment: AdminShipment | null | undefined): boolean {
  if (!shipment) return false
  if (shipment.status.toUpperCase() === 'CANCELLED') return false
  return Boolean(
    shipment.providerShipmentId?.trim() || shipment.labelUrl?.trim(),
  )
}

/**
 * Maps BFF AdminShipment to UI card shape.
 */
export function mapAdminShipmentToUi(shipment: AdminShipment): AdminShipmentUi {
  const carrier = shipment.carrier?.trim() || 'Paquetería no indicada'
  const service = shipment.service?.trim() || 'Servicio estándar'

  return {
    id: shipment.id,
    orderNumber: shipment.orderNumber,
    providerLabel: mapShipmentProviderToLabel(shipment.provider),
    carrier,
    service,
    trackingNumber: shipment.trackingNumber?.trim() || null,
    status: shipment.status,
    statusLabel: mapShipmentStatusToLabel(shipment.status),
    statusBadgeVariant: mapShipmentStatusToBadgeVariant(shipment.status),
    labelUrl: shipment.labelUrl?.trim() || null,
    labelFormat: shipment.labelFormat?.trim() || null,
    costFormatted:
      shipment.costCents != null
        ? formatCurrencyMXN(centsToPesos(shipment.costCents))
        : null,
    createdAtFormatted: formatDateTime(shipment.createdAt),
    shippedAtFormatted: shipment.shippedAt
      ? formatDateTime(shipment.shippedAt)
      : null,
    hasActiveLabel: hasActiveSkydropxLabel(shipment),
    events: shipment.events.map((event) => ({
      id: event.id,
      statusLabel: mapShipmentStatusToLabel(event.status),
      message: event.message,
      createdAtFormatted: formatDateTime(event.createdAt),
    })),
  }
}

/**
 * Whether admin can create a Skydropx label for this order.
 */
export function canCreateShippingLabel(
  order: Pick<AdminOrder, 'status' | 'paymentStatus'>,
  shipment: AdminShipment | null | undefined,
): boolean {
  const status = order.status.toUpperCase()
  const payment = order.paymentStatus.toUpperCase()

  if (status === 'CANCELLED' || status === 'REFUNDED' || status === 'DELIVERED') {
    return false
  }

  if (payment !== 'PAID') {
    return false
  }

  if (!['PAID', 'IN_PRODUCTION', 'READY_TO_SHIP'].includes(status)) {
    return false
  }

  return !hasActiveSkydropxLabel(shipment)
}

/**
 * Reason why label creation is disabled (empty if allowed).
 */
export function getCreateShippingLabelBlockedReason(
  order: Pick<AdminOrder, 'status' | 'paymentStatus'>,
  shipment: AdminShipment | null | undefined,
): string | null {
  if (canCreateShippingLabel(order, shipment)) return null

  const status = order.status.toUpperCase()
  const payment = order.paymentStatus.toUpperCase()

  if (status === 'CANCELLED' || status === 'REFUNDED') {
    return 'No disponible para órdenes canceladas.'
  }
  if (status === 'DELIVERED') {
    return 'No disponible para órdenes entregadas.'
  }
  if (hasActiveSkydropxLabel(shipment)) {
    return 'Esta orden ya tiene guía.'
  }
  if (payment !== 'PAID') {
    return 'Disponible cuando el pedido esté pagado.'
  }
  if (!['PAID', 'IN_PRODUCTION', 'READY_TO_SHIP'].includes(status)) {
    return 'La orden aún no está lista para generar guía.'
  }

  return 'No disponible para este estado de la orden.'
}

/**
 * Whether admin can cancel an active Skydropx label.
 */
export function canCancelShippingLabel(shipment: AdminShipment | null | undefined): boolean {
  if (!shipment) return false
  if (shipment.status.toUpperCase() === 'CANCELLED') return false
  return Boolean(shipment.providerShipmentId?.trim())
}

/**
 * Whether admin can refresh tracking from Skydropx.
 */
export function canRefreshShipment(shipment: AdminShipment | null | undefined): boolean {
  if (!shipment) return false
  if (shipment.status.toUpperCase() === 'CANCELLED') return false
  return Boolean(
    shipment.trackingNumber?.trim() && shipment.carrier?.trim(),
  )
}
