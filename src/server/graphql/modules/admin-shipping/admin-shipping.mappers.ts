import type { Prisma, Shipment, ShipmentEvent, User } from '@prisma/client'

import type {
  AdminShipmentEventGql,
  AdminShipmentGql,
  AdminShipmentListItemGql,
} from './admin-shipping.types'

export type ShipmentWithOrderAndEvents = Shipment & {
  order: { orderNumber: string }
  events: ShipmentEvent[]
}

export type ShipmentWithOrderForList = Shipment & {
  order: {
    orderNumber: string
    customerEmail: string
    user: Pick<User, 'name' | 'firstName' | 'lastName' | 'email'> | null
  }
  events: ShipmentEvent[]
}

function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null
}

function sanitizeMetadataJson(
  value: Prisma.JsonValue | null,
): Record<string, unknown> | null {
  if (value === null || value === undefined) return null
  if (typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

/**
 * Maps a Prisma shipment (with order number and events) to AdminShipment GraphQL type.
 */
export function mapShipmentToAdminGql(
  shipment: ShipmentWithOrderAndEvents,
): AdminShipmentGql {
  return {
    id: shipment.id,
    orderNumber: shipment.order.orderNumber,
    provider: shipment.provider,
    providerShipmentId: shipment.providerShipmentId,
    providerLabelId: shipment.providerLabelId,
    carrier: shipment.carrier,
    service: shipment.service,
    trackingNumber: shipment.trackingNumber,
    status: shipment.status,
    labelUrl: shipment.labelUrl,
    labelFormat: shipment.labelFormat,
    costCents: shipment.costCents,
    currency: shipment.currency,
    shippedAt: toIso(shipment.shippedAt),
    deliveredAt: toIso(shipment.deliveredAt),
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
    events: shipment.events.map(
      (event): AdminShipmentEventGql => ({
        id: event.id,
        status: event.status,
        message: event.message,
        rawPayloadJson: sanitizeMetadataJson(event.metadataJson),
        createdAt: event.createdAt.toISOString(),
      }),
    ),
  }
}

function resolveCustomerName(
  email: string,
  user: Pick<User, 'name' | 'firstName' | 'lastName' | 'email'> | null,
): string | null {
  const fromParts = [user?.firstName, user?.lastName].filter(Boolean).join(' ').trim()
  if (fromParts) return fromParts

  const fromName = user?.name?.trim()
  if (fromName) return fromName

  const local = email.split('@')[0]?.trim()
  return local || null
}

/**
 * Human-readable label status for admin shipping list (no raw Skydropx payloads).
 */
export function deriveShipmentLabelStatus(shipment: Shipment): string {
  const status = shipment.status.toUpperCase()

  if (status === 'CANCELLED') {
    return 'Etiqueta cancelada'
  }

  const hasLabel = Boolean(
    shipment.labelUrl?.trim() ||
      shipment.providerLabelId?.trim() ||
      shipment.providerShipmentId?.trim(),
  )

  if (!hasLabel) {
    return 'Sin etiqueta'
  }

  if (status === 'LABEL_CREATED') {
    return 'Etiqueta creada'
  }

  return 'Etiqueta activa'
}

/**
 * Maps a Prisma shipment row to a safe admin list item (no events/raw JSON).
 */
export function mapShipmentToAdminListItemGql(
  shipment: ShipmentWithOrderForList,
): AdminShipmentListItemGql {
  const latestEvent = shipment.events[0]

  return {
    id: shipment.id,
    orderNumber: shipment.order.orderNumber,
    customerName: resolveCustomerName(shipment.order.customerEmail, shipment.order.user),
    customerEmail: shipment.order.customerEmail,
    status: shipment.status,
    carrier: shipment.carrier,
    trackingNumber: shipment.trackingNumber,
    labelStatus: deriveShipmentLabelStatus(shipment),
    costCents: shipment.costCents,
    currency: shipment.currency,
    createdAt: shipment.createdAt.toISOString(),
    updatedAt: shipment.updatedAt.toISOString(),
    trackingUpdatedAt: latestEvent
      ? latestEvent.createdAt.toISOString()
      : shipment.shippedAt?.toISOString() ?? shipment.updatedAt.toISOString(),
  }
}
