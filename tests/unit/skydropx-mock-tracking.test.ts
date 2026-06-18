import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import {
  FulfillmentStatus,
  OrderStatus,
  RoleSlug,
  ShipmentStatus,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { CurrentUser } from '@/src/server/auth/types'
import type { GraphQLContext } from '@/src/server/graphql/context'

function canRunDbIntegrationTests(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return false
  if (url.includes('localhost:5432/chef_room')) return false
  return true
}

const hasDatabase = canRunDbIntegrationTests()

const ORIGINAL_SKYDROPX_MODE = process.env.SKYDROPX_MODE

function setSkydropxMode(mode: 'live' | 'mock' | undefined): void {
  if (mode === undefined) {
    delete process.env.SKYDROPX_MODE
  } else {
    process.env.SKYDROPX_MODE = mode
  }
}

after(() => {
  setSkydropxMode(ORIGINAL_SKYDROPX_MODE as 'live' | 'mock' | undefined)
})

async function loadMockTrackingModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/shipping/skydropx/skydropx.mock-tracking')
}

async function loadPrisma() {
  await import('./helpers/mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

async function loadAdminShippingService() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/graphql/modules/admin-shipping/admin-shipping.service')
}

function buildUser(roles: RoleSlug[]): CurrentUser {
  return {
    id: '11111111-1111-4111-8111-111111111111',
    email: 'admin@example.com',
    emailVerified: true,
    name: 'Test User',
    firstName: null,
    lastName: null,
    phone: null,
    image: null,
    customerTier: 'REGULAR',
    roles,
    permissions: [],
  }
}

function buildContext(user: CurrentUser | null): GraphQLContext {
  return {
    prisma: null as unknown as GraphQLContext['prisma'],
    currentUser: user,
    ipAddress: null,
    userAgent: null,
  }
}

describe('mapMockTrackingStatusToTransition', () => {
  it('maps in_transit to SHIPPED shipment and order states', async () => {
    const { mapMockTrackingStatusToTransition } = await loadMockTrackingModules()
    const transition = mapMockTrackingStatusToTransition('in_transit')

    assert.equal(transition.nextStatus, ShipmentStatus.IN_TRANSIT)
    assert.equal(transition.orderStatus, OrderStatus.SHIPPED)
    assert.equal(transition.fulfillmentStatus, FulfillmentStatus.SHIPPED)
    assert.equal(transition.setShippedAt, true)
  })

  it('maps delivered to DELIVERED shipment and order states', async () => {
    const { mapMockTrackingStatusToTransition } = await loadMockTrackingModules()
    const transition = mapMockTrackingStatusToTransition('delivered')

    assert.equal(transition.nextStatus, ShipmentStatus.DELIVERED)
    assert.equal(transition.orderStatus, OrderStatus.DELIVERED)
    assert.equal(transition.fulfillmentStatus, FulfillmentStatus.DELIVERED)
    assert.equal(transition.setDeliveredAt, true)
  })
})

describe('simulateMockShipmentTrackingStatus', { skip: !hasDatabase }, () => {
  const cleanup = {
    orderIds: [] as string[],
    userIds: [] as string[],
  }

  after(async () => {
    setSkydropxMode(ORIGINAL_SKYDROPX_MODE as 'live' | 'mock' | undefined)
    const { prisma } = await loadPrisma()

    if (cleanup.orderIds.length > 0) {
      await prisma.shipmentEvent.deleteMany({
        where: { shipment: { orderId: { in: cleanup.orderIds } } },
      })
      await prisma.shipment.deleteMany({ where: { orderId: { in: cleanup.orderIds } } })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  async function createMockShipmentOrder(orderNumber: string) {
    const { prisma } = await loadPrisma()
    const { buildMockTrackingNumber } = await import(
      '@/src/server/shipping/skydropx/skydropx.mock-provider'
    )

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        customerEmail: 'mock-tracking@example.com',
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

    const shipment = await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: ShipmentStatus.IN_TRANSIT,
        providerShipmentId: `mock-shipment-${orderNumber}`,
        providerLabelId: `mock-label-${orderNumber}`,
        carrier: 'fedex',
        service: 'standard',
        trackingNumber: buildMockTrackingNumber(orderNumber),
        labelUrl: `/mock-labels/${orderNumber}.pdf`,
        shippedAt: new Date(),
      },
    })

    return { order, shipment }
  }

  it('updates shipment and order on delivered in mock mode', async () => {
    setSkydropxMode('mock')
    const { prisma } = await loadPrisma()
    const { simulateMockShipmentTrackingStatus } = await loadMockTrackingModules()
    const orderNumber = `CR-MOCK-TRACK-DEL-${Date.now()}`
    const { order } = await createMockShipmentOrder(orderNumber)

    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'delivered',
    })

    const shipment = await prisma.shipment.findFirstOrThrow({
      where: { orderId: order.id },
    })
    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } })

    assert.equal(shipment.status, ShipmentStatus.DELIVERED)
    assert.ok(shipment.deliveredAt)
    assert.equal(updatedOrder.status, OrderStatus.DELIVERED)
    assert.equal(updatedOrder.fulfillmentStatus, FulfillmentStatus.DELIVERED)
  })

  it('updates shipment and order on in_transit in mock mode', async () => {
    setSkydropxMode('mock')
    const { prisma } = await loadPrisma()
    const { simulateMockShipmentTrackingStatus } = await loadMockTrackingModules()
    const orderNumber = `CR-MOCK-TRACK-TRANSIT-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.READY_TO_SHIP,
        fulfillmentStatus: FulfillmentStatus.PROCESSING,
        customerEmail: 'mock-tracking@example.com',
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
        labelUrl: `/mock-labels/${orderNumber}.pdf`,
      },
    })

    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'in_transit',
    })

    const shipment = await prisma.shipment.findFirstOrThrow({
      where: { orderId: order.id },
    })
    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } })

    assert.equal(shipment.status, ShipmentStatus.IN_TRANSIT)
    assert.ok(shipment.shippedAt)
    assert.equal(updatedOrder.status, OrderStatus.SHIPPED)
    assert.equal(updatedOrder.fulfillmentStatus, FulfillmentStatus.SHIPPED)
  })

  it('blocks simulation in live mode', async () => {
    setSkydropxMode('live')
    const { prisma } = await loadPrisma()
    const { simulateMockShipmentTrackingStatus, MockTrackingSimulationError } =
      await loadMockTrackingModules()
    const orderNumber = `CR-MOCK-TRACK-LIVE-${Date.now()}`
    await createMockShipmentOrder(orderNumber)

    await assert.rejects(
      () =>
        simulateMockShipmentTrackingStatus(prisma, {
          orderNumber,
          status: 'delivered',
        }),
      (error: unknown) => error instanceof MockTrackingSimulationError,
    )
  })

  it('fails when shipment is not mock', async () => {
    setSkydropxMode('mock')
    const { prisma } = await loadPrisma()
    const { simulateMockShipmentTrackingStatus, MockTrackingSimulationError } =
      await loadMockTrackingModules()
    const orderNumber = `CR-LIVE-TRACK-${Date.now()}`

    const order = await prisma.order.create({
      data: {
        orderNumber,
        status: OrderStatus.SHIPPED,
        fulfillmentStatus: FulfillmentStatus.SHIPPED,
        customerEmail: 'live-tracking@example.com',
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

    await prisma.shipment.create({
      data: {
        orderId: order.id,
        status: ShipmentStatus.IN_TRANSIT,
        providerShipmentId: 'live-shipment-001',
        carrier: 'fedex',
        trackingNumber: '1234567890',
      },
    })

    await assert.rejects(
      () =>
        simulateMockShipmentTrackingStatus(prisma, {
          orderNumber,
          status: 'delivered',
        }),
      (error: unknown) => error instanceof MockTrackingSimulationError,
    )
  })

  it('does not create notifications', async () => {
    setSkydropxMode('mock')
    const { prisma } = await loadPrisma()
    const { simulateMockShipmentTrackingStatus } = await loadMockTrackingModules()
    const orderNumber = `CR-MOCK-TRACK-NOTIF-${Date.now()}`
    const { order } = await createMockShipmentOrder(orderNumber)

    const beforeCount = await prisma.notification.count()

    await simulateMockShipmentTrackingStatus(prisma, {
      orderNumber,
      status: 'delivered',
    })

    const afterCount = await prisma.notification.count()
    assert.equal(afterCount, beforeCount)

    const updatedOrder = await prisma.order.findUniqueOrThrow({ where: { id: order.id } })
    assert.equal(updatedOrder.status, OrderStatus.DELIVERED)
  })
})

describe('adminSimulateMockShipmentTrackingStatus auth', () => {
  it('rejects non-admin callers', async () => {
    const { adminSimulateMockShipmentTrackingStatus } = await loadAdminShippingService()
    const context = buildContext(buildUser([RoleSlug.CUSTOMER]))

    await assert.rejects(
      () =>
        adminSimulateMockShipmentTrackingStatus(context, {
          orderNumber: 'CR-2026-000001',
          trackingStatus: 'in_transit',
        }),
      (error: unknown) => {
        return (
          error instanceof GraphQLError && error.extensions?.code === 'FORBIDDEN'
        )
      },
    )
  })
})
