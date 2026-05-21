import type { Prisma, Shipment, ShipmentEvent } from '@prisma/client'

import type { AdminShipmentEventGql, AdminShipmentGql } from './admin-shipping.types'

export type ShipmentWithOrderAndEvents = Shipment & {
  order: { orderNumber: string }
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
