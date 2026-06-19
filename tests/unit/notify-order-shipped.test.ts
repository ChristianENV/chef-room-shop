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
  it('detects order transition into SHIPPED', async () => {
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
        newOrderStatus: OrderStatus.SHIPPED,
        previousShipmentStatus: ShipmentStatus.IN_TRANSIT,
        newShipmentStatus: ShipmentStatus.IN_TRANSIT,
      }),
      false,
    )
  })

  it('detects shipment transition into IN_TRANSIT without order update', async () => {
    const { isOrderShippedTransition } = await loadNotifyModules()

    assert.equal(
      isOrderShippedTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.READY_TO_SHIP,
        previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
        newShipmentStatus: ShipmentStatus.IN_TRANSIT,
      }),
      true,
    )
  })

  it('does not treat label creation as shipped', async () => {
    const { isOrderShippedTransition } = await loadNotifyModules()

    assert.equal(
      isOrderShippedTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.READY_TO_SHIP,
        previousShipmentStatus: ShipmentStatus.PENDING,
        newShipmentStatus: ShipmentStatus.LABEL_CREATED,
      }),
      false,
    )
  })

  it('does not treat delivered transition as shipped', async () => {
    const { isOrderShippedTransition } = await loadNotifyModules()

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
  const ORIGINAL_SKYDROPX_MODE = process.env.SKYDROPX_MODE

  after(async () => {
    process.env.SKYDROPX_MODE = ORIGINAL_SKYDROPX_MODE
    const { prisma } = await loadPrisma()

    if (orderIds.length > 0) {
      await prisma.notification.deleteMany({
        where: {
          dedupeKey: {
            in: orderIds.map((orderId) => `order-shipped:${orderId}`),
          },
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

  async function createReadyToShipMockOrder(params: {
    orderNumber: string
    userId: string | null
  }) {
    const { prisma } = await loadPrisma()
    const { buildMockTrackingNumber } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-provider'
    )

    if (params.userId) {
      cleanup.trackUser(params.userId)
    }

    const order = await prisma.order.create({
      data: {
        orderNumber: params.orderNumber,
        userId: params.userId,
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: 'PROCESSING',
        customerEmail: 'order-shipped-notify@example.com',
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
        status: ShipmentStatus.LABEL_CREATED,
        providerShipmentId: `mock-shipment-${params.orderNumber}`,
        carrier: 'fedex',
        trackingNumber: buildMockTrackingNumber(params.orderNumber),
        labelUrl: `/mock-labels/${params.orderNumber}.pdf`,
      },
    })

    return order
  }

  it('creates ORDER_SHIPPED on mock in_transit simulation', async () => {
    process.env.SKYDROPX_MODE = 'mock'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'shipped-notify', cleanup)
    const orderNumber = `CR-MOCK-SHIPPED-${Date.now()}`
    const order = await createReadyToShipMockOrder({ orderNumber, userId: user.id })

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
    assert.equal(notification?.title, 'Tu pedido fue enviado')
    assert.equal(notification?.message, `Tu pedido ${orderNumber} ya fue enviado.`)
    assert.equal(notification?.href, `/account/orders/${orderNumber}`)
    assert.deepEqual(notification?.metadataJson, {
      orderId: order.id,
      orderNumber,
      trackingNumber: `CRMOCK-${orderNumber}`,
      carrier: 'fedex',
      status: OrderStatus.SHIPPED,
    })
  })

  it('skips USER notification for guest orders', async () => {
    process.env.SKYDROPX_MODE = 'mock'
    const { prisma } = await loadPrisma()
    const orderNumber = `CR-MOCK-GUEST-SHIPPED-${Date.now()}`
    const order = await createReadyToShipMockOrder({ orderNumber, userId: null })

    const { simulateMockShipmentTrackingStatus } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-tracking'
    )

    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'in_transit',
    })

    const notification = await prisma.notification.findFirst({
      where: {
        type: NotificationType.ORDER_SHIPPED,
        dedupeKey: `order-shipped:${order.id}`,
      },
    })

    assert.equal(notification, null)
  })

  it('does not create ORDER_SHIPPED on label_generated simulation', async () => {
    process.env.SKYDROPX_MODE = 'mock'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'label-generated-notify', cleanup)
    const orderNumber = `CR-MOCK-LABEL-GEN-${Date.now()}`
    await createReadyToShipMockOrder({ orderNumber, userId: user.id })

    const { simulateMockShipmentTrackingStatus } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-tracking'
    )

    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'label_generated',
    })

    const notification = await prisma.notification.findFirst({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_SHIPPED,
      },
    })

    assert.equal(notification, null)
  })

  it('dedupes repeated shipped notifications', async () => {
    const { prisma } = await loadPrisma()
    const { notifyOrderShipped } = await loadNotifyModules()
    const user = await createUniqueTestUser(prisma, 'shipped-dedupe-direct', cleanup)
    const order = await prisma.order.create({
      data: {
        orderNumber: `CR-SHIPPED-DEDUPE-${Date.now()}`,
        userId: user.id,
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: 'PROCESSING',
        customerEmail: 'order-shipped-dedupe@example.com',
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
      order: {
        id: order.id,
        orderNumber: order.orderNumber,
        userId: user.id,
      },
      previousOrderStatus: OrderStatus.READY_TO_SHIP,
      newOrderStatus: OrderStatus.SHIPPED,
      previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
      newShipmentStatus: ShipmentStatus.IN_TRANSIT,
      trackingNumber: `CRMOCK-${order.orderNumber}`,
      carrier: 'fedex',
    }

    await notifyOrderShipped(prisma, input)
    await notifyOrderShipped(prisma, input)

    const notifications = await prisma.notification.findMany({
      where: {
        userId: user.id,
        type: NotificationType.ORDER_SHIPPED,
        dedupeKey: `order-shipped:${order.id}`,
      },
    })

    assert.equal(notifications.length, 1)
  })

  it('does not create ORDER_SHIPPED on delivered simulation', async () => {
    process.env.SKYDROPX_MODE = 'mock'
    const { prisma } = await loadPrisma()
    const user = await createUniqueTestUser(prisma, 'delivered-not-shipped', cleanup)
    const orderNumber = `CR-MOCK-DELIVERED-${Date.now()}`
    const order = await createReadyToShipMockOrder({ orderNumber, userId: user.id })

    await prisma.order.update({
      where: { id: order.id },
      data: {
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: 'SHIPPED',
      },
    })
    await prisma.shipment.updateMany({
      where: { orderId: order.id },
      data: { status: ShipmentStatus.IN_TRANSIT, shippedAt: new Date() },
    })

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
        type: NotificationType.ORDER_SHIPPED,
        dedupeKey: `order-shipped:${order.id}`,
      },
    })

    assert.equal(notification, null)
  })
})

