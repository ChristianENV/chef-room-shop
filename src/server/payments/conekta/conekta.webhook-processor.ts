import 'server-only'

import {
  mapConektaPaymentMethod,
  mapConektaStatusToPaymentStatus,
  type ConektaWebhookPayload,
} from './conekta.client'
import { sanitizeConektaPayload } from './conekta.sanitize'
import {
  applyConektaPaymentStatusUpdate,
  sendConektaPaymentStatusEmails,
} from './conekta-payment-apply'
import type { Prisma, PrismaClient } from '@prisma/client'

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

  const { previousPaymentStatus } = await prisma.$transaction(async (tx) =>
    applyConektaPaymentStatusUpdate(tx, {
      payment,
      paymentStatus,
      source: 'webhook',
      eventType,
      chargeId,
      conektaOrderId,
      paymentMethod: methodType ? mapConektaPaymentMethod(methodType) : undefined,
      sanitizedPayload,
      forceAttempt: true,
    }),
  )

  await markWebhookProcessed(prisma, eventId, {
    processed: true,
    conektaOrderId,
    eventType,
    paymentStatus,
  })

  void sendConektaPaymentStatusEmails(payment, paymentStatus, previousPaymentStatus)
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
