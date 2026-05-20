import { NextResponse } from 'next/server'

import { prisma } from '@/src/server/db/prisma'
import {
  parseConektaWebhookEvent,
  verifyConektaWebhookRequest,
} from '@/src/server/payments/conekta/conekta.client'
import { ConektaApiError } from '@/src/server/payments/conekta/conekta.errors'
import { processConektaWebhook } from '@/src/server/payments/conekta/conekta.webhook-processor'

export const runtime = 'nodejs'

/**
 * Conekta webhook receiver (idempotent by eventId).
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  try {
    await verifyConektaWebhookRequest({
      rawBody,
      headers: request.headers,
    })

    const payload = parseConektaWebhookEvent(rawBody)
    await processConektaWebhook(prisma, payload)

    return NextResponse.json({ received: true })
  } catch (error) {
    if (error instanceof ConektaApiError && error.status === 401) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    console.error('[conekta-webhook]', error instanceof Error ? error.message : error)

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
