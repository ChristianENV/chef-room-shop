import 'server-only'

import { NotificationType, type Order, type PrismaClient } from '@prisma/client'

import { routes } from '@/src/config/routes'

import { createAdminNotification, createUserNotification } from './notification.service'

type OrderCreatedNotificationOrder = Pick<Order, 'id' | 'orderNumber' | 'userId'>

export function buildOrderCreatedUserDedupeKey(orderId: string): string {
  return `order-created:user:${orderId}`
}

export function buildOrderCreatedAdminDedupeKey(orderId: string): string {
  return `order-created:admin:${orderId}`
}

/**
 * Creates in-app notifications for a newly persisted order.
 * Admin broadcast is always created; user notification only when userId is set.
 */
export async function notifyOrderCreated(
  prisma: PrismaClient,
  order: OrderCreatedNotificationOrder,
): Promise<void> {
  const metadataJson = {
    orderId: order.id,
    orderNumber: order.orderNumber,
  }

  await createAdminNotification(prisma, {
    userId: null,
    type: NotificationType.ADMIN_NEW_ORDER,
    title: 'Nuevo pedido',
    message: `Pedido ${order.orderNumber} recibido.`,
    href: routes.adminOrderDetail(order.orderNumber),
    metadataJson,
    dedupeKey: buildOrderCreatedAdminDedupeKey(order.id),
  })

  if (!order.userId) return

  await createUserNotification(prisma, {
    userId: order.userId,
    type: NotificationType.ORDER_CREATED,
    title: 'Pedido creado',
    message: `Recibimos tu pedido ${order.orderNumber}.`,
    href: routes.accountOrderDetail(order.orderNumber),
    metadataJson,
    dedupeKey: buildOrderCreatedUserDedupeKey(order.id),
  })
}

/**
 * Fire-and-forget wrapper: notification failures must not break checkout.
 */
export async function safeNotifyOrderCreated(
  prisma: PrismaClient,
  order: OrderCreatedNotificationOrder,
): Promise<void> {
  try {
    await notifyOrderCreated(prisma, order)
  } catch (error) {
    console.error('[notifications:order-created]', {
      orderId: order.id,
      orderNumber: order.orderNumber,
      message: error instanceof Error ? error.message : error,
    })
  }
}
