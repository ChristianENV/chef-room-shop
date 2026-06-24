import 'server-only'

import { NotificationType, OrderStatus, ShipmentStatus, type PrismaClient } from '@prisma/client'

import { routes } from '@/src/config/routes'

import { createUserNotification } from './notification.service'

export type OrderDeliveredNotificationOrder = {
  id: string
  orderNumber: string
  userId: string | null
}

export type OrderDeliveredNotificationInput = {
  order: OrderDeliveredNotificationOrder
  previousOrderStatus: OrderStatus
  newOrderStatus: OrderStatus
  previousShipmentStatus: ShipmentStatus
  newShipmentStatus: ShipmentStatus
  trackingNumber?: string | null
  carrier?: string | null
}

export function buildOrderDeliveredDedupeKey(orderId: string): string {
  return `order-delivered:${orderId}`
}

export function isOrderDeliveredTransition(
  input: Pick<
    OrderDeliveredNotificationInput,
    'previousOrderStatus' | 'newOrderStatus' | 'previousShipmentStatus' | 'newShipmentStatus'
  >,
): boolean {
  if (
    input.newOrderStatus === OrderStatus.DELIVERED &&
    input.previousOrderStatus !== OrderStatus.DELIVERED
  ) {
    return true
  }

  return (
    input.newShipmentStatus === ShipmentStatus.DELIVERED &&
    input.previousShipmentStatus !== ShipmentStatus.DELIVERED
  )
}

export async function notifyOrderDelivered(
  prisma: PrismaClient,
  input: OrderDeliveredNotificationInput,
): Promise<void> {
  if (!isOrderDeliveredTransition(input)) return
  if (!input.order.userId) return

  await createUserNotification(prisma, {
    userId: input.order.userId,
    type: NotificationType.ORDER_DELIVERED,
    title: 'Tu pedido fue entregado',
    message: `Tu pedido ${input.order.orderNumber} fue entregado.`,
    href: routes.accountOrderDetail(input.order.orderNumber),
    metadataJson: {
      orderId: input.order.id,
      orderNumber: input.order.orderNumber,
      trackingNumber: input.trackingNumber?.trim() || null,
      carrier: input.carrier?.trim() || null,
      status: OrderStatus.DELIVERED,
    },
    dedupeKey: buildOrderDeliveredDedupeKey(input.order.id),
  })
}

export async function safeNotifyOrderDelivered(
  prisma: PrismaClient,
  input: OrderDeliveredNotificationInput,
): Promise<void> {
  try {
    await notifyOrderDelivered(prisma, input)
  } catch (error) {
    console.error('[notifications:order-delivered]', {
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
