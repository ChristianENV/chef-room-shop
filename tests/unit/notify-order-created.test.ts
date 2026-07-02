import { config } from 'dotenv'
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { NotificationAudience, NotificationType } from '@prisma/client'
import { canRunDbIntegrationTests } from './helpers/db-integration'

config({ path: '.env.local' })

const hasDatabase = canRunDbIntegrationTests()

async function loadPrismaModules() {
  await import('./helpers/mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

async function loadNotifyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/notifications/notify-order-created')
}

describe('notifyOrderCreated', { skip: !hasDatabase }, () => {
  const cleanup = {
    notificationIds: [] as string[],
    orderIds: [] as string[],
    userIds: [] as string[],
  }

  after(async () => {
    const { prisma } = await loadPrismaModules()

    if (cleanup.notificationIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: cleanup.notificationIds } },
      })
    }

    if (cleanup.orderIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          dedupeKey: {
            in: cleanup.orderIds.flatMap((orderId) => [
              `order-created:user:${orderId}`,
              `order-created:admin:${orderId}`,
            ]),
          },
        },
      })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  async function createMinimalOrder(params: { userId: string | null; orderNumber: string }) {
    const { prisma } = await loadPrismaModules()

    if (params.userId) {
      cleanup.userIds.push(params.userId)
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: params.orderNumber,
        userId: params.userId,
        status: 'PENDING_PAYMENT',
        fulfillmentStatus: 'UNFULFILLED',
        customerEmail: 'notify-test@example.com',
        subtotalCents: 1000,
        customizationTotalCents: 0,
        shippingCents: 0,
        discountCents: 0,
        taxCents: 0,
        totalCents: 1000,
        currency: 'MXN',
      },
    })
    cleanup.orderIds.push(order.id)

    return order
  }

  it('creates USER notification for authenticated orders', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyOrderCreated } = await loadNotifyModules()

    const user = await prisma.user.create({
      data: {
        name: 'Order Notify User',
        email: `order-notify-user-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const order = await createMinimalOrder({
      userId: user.id,
      orderNumber: `CR-NOTIFY-${Date.now()}`,
    })

    await notifyOrderCreated(prisma, order)

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { dedupeKey: `order-created:user:${order.id}` },
          { dedupeKey: `order-created:admin:${order.id}` },
        ],
      },
    })
    cleanup.notificationIds.push(...notifications.map((row) => row.id))

    const userNotification = notifications.find((row) => row.audience === NotificationAudience.USER)

    assert.ok(userNotification)
    assert.equal(userNotification.audience, NotificationAudience.USER)
    assert.equal(userNotification.type, NotificationType.ORDER_CREATED)
    assert.equal(userNotification.userId, user.id)
    assert.equal(userNotification.title, 'Pedido creado')
    assert.match(userNotification.message, new RegExp(order.orderNumber))
    assert.equal(userNotification.href, `/account/orders/${order.orderNumber}`)
    assert.deepEqual(userNotification.metadataJson, {
      orderId: order.id,
      orderNumber: order.orderNumber,
    })
  })

  it('creates ADMIN_NEW_ORDER notification for every order', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyOrderCreated } = await loadNotifyModules()

    const order = await createMinimalOrder({
      userId: null,
      orderNumber: `CR-NOTIFY-ADMIN-${Date.now()}`,
    })

    await notifyOrderCreated(prisma, order)

    const adminNotification = await prisma.notification.findFirst({
      where: {
        dedupeKey: `order-created:admin:${order.id}`,
      },
    })

    assert.ok(adminNotification)
    cleanup.notificationIds.push(adminNotification.id)
    assert.equal(adminNotification.audience, NotificationAudience.ADMIN)
    assert.equal(adminNotification.type, NotificationType.ADMIN_NEW_ORDER)
    assert.equal(adminNotification.userId, null)
    assert.equal(adminNotification.title, 'Nuevo pedido')
    assert.match(adminNotification.message, new RegExp(order.orderNumber))
    assert.equal(adminNotification.href, `/admin/orders/${encodeURIComponent(order.orderNumber)}`)
  })

  it('does not create USER notification for guest orders', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyOrderCreated } = await loadNotifyModules()

    const order = await createMinimalOrder({
      userId: null,
      orderNumber: `CR-NOTIFY-GUEST-${Date.now()}`,
    })

    await notifyOrderCreated(prisma, order)

    const userNotification = await prisma.notification.findFirst({
      where: {
        dedupeKey: `order-created:user:${order.id}`,
      },
    })
    const adminNotification = await prisma.notification.findFirst({
      where: {
        dedupeKey: `order-created:admin:${order.id}`,
      },
    })

    assert.equal(userNotification, null)
    assert.ok(adminNotification)
    cleanup.notificationIds.push(adminNotification.id)
  })

  it('does not create duplicate notifications when called twice', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyOrderCreated } = await loadNotifyModules()

    const user = await prisma.user.create({
      data: {
        name: 'Dedupe User',
        email: `order-notify-dedupe-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const order = await createMinimalOrder({
      userId: user.id,
      orderNumber: `CR-NOTIFY-DEDUPE-${Date.now()}`,
    })

    await notifyOrderCreated(prisma, order)
    await notifyOrderCreated(prisma, order)

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { dedupeKey: `order-created:user:${order.id}` },
          { dedupeKey: `order-created:admin:${order.id}` },
        ],
      },
    })

    cleanup.notificationIds.push(...notifications.map((row) => row.id))

    assert.equal(notifications.length, 2)
    assert.equal(
      notifications.filter((row) => row.audience === NotificationAudience.USER).length,
      1,
    )
    assert.equal(
      notifications.filter((row) => row.audience === NotificationAudience.ADMIN).length,
      1,
    )
  })
})

describe('safeNotifyOrderCreated', () => {
  it('does not throw when notification creation fails', async () => {
    await import('./helpers/mock-server-only')
    const { safeNotifyOrderCreated } = await loadNotifyModules()

    const failingPrisma = {
      notification: {
        findUnique: async () => {
          throw new Error('database unavailable')
        },
      },
    }

    await assert.doesNotReject(() =>
      safeNotifyOrderCreated(failingPrisma as never, {
        id: '11111111-1111-4111-8111-111111111111',
        orderNumber: 'CR-FAIL-001',
        userId: null,
      }),
    )
  })
})
