import 'server-only'

import {
  FulfillmentStatus,
  OrderStatus,
  type Prisma,
  type PrismaClient,
  ShipmentStatus,
} from '@prisma/client'

import { safeNotifyOrderDelivered } from '@/src/server/notifications/notify-order-delivered'
import { safeNotifyOrderShipped } from '@/src/server/notifications/notify-order-shipped'

import { buildMockTrackingNumber } from './skydropx.mock-provider'
import { isSkydropxMockMode } from './skydropx.mode'
import { buildShipmentLifecycleNotificationInput } from './skydropx-shipment-status'
import type { ShipmentStatusTransition } from './skydropx.webhook.types'

export const MOCK_TRACKING_STATUSES = [
  'created',
  'label_generated',
  'in_transit',
  'delivered',
  'exception',
] as const

export type MockTrackingStatus = (typeof MOCK_TRACKING_STATUSES)[number]

export type MockTrackingStatusTransition = {
  nextStatus: ShipmentStatus
  orderStatus?: OrderStatus
  fulfillmentStatus?: FulfillmentStatus
  setShippedAt?: boolean
  setDeliveredAt?: boolean
}

export type SimulateMockShipmentTrackingInput = {
  orderId?: string
  orderNumber?: string
  status: MockTrackingStatus
  occurredAt?: Date
}

export type MockShipmentTrackingEventMetadata = {
  orderId: string
  orderNumber: string
  trackingNumber: string
  carrierName: string | null
  trackingStatus: MockTrackingStatus
  occurredAt: string
}

export class MockTrackingSimulationError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'MockTrackingSimulationError'
  }
}

const shipmentWithOrderInclude = {
  order: {
    select: {
      id: true,
      orderNumber: true,
      status: true,
      userId: true,
      fulfillmentStatus: true,
    },
  },
} satisfies Prisma.ShipmentInclude

type ShipmentWithOrder = Prisma.ShipmentGetPayload<{
  include: typeof shipmentWithOrderInclude
}>

export function isMockTrackingNumber(
  trackingNumber: string | null | undefined,
): boolean {
  const value = trackingNumber?.trim() ?? ''
  return value.startsWith('CRMOCK-')
}

export function isMockShipmentRecord(shipment: {
  trackingNumber?: string | null
  providerShipmentId?: string | null
}): boolean {
  if (isMockTrackingNumber(shipment.trackingNumber)) return true
  const providerId = shipment.providerShipmentId?.trim() ?? ''
  return providerId.startsWith('mock-shipment-')
}

export function parseMockTrackingStatus(value: string): MockTrackingStatus {
  const normalized = value.trim().toLowerCase()
  if ((MOCK_TRACKING_STATUSES as readonly string[]).includes(normalized)) {
    return normalized as MockTrackingStatus
  }
  throw new MockTrackingSimulationError(
    `Estado mock inválido. Usa: ${MOCK_TRACKING_STATUSES.join(', ')}.`,
  )
}

/**
 * Maps mock tracking tokens to existing Prisma shipment/order statuses.
 */
export function mapMockTrackingStatusToTransition(
  status: MockTrackingStatus,
): MockTrackingStatusTransition {
  switch (status) {
    case 'created':
      return {
        nextStatus: ShipmentStatus.PENDING,
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
      }
    case 'label_generated':
      return {
        nextStatus: ShipmentStatus.LABEL_CREATED,
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
      }
    case 'in_transit':
      return {
        nextStatus: ShipmentStatus.IN_TRANSIT,
        orderStatus: OrderStatus.SHIPPED,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        setShippedAt: true,
      }
    case 'delivered':
      return {
        nextStatus: ShipmentStatus.DELIVERED,
        orderStatus: OrderStatus.DELIVERED,
        fulfillmentStatus: FulfillmentStatus.DELIVERED,
        setDeliveredAt: true,
        setShippedAt: true,
      }
    case 'exception':
      return {
        nextStatus: ShipmentStatus.FAILED,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
      }
    default: {
      const exhaustive: never = status
      throw new MockTrackingSimulationError(`Estado mock no soportado: ${exhaustive}`)
    }
  }
}

function buildMockTrackingEventMetadata(params: {
  order: { id: string; orderNumber: string }
  shipment: ShipmentWithOrder
  status: MockTrackingStatus
  occurredAt: Date
}): MockShipmentTrackingEventMetadata {
  return {
    orderId: params.order.id,
    orderNumber: params.order.orderNumber,
    trackingNumber:
      params.shipment.trackingNumber?.trim() ||
      buildMockTrackingNumber(params.order.orderNumber),
    carrierName: params.shipment.carrier,
    trackingStatus: params.status,
    occurredAt: params.occurredAt.toISOString(),
  }
}