describe('safeNotifyOrderShipped', () => {
  it('does not throw when notification persistence fails', async () => {
    const { safeNotifyOrderShipped } = await loadNotifyModules()
    const failingPrisma = {
      notification: {
        findFirst: async () => null,
        create: async () => {
          throw new Error('notification db unavailable')
        },
      },
    }

    await assert.doesNotReject(() =>
      safeNotifyOrderShipped(failingPrisma as never, {
        order: {
          id: '22222222-2222-4222-8222-222222222222',
          orderNumber: 'CR-2026-SAFE-SHIPPED',
          userId: '33333333-3333-4333-8333-333333333333',
        },
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: OrderStatus.SHIPPED,
        previousShipmentStatus: ShipmentStatus.LABEL_CREATED,
        newShipmentStatus: ShipmentStatus.IN_TRANSIT,
        trackingNumber: 'CRMOCK-CR-2026-SAFE-SHIPPED',
        carrier: 'fedex',
      }),
    )
  })
})

describe('mock label initial status does not notify shipped', () => {
  it('deriveAdminLabelCreationStatuses stays pre-shipped in mock mode', async () => {
    const { deriveAdminLabelCreationStatuses } = await import(
      '@/src/server/graphql/modules/admin-shipping/admin-shipping-label-status'
    )
    const { isOrderShippedTransition } = await loadNotifyModules()

    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: true,
      hasTracking: true,
    })

    assert.equal(
      isOrderShippedTransition({
        previousOrderStatus: OrderStatus.READY_TO_SHIP,
        newOrderStatus: statuses.orderStatus,
        previousShipmentStatus: ShipmentStatus.PENDING,
        newShipmentStatus: statuses.shipmentStatus,
      }),
      false,
    )
  })
})
