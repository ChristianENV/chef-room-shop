import { randomUUID } from 'node:crypto'

/**
 * Sends a fake Skydropx package webhook to the local BFF.
 *
 * Usage:
 *   npx tsx scripts/skydropx-webhook-smoke.ts in_transit
 *   npx tsx scripts/skydropx-webhook-smoke.ts delivered <providerShipmentId> <trackingNumber>
 *
 * Env:
 *   SKYDROPX_WEBHOOK_SECRET — optional; appended as ?secret= for dev
 *   WEBHOOK_BASE_URL — default http://localhost:3000
 */

const baseUrl = process.env.WEBHOOK_BASE_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'
const secret = process.env.SKYDROPX_WEBHOOK_SECRET?.trim() ?? ''

const status = (process.argv[2] ?? 'in_transit').toLowerCase()
const providerShipmentId = process.argv[3] ?? '00000000-0000-4000-8000-000000000001'
const trackingNumber = process.argv[4] ?? '794874381730'
const eventId = process.argv[5] ?? randomUUID()

const payload = {
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
        data: {
          id: providerShipmentId,
          type: 'shipments',
        },
      },
    },
  },
}

async function main(): Promise<void> {
  const url = new URL(`${baseUrl}/api/webhooks/skydropx`)
  if (secret) {
    url.searchParams.set('secret', secret)
  }

  const body = JSON.stringify(payload)
  const response = await fetch(url.toString(), {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body,
  })

  const text = await response.text()
  console.log(`Status: ${response.status}`)
  console.log(text)

  if (!response.ok) {
    process.exitCode = 1
  }
}

void main()
