import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { NotificationType, OrderStatus } from '@prisma/client'

import {
  canRunNotificationDbTests,
  createUniqueTestUser,
  loadPrisma,
  NotificationTestCleanup,
} from './helpers/notification-test-helpers'

const hasDatabase = canRunNotificationDbTests()

async function loadNotifyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/notifications/notify-order-status-changed')
}

describe('order status transition helpers', () => {
  it('detects transition into IN_PRODUCTION only', async () => {
    const { isOrderInProductionTransition, isOrderReadyToShipTransition } =
      await loadNotifyModules()

    assert.equal(isOrderInProductionTransition(OrderStatus.IN_PRODUCTION, OrderStatus.PAID), true)
    assert.equal(
      isOrderInProductionTransition(OrderStatus.IN_PRODUCTION, OrderStatus.IN_PRODUCTION),
      false,
    )
    assert.equal(isOrderInProductionTransition(OrderStatus.READY_TO_SHIP, OrderStatus.PAID), false)
    assert.equal(isOrderReadyToShipTransition(OrderStatus.PAID, OrderStatus.PAID), false)
  })

  it('detects transition into READY_TO_SHIP only', async () => {
    const { isOrderReadyToShipTransition } = await loadNotifyModules()

    assert.equal(
      isOrderReadyToShipTransition(OrderStatus.READY_TO_SHIP, OrderStatus.IN_PRODUCTION),
      true,
    )
    assert.equal(
      isOrderReadyToShipTransition(OrderStatus.READY_TO_SHIP, OrderStatus.READY_TO_SHIP),
      false,
    )
    assert.equal(
      isOrderReadyToShipTransition(OrderStatus.SHIPPED, OrderStatus.IN_PRODUCTION),
      false,
    )
  })
})

