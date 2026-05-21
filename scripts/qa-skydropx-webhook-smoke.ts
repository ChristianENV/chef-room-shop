/**
 * QA smoke for Skydropx webhooks (HTTP + optional DB checks).
 *
 * Usage:
 *   npx tsx scripts/qa-skydropx-webhook-smoke.ts <providerShipmentId> <trackingNumber> [eventId]
 *
 * Env: WEBHOOK_BASE_URL, SKYDROPX_WEBHOOK_SECRET, DATABASE_URL (optional for DB asserts)
 */
import { config } from 'dotenv'
import { randomUUID } from 'node:crypto'

import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })
config({ path: '.env' })

const baseUrl = process.env.WEBHOOK_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
const secret = process.env.SKYDROPX_WEBHOOK_SECRET?.trim() ?? ''

const providerShipmentId = process.argv[2]
const trackingNumber = process.argv[3]
const fixedEventId = process.argv[4]

if (!providerShipmentId || !trackingNumber) {
  console.error(
    'Usage: npx tsx scripts/qa-skydropx-webhook-smoke.ts <providerShipmentId> <trackingNumber> [eventId]',
  )
  process.exit(1)
}

function buildPayload(status: string, eventId: string) {
  return {
    data: {
      id: eventId,
      type: 'packages',
      attributes: {
        status,
        tracking_number: trackingNumber,
        tracking_url_provider: `https://example.com/track/${trackingNumber}`,
        label_url: 'https://example.com/label.pdf',
      },
      relationships: {
        shipment: {
          data: { id: providerShipmentId, type: 'shipments' },
        },
      },
    },
  }
}

async function postWebhook(status: string, eventId: string): Promise<Response> {
  const url = new URL(`${baseUrl}/api/webhooks/skydropx`)
  if (secret) {
    url.searchParams.set('secret', secret)
  }

  return fetch(url.toString(), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(buildPayload(status, eventId)),
  })
}

async function main(): Promise<void> {
  const inTransitId = fixedEventId ?? randomUUID()

  console.log('1) in_transit…')
  const r1 = await postWebhook('in_transit', inTransitId)
  console.log('   status', r1.status, await r1.text())

  console.log('2) duplicate same eventId…')
  const r2 = await postWebhook('in_transit', inTransitId)
  const body2 = await r2.json()
  console.log('   status', r2.status, body2)
  if (!body2.duplicate) {
    console.warn('   expected duplicate:true on second call')
  }

  console.log('3) delivered…')
  const deliveredId = randomUUID()
  const r3 = await postWebhook('delivered', deliveredId)
  console.log('   status', r3.status, await r3.text())

  if (process.env.DATABASE_URL) {
    const prisma = new PrismaClient()
    try {
      const shipment = await prisma.shipment.findFirst({
        where: { providerShipmentId },
        include: { events: { orderBy: { createdAt: 'desc' }, take: 3 } },
      })
      const webhook = await prisma.shippingWebhookEvent.findUnique({
        where: { eventId: inTransitId },
      })
      const emails = shipment
        ? await prisma.emailMessage.findMany({
            where: { orderId: shipment.orderId, status: 'SENT' },
            orderBy: { createdAt: 'desc' },
            take: 5,
          })
        : []

      console.log('\nDB snapshot:')
      console.log('  shipment status:', shipment?.status)
      console.log('  shipment events:', shipment?.events.length)
      console.log('  webhook processedAt:', webhook?.processedAt)
      console.log(
        '  emails:',
        emails.map((e) => `${e.templateKey} (${e.status})`),
      )
    } finally {
      await prisma.$disconnect()
    }
  }
}

void main().catch((error) => {
  console.error(error)
  process.exit(1)
})
