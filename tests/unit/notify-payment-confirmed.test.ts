import { config } from 'dotenv'
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import {
  NotificationAudience,
  NotificationType,
  PaymentProvider,
  PaymentStatus,
} from '@prisma/client'

config({ path: '.env.local' })

function canRunDbIntegrationTests(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return false
  if (url.includes('localhost:5432/chef_room')) return false
  return true
}

const hasDatabase = canRunDbIntegrationTests()

async function loadPrismaModules() {
  await import('./helpers/mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

async function loadNotifyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/notifications/notify-payment-confirmed')
}

async function loadConektaApplyModules() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/payments/conekta/conekta-payment-apply')
}

describe('isPaymentConfirmedTransition', () => {
  it('returns true only when transitioning into PAID', async () => {
    const { isPaymentConfirmedTransition } = await loadNotifyModules()

    assert.equal(isPaymentConfirmedTransition(PaymentStatus.PAID, PaymentStatus.PENDING), true)
    assert.equal(isPaymentConfirmedTransition(PaymentStatus.PAID, PaymentStatus.PAID), false)
    assert.equal(isPaymentConfirmedTransition(PaymentStatus.FAILED, PaymentStatus.PENDING), false)
  })
})

describe('notifyPaymentConfirmed', { skip: !hasDatabase }, () => {
  const cleanup = {
    notificationIds: [] as string[],
    paymentIds: [] as string[],
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
              `payment-confirmed:user:${orderId}`,
              `payment-confirmed:admin:${orderId}`,
            ]),
          },
        },
      })
      await prisma.payment.deleteMany({ where: { orderId: { in: cleanup.orderIds } } })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  async function createOrderWithPayment(params: { userId: string | null; orderNumber: string }) {
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
        customerEmail: 'payment-notify-test@example.com',
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

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProvider.CONEKTA,
        providerOrderId: `ord_test_${order.id.slice(0, 8)}`,
        status: PaymentStatus.PENDING,
        amountCents: 1000,
        currency: 'MXN',
        method: 'CARD',
      },
    })
    cleanup.paymentIds.push(payment.id)

    return { order, payment }
  }

  it('creates USER notification when order has userId', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyPaymentConfirmed } = await loadNotifyModules()

    const user = await prisma.user.create({
      data: {
        name: 'Payment Notify User',
        email: `payment-notify-user-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const { order, payment } = await createOrderWithPayment({
      userId: user.id,
      orderNumber: `CR-PAY-NOTIFY-${Date.now()}`,
    })

    await notifyPaymentConfirmed(prisma, {
      paymentId: payment.id,
      order,
    })

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { dedupeKey: `payment-confirmed:user:${order.id}` },
          { dedupeKey: `payment-confirmed:admin:${order.id}` },
        ],
      },
    })
    cleanup.notificationIds.push(...notifications.map((row) => row.id))

    const userNotification = notifications.find((row) => row.audience === NotificationAudience.USER)

    assert.ok(userNotification)
    assert.equal(userNotification.type, NotificationType.PAYMENT_CONFIRMED)
    assert.equal(userNotification.userId, user.id)
    assert.equal(userNotification.title, 'Pago confirmado')
    assert.match(userNotification.message, new RegExp(order.orderNumber))
    assert.equal(userNotification.href, `/account/orders/${order.orderNumber}`)
    assert.deepEqual(userNotification.metadataJson, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: payment.id,
    })
  })

  it('creates ADMIN_PAYMENT_RECEIVED notification for every paid order', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyPaymentConfirmed } = await loadNotifyModules()

    const { order, payment } = await createOrderWithPayment({
      userId: null,
      orderNumber: `CR-PAY-ADMIN-${Date.now()}`,
    })

    await notifyPaymentConfirmed(prisma, {
      paymentId: payment.id,
      order,
    })

    const adminNotification = await prisma.notification.findFirst({
      where: { dedupeKey: `payment-confirmed:admin:${order.id}` },
    })

    assert.ok(adminNotification)
    cleanup.notificationIds.push(adminNotification.id)
    assert.equal(adminNotification.audience, NotificationAudience.ADMIN)
    assert.equal(adminNotification.type, NotificationType.ADMIN_PAYMENT_RECEIVED)
    assert.equal(adminNotification.userId, null)
    assert.equal(adminNotification.title, 'Pago recibido')
    assert.match(adminNotification.message, new RegExp(order.orderNumber))
    assert.equal(adminNotification.href, `/admin/orders/${encodeURIComponent(order.orderNumber)}`)
  })

  it('does not create USER notification for guest paid orders', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyPaymentConfirmed } = await loadNotifyModules()

    const { order, payment } = await createOrderWithPayment({
      userId: null,
      orderNumber: `CR-PAY-GUEST-${Date.now()}`,
    })

    await notifyPaymentConfirmed(prisma, {
      paymentId: payment.id,
      order,
    })

    const userNotification = await prisma.notification.findFirst({
      where: { dedupeKey: `payment-confirmed:user:${order.id}` },
    })
    const adminNotification = await prisma.notification.findFirst({
      where: { dedupeKey: `payment-confirmed:admin:${order.id}` },
    })

    assert.equal(userNotification, null)
    assert.ok(adminNotification)
    cleanup.notificationIds.push(adminNotification.id)
  })

  it('does not create duplicate notifications when called twice', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyPaymentConfirmed } = await loadNotifyModules()

    const user = await prisma.user.create({
      data: {
        name: 'Payment Dedupe User',
        email: `payment-notify-dedupe-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const { order, payment } = await createOrderWithPayment({
      userId: user.id,
      orderNumber: `CR-PAY-DEDUPE-${Date.now()}`,
    })

    const input = { paymentId: payment.id, order }
    await notifyPaymentConfirmed(prisma, input)
    await notifyPaymentConfirmed(prisma, input)

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [
          { dedupeKey: `payment-confirmed:user:${order.id}` },
          { dedupeKey: `payment-confirmed:admin:${order.id}` },
        ],
      },
    })
    cleanup.notificationIds.push(...notifications.map((row) => row.id))

    assert.equal(notifications.length, 2)
  })

  it('does not store raw provider payloads in metadata', async () => {
    const { prisma } = await loadPrismaModules()
    const { notifyPaymentConfirmed } = await loadNotifyModules()

    const { order, payment } = await createOrderWithPayment({
      userId: null,
      orderNumber: `CR-PAY-META-${Date.now()}`,
    })

    await notifyPaymentConfirmed(prisma, {
      paymentId: payment.id,
      order,
    })

    const adminNotification = await prisma.notification.findFirst({
      where: { dedupeKey: `payment-confirmed:admin:${order.id}` },
    })

    assert.ok(adminNotification)
    cleanup.notificationIds.push(adminNotification.id)
    assert.deepEqual(adminNotification.metadataJson, {
      orderId: order.id,
      orderNumber: order.orderNumber,
      paymentId: payment.id,
    })
  })
})

