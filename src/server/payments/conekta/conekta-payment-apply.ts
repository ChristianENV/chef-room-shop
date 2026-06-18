import 'server-only'

import {
  AuditAction,
  OrderEventType,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  type Order,
  type Payment,
  type Prisma,
} from '@prisma/client'

import { buildOrderEmailTrackingLinks } from '@/src/server/email/email.links'
import { safeSendTransactionalEmailOnce } from '@/src/server/email/email.service'
import { createOrderClaimToken } from '@/src/server/orders/order-claim-token'
import {
  isPaymentConfirmedTransition,
  safeNotifyPaymentConfirmed,
} from '@/src/server/notifications/notify-payment-confirmed'
import { prisma } from '@/src/server/db/prisma'

export type ApplyConektaPaymentStatusParams = {
  payment: Payment & { order: Order }
  paymentStatus: PaymentStatus
  source: 'webhook' | 'manual_sync'
  eventType?: string
  chargeId?: string | null
  conektaOrderId?: string
  paymentMethod?: PaymentMethod
  sanitizedPayload: unknown
  /** Webhook always records an attempt; manual sync only when status changes. */
  forceAttempt?: boolean
}

export type ApplyConektaPaymentStatusResult = {
  updated: boolean
  previousPaymentStatus: PaymentStatus
}

/**
 * Applies a Conekta-derived payment status to local Payment/Order records.
 * Shared by webhook processing and manual account verification.
 */
export async function applyConektaPaymentStatusUpdate(
  tx: Prisma.TransactionClient,
  params: ApplyConektaPaymentStatusParams,
): Promise<ApplyConektaPaymentStatusResult> {
  const { payment, paymentStatus, source } = params
  const previousPaymentStatus = payment.status
  const statusChanged = previousPaymentStatus !== paymentStatus
  const now = new Date()
  const eventType = params.eventType ?? 'manual_sync'
  const conektaOrderId = params.conektaOrderId ?? payment.providerOrderId
  const chargeId = params.chargeId ?? null

  if (paymentStatus === PaymentStatus.PAID) {
    await tx.payment.update({
      where: { id: payment.id },
      data: {
        status: PaymentStatus.PAID,
        paidAt: now,
        ...(params.paymentMethod ? { method: params.paymentMethod } : {}),
      },
    })

    await tx.order.update({
      where: { id: payment.orderId },
      data: {
        status: OrderStatus.PAID,
        placedAt: payment.order.placedAt ?? now,
      },
    })

    if (statusChanged) {
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message:
            source === 'manual_sync'
              ? 'Pago confirmado tras verificación manual con Conekta.'
              : 'Pago confirmado vía Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId, source },
        },
      })

      await tx.auditLog.create({
        data: {
          action: AuditAction.PAYMENT_RECEIVED,
          entityType: 'order',
          entityId: payment.orderId,
          metadataJson: { eventType, conektaOrderId, chargeId, source },
        },
      })
    }
  } else if (paymentStatus === PaymentStatus.FAILED) {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.FAILED },
    })

    await tx.order.update({
      where: { id: payment.orderId },
      data: { status: OrderStatus.PAYMENT_FAILED },
    })

    if (statusChanged) {
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message: 'Pago fallido en Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId, source },
        },
      })
    }
  } else if (paymentStatus === PaymentStatus.CANCELLED) {
    await tx.payment.update({
      where: { id: payment.id },
      data: { status: PaymentStatus.CANCELLED },
    })

    if (statusChanged) {
      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message: 'Pago expirado o cancelado en Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId, source },
        },
      })
    }
  }

  const shouldCreateAttempt =
    params.forceAttempt === true || source === 'webhook' || statusChanged

  if (shouldCreateAttempt) {
    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        providerChargeId: chargeId,
        status: paymentStatus,
        amountCents: payment.amountCents,
        rawResponseJson: params.sanitizedPayload as Prisma.InputJsonValue,
      },
    })
  }

  return { updated: statusChanged, previousPaymentStatus }
}

/**
 * Sends idempotent transactional emails after a payment status transition.
 */
export async function sendConektaPaymentStatusEmails(
  payment: {
    id: string
    orderId: string
    amountCents: number
    order: {
      orderNumber: string
      customerEmail: string
      currency: string
      userId: string | null
      guestSessionId: string | null
    }
  },
  paymentStatus: PaymentStatus,
  previousPaymentStatus: PaymentStatus,
): Promise<void> {
  if (paymentStatus === previousPaymentStatus) {
    return
  }

  const { order } = payment

  let claimToken: string | null = null
  if (!order.userId) {
    try {
      const created = await createOrderClaimToken({
        orderId: payment.orderId,
        sentToEmail: order.customerEmail,
      })
      claimToken = created.token
    } catch {
      claimToken = null
    }
  }

  const trackingLinks = buildOrderEmailTrackingLinks({
    orderNumber: order.orderNumber,
    userId: order.userId,
    claimToken,
  })

  const basePayload = {
    orderNumber: order.orderNumber,
    totalCents: payment.amountCents,
    currency: order.currency,
    links: trackingLinks,
    claimUrl: trackingLinks.claimUrl,
    accountOrderUrl: trackingLinks.accountOrderUrl,
  }

  if (paymentStatus === PaymentStatus.PAID) {
    void safeSendTransactionalEmailOnce({
      to: order.customerEmail,
      templateKey: 'payment_confirmed',
      subject: '',
      orderId: payment.orderId,
      userId: order.userId,
      guestSessionId: order.guestSessionId,
      payload: {
        ...basePayload,
        paymentStatus: 'PAID',
        orderStatus: 'PAID',
      },
    })

    if (isPaymentConfirmedTransition(paymentStatus, previousPaymentStatus)) {
      await safeNotifyPaymentConfirmed(prisma, {
        paymentId: payment.id,
        order: {
          id: payment.orderId,
          orderNumber: order.orderNumber,
          userId: order.userId,
        },
      })
    }
    return
  }

  if (paymentStatus === PaymentStatus.FAILED) {
    void safeSendTransactionalEmailOnce({
      to: order.customerEmail,
      templateKey: 'payment_failed',
      subject: '',
      orderId: payment.orderId,
      userId: order.userId,
      guestSessionId: order.guestSessionId,
      payload: {
        ...basePayload,
        paymentStatus: 'FAILED',
        orderStatus: 'PAYMENT_FAILED',
      },
    })
    return
  }

  if (paymentStatus === PaymentStatus.CANCELLED) {
    void safeSendTransactionalEmailOnce({
      to: order.customerEmail,
      templateKey: 'payment_expired',
      subject: '',
      orderId: payment.orderId,
      userId: order.userId,
      guestSessionId: order.guestSessionId,
      payload: {
        ...basePayload,
        paymentStatus: 'CANCELLED',
      },
    })
  }
}
