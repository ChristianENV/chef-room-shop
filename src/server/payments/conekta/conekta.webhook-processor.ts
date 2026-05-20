import 'server-only'

import {
  AuditAction,
  OrderEventType,
  OrderStatus,
  PaymentStatus,
  type Prisma,
  type PrismaClient,
} from '@prisma/client'

import {
  mapConektaPaymentMethod,
  mapConektaStatusToPaymentStatus,
  type ConektaWebhookPayload,
} from './conekta.client'
import { sanitizeConektaPayload } from './conekta.sanitize'
import { buildOrderEmailLinks } from '@/src/server/email/email.links'
import { safeSendTransactionalEmailOnce } from '@/src/server/email/email.service'

function extractConektaOrderId(payload: ConektaWebhookPayload): string | null {
  const object = payload.data?.object
  if (!object) return null

  if (typeof object.order_id === 'string') return object.order_id
  if (typeof object.id === 'string' && (object.object === 'order' || payload.type?.startsWith('order.'))) {
    return object.id
  }
  return null
}

function extractChargeId(payload: ConektaWebhookPayload): string | null {
  const object = payload.data?.object
  if (!object) return null
  if (typeof object.id === 'string' && object.object === 'charge') return object.id
  if (typeof object.charge_id === 'string') return object.charge_id
  return null
}

function extractPaymentMethodType(payload: ConektaWebhookPayload): string | undefined {
  const object = payload.data?.object
  if (!object) return undefined
  const pm = object.payment_method
  if (pm && typeof pm === 'object' && !Array.isArray(pm)) {
    const type = (pm as { type?: string }).type
    if (type) return type
  }
  return undefined
}

/**
 * Processes a Conekta webhook event idempotently.
 */
export async function processConektaWebhook(
  prisma: PrismaClient,
  payload: ConektaWebhookPayload,
): Promise<void> {
  const eventId = payload.id
  const eventType = payload.type ?? 'unknown'

  if (!eventId) {
    throw new Error('Webhook sin event id')
  }

  const existing = await prisma.conektaWebhookEvent.findUnique({
    where: { eventId },
  })

  if (existing?.processedAt) {
    return
  }

  const sanitizedPayload = sanitizeConektaPayload(payload)

  if (!existing) {
    await prisma.conektaWebhookEvent.create({
      data: {
        eventId,
        eventType,
        rawPayloadJson: sanitizedPayload as Prisma.InputJsonValue,
      },
    })
  }

  const conektaOrderId = extractConektaOrderId(payload)
  if (!conektaOrderId) {
    await markWebhookProcessed(prisma, eventId, {
      skipped: true,
      reason: 'no_conekta_order_id',
    })
    return
  }

  const payment = await prisma.payment.findFirst({
    where: {
      provider: 'CONEKTA',
      providerOrderId: conektaOrderId,
    },
    include: { order: true },
  })

  if (!payment) {
    await markWebhookProcessed(prisma, eventId, {
      skipped: true,
      reason: 'payment_not_found',
      conektaOrderId,
    })
    return
  }

  const paymentStatus = mapConektaStatusToPaymentStatus(eventType)
  const chargeId = extractChargeId(payload)
  const methodType = extractPaymentMethodType(payload)

  await prisma.$transaction(async (tx) => {
    const now = new Date()

    if (paymentStatus === PaymentStatus.PAID) {
      await tx.payment.update({
        where: { id: payment.id },
        data: {
          status: PaymentStatus.PAID,
          paidAt: now,
          ...(methodType ? { method: mapConektaPaymentMethod(methodType) } : {}),
        },
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: {
          status: OrderStatus.PAID,
          placedAt: payment.order.placedAt ?? now,
        },
      })

      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message: 'Pago confirmado vía Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId },
        },
      })

      await tx.auditLog.create({
        data: {
          action: AuditAction.PAYMENT_RECEIVED,
          entityType: 'order',
          entityId: payment.orderId,
          metadataJson: { eventType, conektaOrderId, chargeId },
        },
      })
    } else if (paymentStatus === PaymentStatus.FAILED) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.FAILED },
      })

      await tx.order.update({
        where: { id: payment.orderId },
        data: { status: OrderStatus.PAYMENT_FAILED },
      })

      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message: 'Pago fallido en Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId },
        },
      })
    } else if (paymentStatus === PaymentStatus.CANCELLED) {
      await tx.payment.update({
        where: { id: payment.id },
        data: { status: PaymentStatus.CANCELLED },
      })

      await tx.orderEvent.create({
        data: {
          orderId: payment.orderId,
          type: OrderEventType.PAYMENT_UPDATED,
          message: 'Pago expirado o cancelado en Conekta.',
          metadataJson: { eventType, conektaOrderId, chargeId },
        },
      })
    }

    await tx.paymentAttempt.create({
      data: {
        paymentId: payment.id,
        providerChargeId: chargeId,
        status: paymentStatus,
        amountCents: payment.amountCents,
        rawResponseJson: sanitizedPayload as Prisma.InputJsonValue,
      },
    })
  })

  await markWebhookProcessed(prisma, eventId, {
    processed: true,
    conektaOrderId,
    eventType,
    paymentStatus,
  })

  void sendPaymentStatusEmails(prisma, payment, paymentStatus)
}

function sendPaymentStatusEmails(
  prisma: PrismaClient,
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
): void {
  const { order } = payment
  const basePayload = {
    orderNumber: order.orderNumber,
    totalCents: payment.amountCents,
    currency: order.currency,
    links: buildOrderEmailLinks(order.orderNumber),
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

async function markWebhookProcessed(
  prisma: PrismaClient,
  eventId: string,
  metadata: Record<string, unknown>,
): Promise<void> {
  const existing = await prisma.conektaWebhookEvent.findUnique({ where: { eventId } })
  const merged =
    existing?.rawPayloadJson && typeof existing.rawPayloadJson === 'object'
      ? { ...(existing.rawPayloadJson as Record<string, unknown>), _processing: metadata }
      : { _processing: metadata }

  await prisma.conektaWebhookEvent.update({
    where: { eventId },
    data: {
      processedAt: new Date(),
      rawPayloadJson: sanitizeConektaPayload(merged) as Prisma.InputJsonValue,
    },
  })
}
