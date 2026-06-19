import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { FulfillmentStatus, NotificationType, OrderStatus, ShipmentStatus } from '@prisma/client'

import {
  canRunNotificationDbTests,
  createUniqueTestUser,
  loadPrisma,
  NotificationTestCleanup,
} from './helpers/notification-test-helpers'

const hasDatabase = canRunNotificationDbTests()

async function loadNotifyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/notifications/notify-order-delivered')
}

describe('isOrderDeliveredTransition', () => {
  it('detects delivered transitions only', async () => {
    const { isOrderDeliveredTransition } = await loadNotifyModules()

    assert.equal(
      isOrderDeliveredTransition({
        previousOrderStatus: OrderStatus.SHIPPED,
        newOrderStatus: OrderStatus.DELIVERED,
        previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
        newShipmentStatus: ShipmentStatus.DELIVERED,
      }),
      true,
    )
    assert.equal(
      isOrderDeliveredTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.SHIPPED,
        previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
        newShipmentStatus: ShipmentStatus.IN_TRANSIT,
      }),
      false,
    )
    assert.equal(
      isOrderDeliveredTransition({
        previousOrderStatus: OrderStatus.DELIVERED,
        newOrderStatus: OrderStatus.DELIVERED,
        previousShipmentStatus: ShipmentStatus.DELIVERED,
        newShipmentStatus: ShipmentStatus.DELIVERED,
      }),
      false,
    )
  })
})

