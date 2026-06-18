import 'server-only'

import {
  NotificationType,
  OrderStatus,
  type Order,
  type PrismaClient,
} from '@prisma/client'

import { routes } from '@/src/config/routes'

import { createUserNotification } from './notification.service'

type OrderStatusNotificationOrder = Pick<Order, 'id' | 'orderNumber' | 'userId'>

export type OrderStatusChangedNotificationInput = {
  order: OrderStatusNotificationOrder
  previousStatus: OrderStatus
  newStatus: OrderStatus
}

export function buildOrderInProductionDedupeKey(orderId: string): string {
  return `order-status:in-production:${orderId}`
}

export function buildOrderReadyToShipDedupeKey(orderId: string): string {
  return `order-status:ready-to-ship:${orderId}`
}

export function isOrderInProductionTransition(
  newStatus: OrderStatus,
  previousStatus: OrderStatus,
): boolean {
  return (
    newStatus === OrderStatus.IN_PRODUCTION &&
    previousStatus !== OrderStatus.IN_PRODUCTION
  )
}

export function isOrderReadyToShipTransition(
  newStatus: OrderStatus,
  previousStatus: OrderStatus,
): boolean {
  return (
    newStatus === OrderStatus.READY_TO_SHIP &&
    previousStatus !== OrderStatus.READY_TO_SHIP
  )
}

/**
 * Creates USER in-app notifications when an order enters production-related statuses.
 * Call only after the order status update is persisted.
 */
export async function notifyOrderStatusChanged(
  prisma: PrismaClient,
  input: OrderStatusChangedNotificationInput,
): Promise<void> {
  const { order, previousStatus, newStatus } = input

  if (!order.userId) return

  const metadataJson = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    status: newStatus,
  }

  if (isOrderInProductionTransition(newStatus, previousStatus)) {
    await createUserNotification(prisma, {
      userId: order.userId,
      type: NotificationType.ORDER_IN_PRODUCTION,
      title: 'Tu pedido está en producción',
      message: `Tu pedido ${order.orderNumber} ya entró a producción.`,
      href: routes.accountOrderDetail(order.orderNumber),
      metadataJson,
      dedupeKey: buildOrderInProductionDedupeKey(order.id),
    })
    return
  }

  if (isOrderReadyToShipTransition(newStatus, previousStatus)) {
    await createUserNotification(prisma, {
      userId: order.userId,
      type: NotificationType.ORDER_READY_TO_SHIP,
      title: 'Tu pedido está listo para envío',
      message: `Tu pedido ${order.orderNumber} ya está listo para envío.`,
      href: routes.accountOrderDetail(order.orderNumber),
      metadataJson,
      dedupeKey: buildOrderReadyToShipDedupeKey(order.id),
    })
  }
}

/**
 * Fire-and-forget wrapper: notification failures must not break order status updates.
 */
export async function safeNotifyOrderStatusChanged(
  prisma: PrismaClient,
  input: OrderStatusChangedNotificationInput,
): Promise<void> {
  try {
    await notifyOrderStatusChanged(prisma, input)
  } catch (error) {
    console.error('[notifications:order-status-changed]', {
      orderId: input.order.id,
      orderNumber: input.order.orderNumber,
      previousStatus: input.previousStatus,
      newStatus: input.newStatus,
      message: error instanceof Error ? error.message : error,
    })
  }
}