describe('safeNotifyPaymentConfirmed', () => {
  it('does not throw when notification creation fails', async () => {
    await import('./helpers/mock-server-only')
    const { safeNotifyPaymentConfirmed } = await loadNotifyModules()

    const failingPrisma = {
      notification: {
        findUnique: async () => {
          throw new Error('database unavailable')
        },
      },
    }

    await assert.doesNotReject(() =>
      safeNotifyPaymentConfirmed(failingPrisma as never, {
        paymentId: '11111111-1111-4111-8111-111111111111',
        order: {
          id: '22222222-2222-4222-8222-222222222222',
          orderNumber: 'CR-FAIL-001',
          userId: null,
        },
      }),
    )
  })
})

describe('sendConektaPaymentStatusEmails payment notifications', { skip: !hasDatabase }, () => {
  const cleanup = {
    notificationIds: [] as string[],
    paymentIds: [] as string[],
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
              `payment-confirmed:user:${orderId}`,
              `payment-confirmed:admin:${orderId}`,
            ]),
          },
        },
      })
      await prisma.payment.deleteMany({ where: { orderId: { in: cleanup.orderIds } } })
      await prisma.order.deleteMany({ where: { id: { in: cleanup.orderIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  it('does not notify when payment status is already PAID', async () => {
    const { prisma } = await loadPrismaModules()
    const { sendConektaPaymentStatusEmails } = await loadConektaApplyModules()

    const order = await prisma.order.create({
      data: {
        orderNumber: `CR-PAY-ALREADY-${Date.now()}`,
        userId: null,
        status: 'PAID',
        fulfillmentStatus: 'UNFULFILLED',
        customerEmail: 'already-paid@example.com',
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

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProvider.CONEKTA,
        providerOrderId: `ord_already_${order.id.slice(0, 8)}`,
        status: PaymentStatus.PAID,
        amountCents: 1000,
        currency: 'MXN',
        method: 'CARD',
      },
    })
    cleanup.paymentIds.push(payment.id)

    await sendConektaPaymentStatusEmails(
      {
        id: payment.id,
        orderId: order.id,
        amountCents: payment.amountCents,
        order: {
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          currency: order.currency,
          userId: order.userId,
          guestSessionId: order.guestSessionId,
        },
      },
      PaymentStatus.PAID,
      PaymentStatus.PAID,
    )

    const notifications = await prisma.notification.findMany({
      where: {
        OR: [{ dedupeKey: `payment-confirmed:admin:${order.id}` }],
      },
    })

    assert.equal(notifications.length, 0)
  })

  it('notifies only on transition to PAID', async () => {
    const { prisma } = await loadPrismaModules()
    const { sendConektaPaymentStatusEmails } = await loadConektaApplyModules()

    const order = await prisma.order.create({
      data: {
        orderNumber: `CR-PAY-TRANSITION-${Date.now()}`,
        userId: null,
        status: 'PENDING_PAYMENT',
        fulfillmentStatus: 'UNFULFILLED',
        customerEmail: 'transition-paid@example.com',
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

    const payment = await prisma.payment.create({
      data: {
        orderId: order.id,
        provider: PaymentProvider.CONEKTA,
        providerOrderId: `ord_transition_${order.id.slice(0, 8)}`,
        status: PaymentStatus.PENDING,
        amountCents: 1000,
        currency: 'MXN',
        method: 'CARD',
      },
    })
    cleanup.paymentIds.push(payment.id)

    await sendConektaPaymentStatusEmails(
      {
        id: payment.id,
        orderId: order.id,
        amountCents: payment.amountCents,
        order: {
          orderNumber: order.orderNumber,
          customerEmail: order.customerEmail,
          currency: order.currency,
          userId: order.userId,
          guestSessionId: order.guestSessionId,
        },
      },
      PaymentStatus.PAID,
      PaymentStatus.PENDING,
    )

    const notifications = await prisma.notification.findMany({
      where: { dedupeKey: `payment-confirmed:admin:${order.id}` },
    })
    cleanup.notificationIds.push(...notifications.map((row) => row.id))

    assert.equal(notifications.length, 1)
  })
})
