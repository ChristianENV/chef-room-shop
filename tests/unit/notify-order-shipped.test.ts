import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { NotificationType, OrderStatus, ShipmentStatus } from '@prisma/client'

import {
  canRunNotificationDbTests,
  createUniqueTestUser,
  loadPrisma,
  NotificationTestCleanup,
} from './helpers/notification-test-helpers'

const hasDatabase = canRunNotificationDbTests()

async function loadNotifyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/notifications/notify-order-shipped')
}

describe('isOrderShippedTransition', () => {
  it('detects shipped transitions only', async () => {
    const { isOrderShippedTransition } = await loadNotifyModules()

    assert.equal(
      isOrderShippedTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.SHIPPED,
        previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
        newShipmentStatus: ShipmentStatus.IN_TRANSIT,
      }),
      true,
    )
    assert.equal(
      isOrderShippedTransition({
        previousOrderStatus: OrderStatus.SHIPPED,
        newOrderStatus: OrderStatus.DELIVERED,
        previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
        newShipmentStatus: ShipmentStatus.DELIVERED,
      }),
      false,
    )
  })
})

describe('notifyOrderShipped', { skip: !hasDatabase }, () => {
  const cleanup = new NotificationTestCleanup()
  const orderIds: string[] = []

  after(async () => {
    const { prisma } = await loadPrisma()
    if (orderIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          dedupeKey: { in: orderIds.map((id) => `order-shipped:${id}`) },
        },
      })
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
    }
    await cleanup.dispose()
  })

  it('creates ORDER_SHIPPED on mock in_transit simulation', async () => {
    process.env.SKYDROPX_MODE = 'mock'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'shipped-notify', cleanup)
    const orderNumber = `CR-MOCK-SHIPPED-${Date.now()}`
    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: 'PROCESSING',
        customerEmail: 'shipped@example.com',
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
    cleanup.trackUser(user.id)

    const { buildMockTrackingNumber } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-provider'
    )
    await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: ShipmentStatus.LABEL_CREATED,
        providerShipmentId: `mock-shipment-${orderNumber}`,
        carrier: 'fedex',
        trackingNumber: buildMockTrackingNumber(orderNumber),
      },
    })

    const { simulateMockShipmentTrackingStatus } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-tracking'
    )
    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'in_transit',
    })

    const notification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_SHIPPED,
        dedupeKey: `order-shipped:${order.id}`,
      },
    })

    assert.ok(notification)
    assert.deepEqual(notification?.metadataJson, {
      orderId: order.id,
      orderNumber,
      trackingNumber: `CRMOCK-${orderNumber}`,
      carrier: 'fedex',
      status: OrderStatus.SHIPPED,
    })
  })
})

describe('safeNotifyOrderShipped', () => {
  it('does not throw when notification persistence fails', async () => {
    const { safeNotifyOrderShipped } = await loadNotifyModules()
    await assert.doesNotReject(() =>
      safeNotifyOrderShipped(
        {
          notification: {
            findFirst: async () => null,
            create: async () => {
              throw new Error('notification db unavailable')
            },
          },
        } as never,
        {
          order: {
            id: '22222222-2222-4222-8222-222222222222',
            orderNumber: 'CR-2026-SAFE-SHIPPED',
            userId: '33333333-3333-4333-8333-333333333333',
          },
          previousOrderStatus: OrderStatus.READY_TO_SHIP,
          newOrderStatus: OrderStatus.SHIPPED,
          previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
          newShipmentStatus: ShipmentStatus.IN_TRANSIT,
        },
      ),
    )
  })
})
