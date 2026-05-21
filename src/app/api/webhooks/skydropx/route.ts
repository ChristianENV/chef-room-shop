import { NextResponse } from 'next/server'

import { prisma } from '@/src/server/db/prisma'
import { SkydropxWebhookError } from '@/src/server/shipping/skydropx/skydropx.errors'
import { processSkydropxWebhook } from '@/src/server/shipping/skydropx/skydropx.webhook-processor'
import { verifySkydropxWebhookRequest } from '@/src/server/shipping/skydropx/skydropx.webhook-verify'

export const runtime = 'nodejs'

function parseJsonBody(rawBody: string): unknown {
  if (!rawBody.trim()) {
    throw new SkydropxWebhookError('Webhook sin cuerpo.', 'SKYDROPX_WEBHOOK_INVALID')
  }

  try {
    return JSON.parse(rawBody) as unknown
  } catch {
    throw new SkydropxWebhookError('JSON inválido.', 'SKYDROPX_WEBHOOK_INVALID')
  }
}

/**
 * Skydropx PRO webhook receiver (idempotent by eventId).
 */
export async function POST(request: Request) {
  const rawBody = await request.text()

  try {
    verifySkydropxWebhookRequest({
      rawBody,
      headers: request.headers,
      requestUrl: request.url,
    })

    const payload = parseJsonBody(rawBody)
    const result = await processSkydropxWebhook(prisma, payload)

    return NextResponse.json({
      received: true,
      eventId: result.eventId,
      duplicate: result.duplicate,
      skipped: result.skipped,
      reason: result.reason ?? null,
    })
  } catch (error) {
    if (error instanceof SkydropxWebhookError) {
      if (
        error.code === 'SKYDROPX_WEBHOOK_UNAUTHORIZED' ||
        error.code === 'SKYDROPX_WEBHOOK_UNCONFIGURED'
      ) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }

      return NextResponse.json({ error: 'Invalid webhook' }, { status: 400 })
    }

    console.error('[skydropx-webhook]', error instanceof Error ? error.message : error)

    return NextResponse.json({ error: 'Webhook processing failed' }, { status: 500 })
  }
}
