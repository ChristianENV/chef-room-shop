import 'server-only'

import { createHash } from 'node:crypto'

import {
  FulfillmentStatus,
  OrderEventType,
  OrderStatus,
  type Prisma,
  type PrismaClient,
  ShipmentStatus,
  ShippingProvider,
} from '@prisma/client'

import { buildOrderEmailTrackingLinks } from '@/src/server/email/email.links'
import { safeSendTransactionalEmailOnce } from '@/src/server/email/email.service'
import { createOrderClaimToken } from '@/src/server/orders/order-claim-token'

import { sanitizeSkydropxWebhookPayload } from './skydropx.sanitize'
import type {
  ParsedSkydropxWebhookEvent,
  ShipmentStatusTransition,
  SkydropxWebhookProcessResult,
} from './skydropx.webhook.types'

const SHIPMENT_STATUS_RANK: Record<ShipmentStatus, number> = {
  PENDING: 0,
  LABEL_CREATED: 1,
  IN_TRANSIT: 2,
  OUT_FOR_DELIVERY: 3,
  DELIVERED: 4,
  FAILED: 5,
  RETURNED: 5,
  CANCELLED: 5,
}

function asRecord(value: unknown): Record<string, unknown> | null {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value as Record<string, unknown>
  }
  return null
}

function readString(record: Record<string, unknown>, key: string): string | null {
  const value = record[key]
  if (typeof value === 'string' && value.trim()) return value.trim()
  return null
}

function hashFallbackEventId(rawBody: string): string {
  return `hash:${createHash('sha256').update(rawBody).digest('hex')}`
}

/**
 * Extracts a normalized webhook event from Skydropx JSON:API or legacy payloads.
 */
export function extractSkydropxWebhookEvent(payload: unknown): ParsedSkydropxWebhookEvent {
  const root = asRecord(payload) ?? {}
  const data = asRecord(root.data) ?? root

  const resourceId = readString(data, 'id')
  const resourceType = (readString(data, 'type') ?? 'unknown').toLowerCase()
  const attributes = asRecord(data.attributes) ?? {}

  const relationships = asRecord(data.relationships) ?? {}
  const shipmentRel = asRecord(relationships.shipment) ?? {}
  const shipmentData = asRecord(shipmentRel.data) ?? {}
  const providerShipmentId = readString(shipmentData, 'id')

  const packageStatus =
    readString(attributes, 'status') ??
    readString(root, 'status') ??
    readString(attributes, 'shipment_status')

  const legacyEventType =
    readString(root, 'event_type') ??
    readString(root, 'eventType') ??
    readString(root, 'type')

  const eventType =
    legacyEventType && legacyEventType.includes('.')
      ? legacyEventType.toLowerCase()
      : `${resourceType}.${(packageStatus ?? 'updated').toLowerCase()}`

  const eventId =
    resourceId ??
    readString(root, 'event_id') ??
    readString(root, 'eventId') ??
    readString(root, 'id') ??
    hashFallbackEventId(JSON.stringify(payload))

  const trackingNumber =
    readString(attributes, 'tracking_number') ??
    readString(attributes, 'trackingNumber') ??
    readString(root, 'tracking_number')

  const labelUrl =
    readString(attributes, 'label_url') ??
    readString(attributes, 'tracking_url_provider') ??
    readString(attributes, 'labelUrl')

  const carrier =
    readString(attributes, 'carrier') ??
    readString(attributes, 'carrier_name') ??
    readString(attributes, 'provider_name')

  const orderReference =
    readString(attributes, 'reference') ??
    readString(attributes, 'order_number') ??
    readString(root, 'reference')

  const occurredAtRaw =
    readString(attributes, 'updated_at') ??
    readString(attributes, 'created_at') ??
    readString(root, 'timestamp')

  const occurredAt = occurredAtRaw ? new Date(occurredAtRaw) : null

  return {
    eventId,
    eventType: eventType.toLowerCase(),
    resourceType,
    providerShipmentId,
    trackingNumber,
    packageStatus: packageStatus?.toLowerCase() ?? null,
    carrier,
    labelUrl,
    orderReference,
    occurredAt: occurredAt && !Number.isNaN(occurredAt.getTime()) ? occurredAt : null,
    providerStatusRaw: packageStatus,
  }
}

/**
 * Maps Skydropx event type / package status to Prisma ShipmentStatus.
 */
