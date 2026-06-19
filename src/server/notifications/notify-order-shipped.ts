import 'server-only'

import {
  NotificationType,
  OrderStatus,
  ShipmentStatus,
  type PrismaClient,
} from '@prisma/client'

import { routes } from '@/src/config/routes'

import { createUserNotification } from './notification.service'

const SHIPPED_SHIPMENT_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.IN_TRANSIT,
  ShipmentStatus.OUT_FOR_DELIVERY,
]

const PRE_SHIPMENT_STATUSES: ShipmentStatus[] = [
  ShipmentStatus.PENDING,
  ShipmentStatus.LABEL_CREATED,
]

export type OrderShippedNotificationOrder = {
  id: string
  orderNumber: string
  userId: string | null
}

export type OrderShippedNotificationInput = {
  order: OrderShippedNotificationOrder
  previousOrderStatus: OrderStatus
  newOrderStatus: OrderStatus
  previousShipmentStatus: ShipmentStatus
  newShipmentStatus: ShipmentStatus
  trackingNumber?: string | null
  carrier?: string | null
}

export function buildOrderShippedDedupeKey(orderId: string): string {
  return `order-shipped:${orderId}`
}

export function isOrderShippedTransition(
  input: Pick<
    OrderShippedNotificationInput,
    | 'previousOrderStatus'
    | 'newOrderStatus'
    | 'previousShipmentStatus'
    | 'newShipmentStatus'
  >,
): boolean {
  if (
    input.newOrderStatus === OrderStatus.SHIPPED &&
    input.previousOrderStatus !== OrderStatus.SHIPPED &&
    input.previousOrderStatus !== OrderStatus.DELIVERED
  ) {
    return true
  }

  return (
    SHIPPED_SHIPMENT_STATUSES.includes(input.newShipmentStatus) &&
    PRE_SHIPMENT_STATUSES.includes(input.previousShipmentStatus)
  )
}

export async function notifyOrderShipped(
  prisma: PrismaClient,
  input: OrderShippedNotificationInput,
): Promise<void> {
  if (!isOrderShippedTransition(input)) return
  if (!input.order.userId) return

  await createUserNotification(prisma, {
    userId: input.order.userId,
    type: NotificationType.ORDER_SHIPPED,
    title: 'Tu pedido fue enviado',
    message: `Tu pedido ${input.order.orderNumber} ya fue enviado.`,
    href: routes.accountOrderDetail(input.order.orderNumber),
    metadataJson: {
      orderId: input.order.id,
      orderNumber: input.order.orderNumber,
      trackingNumber: input.trackingNumber?.trim() || null,
      carrier: input.carrier?.trim() || null,
      status: OrderStatus.SHIPPED,
    },
    dedupeKey: buildOrderShippedDedupeKey(input.order.id),
  })
}

export async function safeNotifyOrderShipped(
  prisma: PrismaClient,
  input: OrderShippedNotificationInput,
): Promise<void> {
  try {
    await notifyOrderShipped(prisma, input)
  } catch (error) {
    console.error('[notifications:order-shipped]', {
      orderId: input.order.id,
      orderNumber: input.order.orderNumber,
      previousOrderStatus: input.previousOrderStatus,
      newOrderStatus: input.newOrderStatus,
      previousShipmentStatus: input.previousShipmentStatus,
      newShipmentStatus: input.newShipmentStatus,
      message: error instanceof Error ? error.message : error,
    })
  }
}
