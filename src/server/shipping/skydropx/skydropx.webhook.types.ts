import 'server-only'

import type { ShipmentStatus } from '@prisma/client'

/**
 * Normalized Skydropx webhook event (defensive parse from JSON:API or legacy shapes).
 */
export type ParsedSkydropxWebhookEvent = {
  eventId: string
  eventType: string
  resourceType: string
  providerShipmentId: string | null
  trackingNumber: string | null
  packageStatus: string | null
  carrier: string | null
  labelUrl: string | null
  orderReference: string | null
  occurredAt: Date | null
  providerStatusRaw: string | null
}

export type SkydropxWebhookProcessResult = {
  eventId: string
  duplicate: boolean
  skipped: boolean
  reason?: string
  shipmentId?: string
  orderId?: string
}

export type ShipmentStatusTransition = {
  nextStatus: ShipmentStatus
  orderStatus?: 'SHIPPED' | 'DELIVERED'
  fulfillmentStatus?: 'SHIPPED' | 'DELIVERED' | 'PROCESSING' | 'CANCELLED'
  setShippedAt?: boolean
  setDeliveredAt?: boolean
}