describe('notifyOrderStatusChanged', { skip: !hasDatabase }, () => {
  const cleanup = new NotificationTestCleanup()
  const orderIds: string[] = []

  after(async () => {
    const { prisma } = await loadPrisma()

    if (orderIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          dedupeKey: {
            in: orderIds.flatMap((orderId) => [
              `order-status:in-production:${orderId}`,
              `order-status:ready-to-ship:${orderId}`,
            ]),
          },
        },
      })
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
    }

    await cleanup.dispose()
  })

  async function createOrder(params: {
    userId: string | null
    orderNumber: string
    status?: OrderStatus
  }) {
    const { prisma } = await loadPrisma()

    if (params.userId) {
      cleanup.trackUser(params.userId)
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: params.orderNumber,
        userId: params.userId,
        status: params.status ?? OrderStatus.PAID,
        fulfillmentStatus: 'UNFULFILLED',
        customerEmail: 'order-status-notify@example.com',
        subtotalCents: 1000,
        customizationTotalCents: 0,
        shippingCents: 0,
        discountCents: 0,
        taxCents: 0,
        totalCents: 1000,
        currency: 'MXN',
      },
    })
    orderIds.push(order.id)

    return order
  }

  async function trackNotificationsForOrder(orderId: string) {
    const { prisma } = await loadPrisma()
    const { buildOrderInProductionDedupeKey, buildOrderReadyToShipDedupeKey } =
      await loadNotifyModules()

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { dedupeKey: buildOrderInProductionDedupeKey(orderId) },
          { dedupeKey: buildOrderReadyToShipDedupeKey(orderId) },
        ],
      },
    })
    cleanup.trackNotifications(notifications.map((row) => row.id))
    return notifications
  }

  it('creates ORDER_IN_PRODUCTION notification for authenticated order', async () => {
    const { prisma } = await loadPrisma()
    const { buildOrderInProductionDedupeKey, notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'in-production', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-PROD-${Date.now()}`,
      status: OrderStatus.PAID,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.PAID,
      newStatus: OrderStatus.IN_PRODUCTION,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    const notification = notifications.find(
      (row) => row.dedupeKey === buildOrderInProductionDedupeKey(order.id),
    )

    assert.ok(notification)
    assert.equal(notification.type, NotificationType.ORDER_IN_PRODUCTION)
    assert.equal(notification.userId, user.id)
    assert.equal(notification.title, 'Tu pedido está en producción')
    assert.match(notification.message, new RegExp(order.orderNumber))
    assert.equal(notification.href, `/account/orders/${order.orderNumber}`)
    assert.deepEqual(notification.metadataJson, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: OrderStatus.IN_PRODUCTION,
    })
  })

  it('creates ORDER_READY_TO_SHIP notification for authenticated order', async () => {
    const { prisma } = await loadPrisma()
    const { buildOrderReadyToShipDedupeKey, notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'ready-to-ship', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-RTS-${Date.now()}`,
      status: OrderStatus.IN_PRODUCTION,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.IN_PRODUCTION,
      newStatus: OrderStatus.READY_TO_SHIP,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    const notification = notifications.find(
      (row) => row.dedupeKey === buildOrderReadyToShipDedupeKey(order.id),
    )

    assert.ok(notification)
    assert.equal(notification.type, NotificationType.ORDER_READY_TO_SHIP)
    assert.equal(notification.userId, user.id)
    assert.equal(notification.title, 'Tu pedido está listo para envío')
    assert.match(notification.message, new RegExp(order.orderNumber))
    assert.deepEqual(notification.metadataJson, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      status: OrderStatus.READY_TO_SHIP,
    })
  })

  it('does not create USER notification for guest orders', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderStatusChanged } = await loadNotifyModules()

    const order = await createOrder({
      userId: null,
      orderNumber: `CR-STATUS-GUEST-${Date.now()}`,
      status: OrderStatus.PAID,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.PAID,
      newStatus: OrderStatus.IN_PRODUCTION,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    assert.equal(notifications.length, 0)
  })

  it('does not create notifications for unrelated status changes', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'unrelated-status', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-UNRELATED-${Date.now()}`,
      status: OrderStatus.PAID,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.PAID,
      newStatus: OrderStatus.SHIPPED,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    assert.equal(notifications.length, 0)
  })

  it('does not create notifications for same-status no-op updates', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'noop-status', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-NOOP-${Date.now()}`,
      status: OrderStatus.IN_PRODUCTION,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.IN_PRODUCTION,
      newStatus: OrderStatus.IN_PRODUCTION,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    assert.equal(notifications.length, 0)
  })

  it('does not create duplicate notifications when called twice', async () => {
    const { prisma } = await loadPrisma()
    const { buildOrderInProductionDedupeKey, notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'dedupe-status', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-DEDUPE-${Date.now()}`,
      status: OrderStatus.PAID,
    })

    const input = {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.PAID,
      newStatus: OrderStatus.IN_PRODUCTION,
    }

    await notifyOrderStatusChanged(prisma, input)
    await notifyOrderStatusChanged(prisma, input)

    const notifications = await trackNotificationsForOrder(order.id)
    assert.equal(
      notifications.filter((row) => row.dedupeKey === buildOrderInProductionDedupeKey(order.id))
        .length,
      1,
    )
  })

  it('does not store sensitive metadata fields', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderStatusChanged } = await loadNotifyModules()

    const user = await createUniqueTestUser(prisma, 'metadata-status', cleanup)
    const order = await createOrder({
      userId: user.id,
      orderNumber: `CR-STATUS-META-${Date.now()}`,
      status: OrderStatus.PAID,
    })

    await notifyOrderStatusChanged(prisma, {
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: order.userId,
      },
      previousStatus: OrderStatus.PAID,
      newStatus: OrderStatus.IN_PRODUCTION,
    })

    const notifications = await trackNotificationsForOrder(order.id)
    const notification = notifications[0]

    assert.ok(notification)
    assert.deepEqual(Object.keys(notification.metadataJson as object).sort(), [
      'orderId',
      'orderNumber',
      'status',
    ])
  })
})

describe('safeNotifyOrderStatusChanged', () => {
  it('does not throw when notification creation fails', async () => {
    const { safeNotifyOrderStatusChanged } = await loadNotifyModules()

    const failingPrisma = {
      notification: {
        findFirst: async () => {
          throw new Error('database unavailable')
        },
      },
    }

    await assert.doesNotReject(() =>
      safeNotifyOrderStatusChanged(failingPrisma as never, {
        order: {
          id: '11111111-1111-4111-8111-111111111111',
          orderNumber: 'CR-FAIL-001',
          userId: '22222222-2222-4222-8222-222222222222',
        },
        previousStatus: OrderStatus.PAID,
        newStatus: OrderStatus.IN_PRODUCTION,
      }),
    )
  })
})
