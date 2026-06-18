import 'server-only'

import { NotificationType, PaymentStatus, type PrismaClient } from '@prisma/client'

import { routes } from '@/src/config/routes'

import {
  createAdminNotification,
  createUserNotification,
} from './notification.service'

type PaymentConfirmedNotificationOrder = {
  id: string
  orderNumber: string
  userId: string | null
}

export type PaymentConfirmedNotificationInput = {
  paymentId: string
  order: PaymentConfirmedNotificationOrder
}

export function buildPaymentConfirmedUserDedupeKey(orderId: string): string {
  return `payment-confirmed:user:${orderId}`
}

export function buildPaymentConfirmedAdminDedupeKey(orderId: string): string {
  return `payment-confirmed:admin:${orderId}`
}

/**
 * Returns true when payment status is transitioning into PAID.
 */
export function isPaymentConfirmedTransition(
  paymentStatus: PaymentStatus,
  previousPaymentStatus: PaymentStatus,
): boolean {
  return (
    paymentStatus === PaymentStatus.PAID && previousPaymentStatus !== PaymentStatus.PAID
  )
}

/**
 * Creates in-app notifications when an order payment is confirmed.
 * Call only on transition to PAID (not when already paid).
 */
export async function notifyPaymentConfirmed(
  prisma: PrismaClient,
  input: PaymentConfirmedNotificationInput,
): Promise<void> {
  const { paymentId, order } = input
  const metadataJson = {
    orderId: order.id,
    orderNumber: order.orderNumber,
    paymentId,
  }

  await createAdminNotification(prisma, {
    userId: null,
    type: NotificationType.ADMIN_PAYMENT_RECEIVED,
    title: 'Pago recibido',
    message: `Pago confirmado para el pedido ${order.orderNumber}.`,
    href: routes.adminOrderDetail(order.orderNumber),
    metadataJson,
    dedupeKey: buildPaymentConfirmedAdminDedupeKey(order.id),
  })

  if (!order.userId) return

  await createUserNotification(prisma, {
    userId: order.userId,
    type: NotificationType.PAYMENT_CONFIRMED,
    title: 'Pago confirmado',
    message: `Tu pago del pedido ${order.orderNumber} fue confirmado.`,
    href: routes.accountOrderDetail(order.orderNumber),
    metadataJson,
    dedupeKey: buildPaymentConfirmedUserDedupeKey(order.id),
  })
}

/**
 * Fire-and-forget wrapper: notification failures must not break payment processing.
 */
export async function safeNotifyPaymentConfirmed(
  prisma: PrismaClient,
  input: PaymentConfirmedNotificationInput,
): Promise<void> {
  try {
    await notifyPaymentConfirmed(prisma, input)
  } catch (error) {
    console.error('[notifications:payment-confirmed]', {
      orderId: input.order.id,
      orderNumber: input.order.orderNumber,
      paymentId: input.paymentId,
      message: error instanceof Error ? error.message : error,
    })
  }
}