export function mapSkydropxWebhookToShipmentStatus(
  event: ParsedSkydropxWebhookEvent,
): ShipmentStatusTransition | null {
  const statusKey = (event.packageStatus ?? '').toLowerCase()
  const eventType = event.eventType.toLowerCase()

  const matches = (...tokens: string[]): boolean =>
    tokens.some(
      (token) => eventType.includes(token) || statusKey === token || statusKey.includes(token),
    )

  if (matches('delivered', 'package.delivered', 'shipment.delivered')) {
    return {
      nextStatus: ShipmentStatus.DELIVERED,
      orderStatus: OrderStatus.DELIVERED,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      setDeliveredAt: true,
    }
  }

  if (matches('cancelled', 'canceled', 'shipment.cancelled')) {
    return {
      nextStatus: ShipmentStatus.CANCELLED,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    }
  }

  if (
    matches(
      'exception',
      'failed_attempt',
      'failed',
      'shipment.exception',
      'package.failed',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.FAILED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
    }
  }

  if (matches('returned', 'in_return', 'return')) {
    return {
      nextStatus: ShipmentStatus.RETURNED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
    }
  }

  if (matches('out_for_delivery', 'last_mile', 'package.out_for_delivery')) {
    return {
      nextStatus: ShipmentStatus.OUT_FOR_DELIVERY,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  if (
    matches(
      'in_transit',
      'picked_up',
      'collected',
      'shipment.status.updated',
      'package.tracking.updated',
      'package.in_transit',
      'shipped',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  if (
    matches(
      'created',
      'label.generated',
      'label_created',
      'shipment.created',
      'shipment.label.generated',
      'ready_to_ship',
    )
  ) {
    return {
      nextStatus: ShipmentStatus.LABEL_CREATED,
      fulfillmentStatus: FulfillmentStatus.PROCESSING,
    }
  }

  if (statusKey) {
    return {
      nextStatus: ShipmentStatus.IN_TRANSIT,
      orderStatus: OrderStatus.SHIPPED,
      fulfillmentStatus: FulfillmentStatus.SHIPPED,
      setShippedAt: true,
    }
  }

  return null
}

/**
 * Whether to send shipping_update email for this transition.
 */
export function shouldSendShippingEmail(
  previousStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
): boolean {
  if (nextStatus === ShipmentStatus.DELIVERED) return false

  const shippingNotifyStatuses: ShipmentStatus[] = [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.OUT_FOR_DELIVERY,
  ]

  if (!shippingNotifyStatuses.includes(nextStatus)) return false

  const alreadyNotified: ShipmentStatus[] = [
    ShipmentStatus.IN_TRANSIT,
    ShipmentStatus.OUT_FOR_DELIVERY,
    ShipmentStatus.DELIVERED,
  ]

  return !alreadyNotified.includes(previousStatus)
}

/**
 * Whether to send delivered email for this transition.
 */
export function shouldSendDeliveredEmail(
  previousStatus: ShipmentStatus,
  nextStatus: ShipmentStatus,
): boolean {
  return (
    nextStatus === ShipmentStatus.DELIVERED &&
    previousStatus !== ShipmentStatus.DELIVERED
  )
}

function shouldApplyShipmentStatus(
  current: ShipmentStatus,
  next: ShipmentStatus,
): boolean {
  if (current === ShipmentStatus.DELIVERED) {
    return next === ShipmentStatus.DELIVERED
  }
  if (current === ShipmentStatus.CANCELLED && next !== ShipmentStatus.CANCELLED) {
    return false
  }
  return SHIPMENT_STATUS_RANK[next] >= SHIPMENT_STATUS_RANK[current]
}

function buildShipmentEventMessage(event: ParsedSkydropxWebhookEvent): string {
  const statusLabel = event.providerStatusRaw ?? event.packageStatus ?? event.eventType
  return `Actualización Skydropx: ${statusLabel}`
}

async function resolveShipment(
  prisma: PrismaClient,
  event: ParsedSkydropxWebhookEvent,
): Promise<
  | (Prisma.ShipmentGetPayload<{ include: { order: true } }>)
  | null
> {
  if (event.providerShipmentId) {
    const byProvider = await prisma.shipment.findFirst({
      where: { providerShipmentId: event.providerShipmentId },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    })
    if (byProvider) return byProvider
  }

  if (event.trackingNumber) {
    const byTracking = await prisma.shipment.findFirst({
      where: { trackingNumber: event.trackingNumber },
      include: { order: true },
      orderBy: { createdAt: 'desc' },
    })
    if (byTracking) return byTracking
  }

  if (event.orderReference) {
    const order = await prisma.order.findFirst({
      where: {
        orderNumber: event.orderReference,
        deletedAt: null,
      },
      select: { id: true },
    })
    if (order) {
      return prisma.shipment.findFirst({
        where: { orderId: order.id },
        include: { order: true },
        orderBy: { createdAt: 'desc' },
      })
    }
  }

  return null
}

async function markWebhookProcessed(
  prisma: PrismaClient,
  eventId: string,
  data: {
    shipmentId?: string | null
    orderId?: string | null
    processingError?: string | null
    metadata?: Record<string, unknown>
  },
): Promise<void> {
  const existing = await prisma.shippingWebhookEvent.findUnique({ where: { eventId } })
  const basePayload =
    existing?.rawPayloadJson &&
    typeof existing.rawPayloadJson === 'object' &&
    !Array.isArray(existing.rawPayloadJson)
      ? (existing.rawPayloadJson as Record<string, unknown>)
      : {}

  const mergedMeta = {
    ...basePayload,
    _processing: data.metadata ?? {},
  }

  await prisma.shippingWebhookEvent.update({
    where: { eventId },
    data: {
      processedAt: new Date(),
      processingError: data.processingError ?? null,
      shipmentId: data.shipmentId ?? undefined,
      orderId: data.orderId ?? undefined,
      rawPayloadJson: sanitizeSkydropxWebhookPayload(mergedMeta) as Prisma.InputJsonValue,
    },
  })
}

async function sendShippingNotificationEmails(
  prisma: PrismaClient,
  input: {
    order: {
      id: string
      orderNumber: string
      customerEmail: string
      currency: string
      userId: string | null
      guestSessionId: string | null
    }
    shipment: {
      carrier: string | null
      trackingNumber: string | null
      status: ShipmentStatus
    }
    previousStatus: ShipmentStatus
    nextStatus: ShipmentStatus
  },
): Promise<void> {
  const { order, shipment, previousStatus, nextStatus } = input

  let claimToken: string | null = null
  if (!order.userId) {
    try {
      const created = await createOrderClaimToken({
        orderId: order.id,
        sentToEmail: order.customerEmail,
      })
      claimToken = created.token
    } catch {
      claimToken = null
    }
  }

  const trackingLinks = buildOrderEmailTrackingLinks({
    orderNumber: order.orderNumber,
    userId: order.userId,
    claimToken,
  })

  const basePayload = {
    orderNumber: order.orderNumber,
    currency: order.currency,
    carrier: shipment.carrier ?? undefined,
    trackingNumber: shipment.trackingNumber ?? undefined,
    shipmentStatus: nextStatus,
    links: trackingLinks,
    claimUrl: trackingLinks.claimUrl,
    accountOrderUrl: trackingLinks.accountOrderUrl,
  }

  if (shouldSendShippingEmail(previousStatus, nextStatus)) {
    void safeSendTransactionalEmailOnce({
      to: order.customerEmail,
      templateKey: 'shipping_update',
      subject: '',
      orderId: order.id,
      userId: order.userId,
      guestSessionId: order.guestSessionId,
      dedupeKey: 'shipped',
      payload: basePayload,
    })
  }

  if (shouldSendDeliveredEmail(previousStatus, nextStatus)) {
    void safeSendTransactionalEmailOnce({
      to: order.customerEmail,
      templateKey: 'delivered',
      subject: '',
      orderId: order.id,
      userId: order.userId,
      guestSessionId: order.guestSessionId,
      dedupeKey: 'delivered',
      payload: basePayload,
    })
  }
}

/**
 * Processes a Skydropx webhook idempotently (DB updates + optional emails).
 */
export async function processSkydropxWebhook(
  prisma: PrismaClient,
  rawPayload: unknown,
): Promise<SkydropxWebhookProcessResult> {
  const event = extractSkydropxWebhookEvent(rawPayload)
  const sanitized = sanitizeSkydropxWebhookPayload(rawPayload)

  const existing = await prisma.shippingWebhookEvent.findUnique({
    where: { eventId: event.eventId },
  })

  if (existing?.processedAt) {
    return {
      eventId: event.eventId,
      duplicate: true,
      skipped: true,
      reason: 'already_processed',
      shipmentId: existing.shipmentId ?? undefined,
      orderId: existing.orderId ?? undefined,
    }
  }

  if (!existing) {
    await prisma.shippingWebhookEvent.create({
      data: {
        provider: ShippingProvider.SKYDROPX,
        eventId: event.eventId,
        eventType: event.eventType,
        providerShipmentId: event.providerShipmentId,
        rawPayloadJson: sanitized as Prisma.InputJsonValue,
      },
    })
  }

  const transition = mapSkydropxWebhookToShipmentStatus(event)
  if (!transition) {
    await markWebhookProcessed(prisma, event.eventId, {
      processingError: 'unsupported_event_type',
      metadata: { eventType: event.eventType, packageStatus: event.packageStatus },
    })
    return {
      eventId: event.eventId,
      duplicate: false,
      skipped: true,
      reason: 'unsupported_event_type',
    }
  }

  const shipment = await resolveShipment(prisma, event)
  if (!shipment) {
    await markWebhookProcessed(prisma, event.eventId, {
      processingError: 'shipment_not_found',
      metadata: {
        providerShipmentId: event.providerShipmentId,
        trackingNumber: event.trackingNumber,
        orderReference: event.orderReference,
      },
    })
    return {
      eventId: event.eventId,
      duplicate: false,
      skipped: true,
      reason: 'shipment_not_found',
    }
  }

  const previousStatus = shipment.status
  const nextStatus = transition.nextStatus

  if (!shouldApplyShipmentStatus(previousStatus, nextStatus)) {
    await markWebhookProcessed(prisma, event.eventId, {
      shipmentId: shipment.id,
      orderId: shipment.orderId,
      metadata: {
        ignored: true,
        previousStatus,
        nextStatus,
      },
    })
    return {
      eventId: event.eventId,
      duplicate: false,
      skipped: true,
      reason: 'status_not_advanced',
      shipmentId: shipment.id,
      orderId: shipment.orderId,
    }
  }

  const now = new Date()
  const eventMetadata = sanitizeSkydropxWebhookPayload({
    eventType: event.eventType,
    packageStatus: event.packageStatus,
    providerShipmentId: event.providerShipmentId,
    trackingNumber: event.trackingNumber,
  }) as Prisma.InputJsonValue

  await prisma.$transaction(async (tx) => {
    const shipmentUpdate: Prisma.ShipmentUpdateInput = {
      status: nextStatus,
    }

    if (event.carrier) {
      shipmentUpdate.carrier = event.carrier
    }
    if (event.trackingNumber) {
      shipmentUpdate.trackingNumber = event.trackingNumber
    }
    if (event.labelUrl) {
      shipmentUpdate.labelUrl = event.labelUrl
    }
    if (transition.setShippedAt && !shipment.shippedAt) {
      shipmentUpdate.shippedAt = event.occurredAt ?? now
    }
    if (transition.setDeliveredAt) {
      shipmentUpdate.deliveredAt = event.occurredAt ?? now
    }

    await tx.shipment.update({
      where: { id: shipment.id },
      data: shipmentUpdate,
    })

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: nextStatus,
        message: buildShipmentEventMessage(event),
        metadataJson: eventMetadata,
      },
    })

    const order = shipment.order
    const orderUpdate: Prisma.OrderUpdateInput = {}

    if (
      transition.orderStatus === OrderStatus.DELIVERED &&
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.CANCELLED &&
      order.status !== OrderStatus.REFUNDED
    ) {
      orderUpdate.status = OrderStatus.DELIVERED
    } else if (
      transition.orderStatus === OrderStatus.SHIPPED &&
      order.status !== OrderStatus.DELIVERED &&
      order.status !== OrderStatus.SHIPPED &&
      order.status !== OrderStatus.CANCELLED &&
      order.status !== OrderStatus.REFUNDED
    ) {
      orderUpdate.status = OrderStatus.SHIPPED
    }

    if (transition.fulfillmentStatus) {
      const currentFulfillment = order.fulfillmentStatus
      if (
        transition.fulfillmentStatus === FulfillmentStatus.DELIVERED &&
        currentFulfillment !== FulfillmentStatus.DELIVERED
      ) {
        orderUpdate.fulfillmentStatus = FulfillmentStatus.DELIVERED
      } else if (
        transition.fulfillmentStatus === FulfillmentStatus.SHIPPED &&
        currentFulfillment !== FulfillmentStatus.DELIVERED
      ) {
        orderUpdate.fulfillmentStatus = FulfillmentStatus.SHIPPED
      } else if (
        transition.fulfillmentStatus === FulfillmentStatus.PROCESSING &&
        currentFulfillment === FulfillmentStatus.UNFULFILLED
      ) {
        orderUpdate.fulfillmentStatus = FulfillmentStatus.PROCESSING
      }
    }

    if (Object.keys(orderUpdate).length > 0) {
      await tx.order.update({
        where: { id: order.id },
        data: orderUpdate,
      })
    }

    await tx.orderEvent.create({
      data: {
        orderId: order.id,
        type: OrderEventType.FULFILLMENT_UPDATED,
        message: `Actualización de envío: ${event.providerStatusRaw ?? nextStatus}.`,
        metadataJson: {
          source: 'skydropx_webhook',
          eventId: event.eventId,
          eventType: event.eventType,
          shipmentStatus: nextStatus,
        },
      },
    })
  })

  const updatedShipment = await prisma.shipment.findUniqueOrThrow({
    where: { id: shipment.id },
  })

  void sendShippingNotificationEmails(prisma, {
    order: shipment.order,
    shipment: updatedShipment,
    previousStatus,
    nextStatus,
  })

  await markWebhookProcessed(prisma, event.eventId, {
    shipmentId: shipment.id,
    orderId: shipment.orderId,
    metadata: {
      processed: true,
      previousStatus,
      nextStatus,
      eventType: event.eventType,
    },
  })

  return {
    eventId: event.eventId,
    duplicate: false,
    skipped: false,
    shipmentId: shipment.id,
    orderId: shipment.orderId,
  }
}