describe('notifyOrderDelivered', { skip: !hasDatabase }, () => {
  const cleanup = new NotificationTestCleanup()
  const orderIds: string[] = []

  after(async () => {
    const { prisma } = await loadPrisma()
    if (orderIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          dedupeKey: { in: orderIds.map((id) => `order-delivered:${id}`) },
        },
      })
      await prisma.shipmentEvent.deleteMany({
        where: { shipment: { orderId: { in: orderIds } } },
      })
      await prisma.shipment.deleteMany({ where: { orderId: { in: orderIds } } })
      await prisma.order.deleteMany({ where: { id: { in: orderIds } } })
    }
    await cleanup.dispose()
  })

  async function createShippedMockOrder(params: {
    orderNumber: string
    userId: string | null
  }) {
    const { prisma } = await loadPrisma()
    const { buildMockTrackingNumber } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-provider'
    )

    if (params.userId) cleanup.trackUser(params.userId)

    const order = await prisma.order.create({
      data: {
        orderNumber: params.orderNumber,
        userId: params.userId,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: 'SHIPPED',
        customerEmail: 'delivered-notify@example.com',
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

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: ShipmentStatus.IN_TRANSIT,
        providerShipmentId: `mock-shipment-${params.orderNumber}`,
        carrier: 'fedex',
        trackingNumber: buildMockTrackingNumber(params.orderNumber),
        shippedAt: new Date(),
      },
    })

    return order
  }

  it('creates ORDER_DELIVERED on mock delivered simulation', async () => {
    const env = process.env as Record<string, string | undefined>
    env.NODE_ENV = 'development'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'delivered-notify', cleanup)
    const orderNumber = `CR-MOCK-DELIVERED-${Date.now()}`
    const order = await createShippedMockOrder({ orderNumber, userId: user.id })

    const { simulateMockShipmentTrackingStatus } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-tracking'
    )
    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'delivered',
    })

    const notification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_DELIVERED,
        dedupeKey: `order-delivered:${order.id}`,
      },
    })

    assert.ok(notification)
    assert.equal(notification?.title, 'Tu pedido fue entregado')
    assert.equal(notification?.message, `Tu pedido ${orderNumber} fue entregado.`)
    assert.deepEqual(notification?.metadataJson, {
      orderId: order.id,
      orderNumber,
      trackingNumber: `CRMOCK-${orderNumber}`,
      carrier: 'fedex',
      status: OrderStatus.DELIVERED,
    })
  })

  it('skips USER notification for guest orders', async () => {
    const env = process.env as Record<string, string | undefined>
    env.NODE_ENV = 'development'
    const { prisma } = await loadPrisma()
    const orderNumber = `CR-MOCK-GUEST-DEL-${Date.now()}`
    const order = await createShippedMockOrder({ orderNumber, userId: null })

    const { simulateMockShipmentTrackingStatus } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-tracking'
    )
    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'delivered',
    })

    const notification = await prisma.notification.findFirst({
      where: {
        type: NotificationType.ORDER_DELIVERED,
        dedupeKey: `order-delivered:${order.id}`,
      },
    })

    assert.equal(notification, null)
  })

  it('does not create ORDER_DELIVERED on in_transit simulation', async () => {
    const env = process.env as Record<string, string | undefined>
    env.NODE_ENV = 'development'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'in-transit-not-delivered', cleanup)
    const orderNumber = `CR-MOCK-INTRANSIT-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        userId: user.id,
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: 'PROCESSING',
        customerEmail: 'in-transit@example.com',
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
        type: NotificationType.ORDER_DELIVERED,
      },
    })

    assert.equal(notification, null)
  })

  it('dedupes repeated delivered notifications', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderDelivered } = await loadNotifyModules()
    const user = await createUniqueTestUser(prisma, 'delivered-dedupe', cleanup)
    const order = await prisma.order.create({
      data: {
        orderNumber: `CR-DELIVERED-DEDUPE-${Date.now()}`,
        userId: user.id,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: 'SHIPPED',
        customerEmail: 'dedupe@example.com',
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

    const input = {
      order: { id: order.id, orderNumber: order.orderNumber, userId: user.id },
      previousOrderStatus: OrderStatus.SHIPPED,
      newOrderStatus: OrderStatus.DELIVERED,
      previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
      newShipmentStatus: ShipmentStatus.DELIVERED,
      trackingNumber: 'TRACK-001',
      carrier: 'fedex',
    }

    await notifyOrderDelivered(prisma, input)
    await notifyOrderDelivered(prisma, input)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_DELIVERED,
        dedupeKey: `order-delivered:${order.id}`,
      },
    })

    assert.equal(notifications.length, 1)
  })

  it('webhook and refresh style delivered transitions share dedupe key', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderDelivered } = await loadNotifyModules()
    const { buildShipmentLifecycleNotificationInput } = await import(
      '@/src/server/shipping/skydropx/skydropx-shipment-status'
    )
    const user = await createUniqueTestUser(prisma, 'delivered-shared-dedupe', cleanup)
    const order = await prisma.order.create({
      data: {
        orderNumber: `CR-DELIVERED-SHARED-${Date.now()}`,
        userId: user.id,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: 'SHIPPED',
        customerEmail: 'shared-dedupe@example.com',
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

    const transition = {
      nextStatus: ShipmentStatus.DELIVERED,
      orderStatus: OrderStatus.DELIVERED,
      fulfillmentStatus: FulfillmentStatus.DELIVERED,
      setDeliveredAt: true,
    } as const

    const webhookInput = buildShipmentLifecycleNotificationInput({
      order,
      previousOrderStatus: OrderStatus.SHIPPED,
      previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
      transition,
      trackingNumber: 'TRACK-002',
      carrier: 'fedex',
    })
    const refreshInput = buildShipmentLifecycleNotificationInput({
      order,
      previousOrderStatus: OrderStatus.SHIPPED,
      previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
      transition,
      trackingNumber: 'TRACK-002',
      carrier: 'fedex',
    })

    await notifyOrderDelivered(prisma, webhookInput)
    await notifyOrderDelivered(prisma, refreshInput)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_DELIVERED,
        dedupeKey: `order-delivered:${order.id}`,
      },
    })

    assert.equal(notifications.length, 1)
  })
})

describe('webhook delivered mapping', () => {
  it('maps delivered package status to DELIVERED transition', async () => {
    await import('./helpers/mock-server-only')
    const { mapSkydropxPackageStatusToTransition } = await import(
      '@/src/server/shipping/skydropx/skydropx-shipment-status'
    )

    const transition = mapSkydropxPackageStatusToTransition({
      packageStatus: 'delivered',
      eventType: 'package.delivered',
    })

    assert.equal(transition?.nextStatus, ShipmentStatus.DELIVERED)
    assert.equal(transition?.orderStatus, OrderStatus.DELIVERED)
  })
})

describe('refresh delivered mapping', () => {
  it('maps tracking refresh delivered response to DELIVERED transition', async () => {
    await import('./helpers/mock-server-only')
    const { resolveRefreshTrackingTransition } = await import(
      '@/src/server/shipping/skydropx/skydropx-shipment-status'
    )

    const transition = resolveRefreshTrackingTransition(
      ShipmentStatus.IN_TRANSIT,
      { data: { status: 'delivered' } },
      true,
    )

    assert.equal(transition?.nextStatus, ShipmentStatus.DELIVERED)
    assert.equal(transition?.orderStatus, OrderStatus.DELIVERED)
  })
})

describe('safeNotifyOrderDelivered', () => {
  it('does not throw when notification persistence fails', async () => {
    const { safeNotifyOrderDelivered } = await loadNotifyModules()
    await assert.doesNotReject(() =>
      safeNotifyOrderDelivered(
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
            orderNumber: 'CR-2026-SAFE-DELIVERED',
            userId: '33333333-3333-4333-8333-333333333333',
          },
          previousOrderStatus: OrderStatus.SHIPPED,
          newOrderStatus: OrderStatus.DELIVERED,
          previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
          newShipmentStatus: ShipmentStatus.DELIVERED,
        },
      ),
    )
  })
})

describe('label generation does not notify delivered', () => {
  it('label_generated mock status is not a delivered transition', async () => {
    const { isOrderDeliveredTransition } = await loadNotifyModules()

    assert.equal(
      isOrderDeliveredTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.READY_TO_SHIP,
        previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
        newShipmentStatus: ShipmentStatus.LABEL_CREATED,
      }),
      false,
    )
  })
})