async function loadShipmentForSimulation(
  prisma: PrismaClient,
  input: SimulateMockShipmentTrackingInput,
): Promise<ShipmentWithOrder> {
  if (!input.orderId && !input.orderNumber?.trim()) {
    throw new MockTrackingSimulationError('Se requiere orderId u orderNumber.')
  }

  const shipment = input.orderId
    ? await prisma.shipment.findFirst({
        where: { orderId: input.orderId },
        include: shipmentWithOrderInclude,
        orderBy: { createdAt: 'desc' },
      })
    : await prisma.shipment.findFirst({
        where: {
          order: { orderNumber: input.orderNumber!.trim(), deletedAt: null },
        },
        include: shipmentWithOrderInclude,
        orderBy: { createdAt: 'desc' },
      })

  if (!shipment) {
    throw new MockTrackingSimulationError('No hay envío registrado para este pedido.')
  }

  if (!isMockShipmentRecord(shipment)) {
    throw new MockTrackingSimulationError(
      'Este envío no es mock. Genera una guía en un entorno local/np primero.',
    )
  }

  return shipment
}

/**
 * Simulates Skydropx tracking status updates without calling the live API.
 * Mock mode only.
 */
export async function simulateMockShipmentTrackingStatus(
  prisma: PrismaClient,
  input: SimulateMockShipmentTrackingInput,
): Promise<ShipmentWithOrder> {
  if (!isSkydropxMockMode()) {
    throw new MockTrackingSimulationError(
      'La simulación de tracking solo está disponible en entornos local/np (modo mock).',
    )
  }

  const status = parseMockTrackingStatus(input.status)
  const transition = mapMockTrackingStatusToTransition(status)
  const occurredAt = input.occurredAt ?? new Date()
  const shipment = await loadShipmentForSimulation(prisma, input)
  const previousOrderStatus = shipment.order.status
  const previousShipmentStatus = shipment.status
  const metadata = buildMockTrackingEventMetadata({
    order: shipment.order,
    shipment,
    status,
    occurredAt,
  })

  const updatedShipment = await prisma.$transaction(async (tx) => {
    const shipmentUpdate: Prisma.ShipmentUpdateInput = {
      status: transition.nextStatus,
      trackingNumber: metadata.trackingNumber,
      shippedAt: transition.setShippedAt
        ? shipment.shippedAt ?? occurredAt
        : shipment.shippedAt,
      deliveredAt: transition.setDeliveredAt
        ? shipment.deliveredAt ?? occurredAt
        : shipment.deliveredAt,
    }

    const nextShipment = await tx.shipment.update({
      where: { id: shipment.id },
      data: shipmentUpdate,
      include: shipmentWithOrderInclude,
    })

    await tx.shipmentEvent.create({
      data: {
        shipmentId: shipment.id,
        status: transition.nextStatus,
        message: `Tracking mock: ${status}.`,
        metadataJson: metadata as Prisma.InputJsonValue,
      },
    })

    if (transition.orderStatus || transition.fulfillmentStatus) {
      await tx.order.update({
        where: { id: shipment.order.id },
        data: {
          ...(transition.orderStatus ? { status: transition.orderStatus } : {}),
          ...(transition.fulfillmentStatus
            ? { fulfillmentStatus: transition.fulfillmentStatus }
            : {}),
        },
      })
    }

    return nextShipment
  })

  const notificationInput = buildShipmentLifecycleNotificationInput({
    order: shipment.order,
    previousOrderStatus,
    previousShipmentStatus,
    transition: {
      nextStatus: transition.nextStatus,
      orderStatus: transition.orderStatus as ShipmentStatusTransition['orderStatus'],
      fulfillmentStatus:
        transition.fulfillmentStatus as ShipmentStatusTransition['fulfillmentStatus'],
      setShippedAt: transition.setShippedAt,
      setDeliveredAt: transition.setDeliveredAt,
    },
    trackingNumber: metadata.trackingNumber,
    carrier: metadata.carrierName,
  })

  void safeNotifyOrderShipped(prisma, notificationInput)
  void safeNotifyOrderDelivered(prisma, notificationInput)

  return updatedShipment
}
