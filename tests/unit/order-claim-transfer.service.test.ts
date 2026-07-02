import { config } from 'dotenv'
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { canRunDbIntegrationTests } from './helpers/db-integration'

config({ path: '.env.local' })

const hasDatabase = canRunDbIntegrationTests()

async function loadModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/orders/order-claim-transfer.service')
}

async function loadPrismaModules() {
  await import('./helpers/mock-server-only')
  const [{ OrderStatus }, prismaModule, checkoutTokenModule, claimTokenModule] = await Promise.all([
    import('@prisma/client'),
    import('@/src/server/db/prisma'),
    import('@/src/server/checkout/checkout-return-token'),
    import('@/src/server/orders/order-claim-token'),
  ])

  return {
    OrderStatus,
    prisma: prismaModule.prisma,
    createCheckoutReturnToken: checkoutTokenModule.createCheckoutReturnToken,
    generateOrderClaimToken: claimTokenModule.generateOrderClaimToken,
    hashOrderClaimToken: claimTokenModule.hashOrderClaimToken,
  }
}

describe('order claim transfer service', { skip: !hasDatabase }, () => {
  const cleanup: {
    orderIds: string[]
    userIds: string[]
    transferIds: string[]
  } = { orderIds: [], userIds: [], transferIds: [] }

  after(async () => {
    const { prisma } = await loadPrismaModules()

    if (cleanup.transferIds.length > 0) {
      await prisma.orderClaimTransferRequest.deleteMany({
        where: { id: { in: cleanup.transferIds } },
      })
    }

    if (cleanup.orderIds.length > 0) {
      await prisma.checkoutReturnToken.deleteMany({
        where: { orderId: { in: cleanup.orderIds } },
      })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  it('creates a pending transfer request when emails mismatch', async () => {
    const { OrderStatus, prisma, createCheckoutReturnToken } = await loadPrismaModules()
    const { requestOrderClaimTransfer } = await loadModules()
    const { OrderClaimTransferRequestStatus } = await import('@prisma/client')

    const requester = await prisma.user.create({
      data: {
        name: 'Transfer Test User',
        email: `chef-transfer-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(requester.id)

    const order = await prisma.order.create({
      data: {
        orderNumber: `TRF-${Date.now()}`,
        customerEmail: 'compras@restaurante.com',
        status: OrderStatus.PAID,
        subtotalCents: 10000,
        totalCents: 10000,
      },
    })
    cleanup.orderIds.push(order.id)

    const tokenResult = await createCheckoutReturnToken({ orderId: order.id })

    const result = await requestOrderClaimTransfer({
      orderNumber: order.orderNumber,
      checkoutToken: tokenResult.token,
      requestedByUserId: requester.id,
      requestedByEmail: requester.email,
    })

    assert.equal(result.success, true)
    assert.equal(result.status, 'SENT')

    const transfer = await prisma.orderClaimTransferRequest.findFirst({
      where: {
        orderId: order.id,
        requestedByUserId: requester.id,
        status: OrderClaimTransferRequestStatus.PENDING,
      },
    })

    assert.ok(transfer)
    cleanup.transferIds.push(transfer.id)
  })

  it('approves a valid transfer token and links the order', async () => {
    const { OrderStatus, prisma, generateOrderClaimToken, hashOrderClaimToken } =
      await loadPrismaModules()
    const { approveOrderClaimTransfer, getOrderClaimTransferPreview } = await loadModules()
    const { OrderClaimTransferRequestStatus } = await import('@prisma/client')

    const requester = await prisma.user.create({
      data: {
        name: 'Transfer Test User',
        email: `chef-approve-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(requester.id)

    const order = await prisma.order.create({
      data: {
        orderNumber: `TRF-approve-${Date.now()}`,
        customerEmail: 'compras-approve@restaurante.com',
        status: OrderStatus.PAID,
        subtotalCents: 10000,
        totalCents: 10000,
      },
    })
    cleanup.orderIds.push(order.id)

    const plainToken = generateOrderClaimToken()
    const transfer = await prisma.orderClaimTransferRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: requester.id,
        requestedByEmail: requester.email,
        orderEmail: order.customerEmail,
        tokenHash: hashOrderClaimToken(plainToken),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    })
    cleanup.transferIds.push(transfer.id)

    const preview = await getOrderClaimTransferPreview(plainToken)
    assert.ok(preview)
    assert.equal(preview.orderNumber, order.orderNumber)

    const approveResult = await approveOrderClaimTransfer(plainToken)
    assert.equal(approveResult.success, true)
    assert.equal(approveResult.status, 'APPROVED')

    const updatedOrder = await prisma.order.findUnique({ where: { id: order.id } })
    assert.equal(updatedOrder?.userId, requester.id)

    const updatedTransfer = await prisma.orderClaimTransferRequest.findUnique({
      where: { id: transfer.id },
    })
    assert.equal(updatedTransfer?.status, OrderClaimTransferRequestStatus.APPROVED)
    assert.ok(updatedTransfer?.consumedAt)
  })

  it('rejects expired transfer tokens', async () => {
    const { OrderStatus, prisma, generateOrderClaimToken, hashOrderClaimToken } =
      await loadPrismaModules()
    const { approveOrderClaimTransfer } = await loadModules()

    const requester = await prisma.user.create({
      data: {
        name: 'Transfer Test User',
        email: `chef-expired-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(requester.id)

    const order = await prisma.order.create({
      data: {
        orderNumber: `TRF-expired-${Date.now()}`,
        customerEmail: 'compras-expired@restaurante.com',
        status: OrderStatus.PAID,
        subtotalCents: 10000,
        totalCents: 10000,
      },
    })
    cleanup.orderIds.push(order.id)

    const plainToken = generateOrderClaimToken()
    const transfer = await prisma.orderClaimTransferRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: requester.id,
        requestedByEmail: requester.email,
        orderEmail: order.customerEmail,
        tokenHash: hashOrderClaimToken(plainToken),
        expiresAt: new Date(Date.now() - 60_000),
      },
    })
    cleanup.transferIds.push(transfer.id)

    const result = await approveOrderClaimTransfer(plainToken)
    assert.equal(result.success, false)
    assert.equal(result.status, 'TOKEN_EXPIRED')
  })

  it('rejects when order is already claimed by another user', async () => {
    const { OrderStatus, prisma, generateOrderClaimToken, hashOrderClaimToken } =
      await loadPrismaModules()
    const { approveOrderClaimTransfer } = await loadModules()

    const requester = await prisma.user.create({
      data: {
        name: 'Transfer Test User',
        email: `chef-blocked-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    const owner = await prisma.user.create({
      data: {
        name: 'Owner Test User',
        email: `owner-blocked-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(requester.id, owner.id)

    const order = await prisma.order.create({
      data: {
        orderNumber: `TRF-blocked-${Date.now()}`,
        customerEmail: 'compras-blocked@restaurante.com',
        status: OrderStatus.PAID,
        subtotalCents: 10000,
        totalCents: 10000,
        userId: owner.id,
      },
    })
    cleanup.orderIds.push(order.id)

    const plainToken = generateOrderClaimToken()
    const transfer = await prisma.orderClaimTransferRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: requester.id,
        requestedByEmail: requester.email,
        orderEmail: order.customerEmail,
        tokenHash: hashOrderClaimToken(plainToken),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
      },
    })
    cleanup.transferIds.push(transfer.id)

    const result = await approveOrderClaimTransfer(plainToken)
    assert.equal(result.success, false)
    assert.equal(result.status, 'ORDER_ALREADY_CLAIMED')
  })

  it('does not allow reusing an approved token', async () => {
    const { OrderStatus, prisma, generateOrderClaimToken, hashOrderClaimToken } =
      await loadPrismaModules()
    const { approveOrderClaimTransfer } = await loadModules()
    const { OrderClaimTransferRequestStatus } = await import('@prisma/client')

    const requester = await prisma.user.create({
      data: {
        name: 'Transfer Test User',
        email: `chef-used-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(requester.id)

    const order = await prisma.order.create({
      data: {
        orderNumber: `TRF-used-${Date.now()}`,
        customerEmail: 'compras-used@restaurante.com',
        status: OrderStatus.PAID,
        subtotalCents: 10000,
        totalCents: 10000,
      },
    })
    cleanup.orderIds.push(order.id)

    const plainToken = generateOrderClaimToken()
    const transfer = await prisma.orderClaimTransferRequest.create({
      data: {
        orderId: order.id,
        requestedByUserId: requester.id,
        requestedByEmail: requester.email,
        orderEmail: order.customerEmail,
        tokenHash: hashOrderClaimToken(plainToken),
        expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000),
        status: OrderClaimTransferRequestStatus.APPROVED,
        consumedAt: new Date(),
      },
    })
    cleanup.transferIds.push(transfer.id)

    const result = await approveOrderClaimTransfer(plainToken)
    assert.equal(result.success, false)
    assert.equal(result.status, 'ALREADY_USED')
  })
})

describe('order claim transfer service without database', () => {
  it('returns null preview for invalid token', async () => {
    const { getOrderClaimTransferPreview } = await loadModules()
    const preview = await getOrderClaimTransferPreview('')
    assert.equal(preview, null)
  })

  it('returns TOKEN_INVALID for approve with empty token', async () => {
    const { approveOrderClaimTransfer } = await loadModules()
    const result = await approveOrderClaimTransfer('')
    assert.equal(result.success, false)
    assert.equal(result.status, 'TOKEN_INVALID')
  })
})
