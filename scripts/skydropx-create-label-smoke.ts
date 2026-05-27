/**
 * Dry-run or live Skydropx label payload for an order (admin flow).
 *
 * Usage:
 *   pnpm tsx scripts/skydropx-create-label-smoke.ts CR-2026-000027
 *   pnpm tsx scripts/skydropx-create-label-smoke.ts CR-2026-000027 --send
 *
 * Requires DATABASE_URL. Does not print secrets or Bearer tokens.
 */

import { config } from 'dotenv'
import { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

const orderNumber = process.argv[2]?.trim()
const shouldSend = process.argv.includes('--send')

async function main(): Promise<void> {
  if (!orderNumber) {
    console.error('Usage: pnpm tsx scripts/skydropx-create-label-smoke.ts <orderNumber> [--send]')
    process.exit(1)
  }

  const { summarizeLabelAddressForDebug } =
    await import('../src/server/shipping/skydropx/skydropx-address')
  const {
    validateOrderShippingAddressForSkydropx,
    validateShippingOriginForLabel,
    validateShippingQuoteForLabel,
    SkydropxValidationError,
  } = await import('../src/server/shipping/skydropx/skydropx.validation')
  const { mapLabelFormatToSkydropx, mapOrderToSkydropxShipmentPayload } =
    await import('../src/server/shipping/skydropx/skydropx-shipment-payload')
  const { sanitizeSkydropxDebugPayload } =
    await import('../src/server/shipping/skydropx/skydropx.sanitize')

  const prisma = new PrismaClient()

  try {
    const order = await prisma.order.findFirst({
      where: { orderNumber, deletedAt: null },
      include: {
        shippingAddress: true,
        payments: { orderBy: { createdAt: 'desc' }, take: 1 },
      },
    })

    if (!order) {
      console.error(`Order not found: ${orderNumber}`)
      process.exit(1)
    }

    const quote = await prisma.shippingQuote.findFirst({
      where: { orderId: order.id },
      include: { rates: true },
      orderBy: { createdAt: 'desc' },
    })

    if (!quote) {
      console.error('No ShippingQuote linked to order.')
      process.exit(1)
    }

    const rate = quote.rates.find((r) => r.selectedAt !== null) ?? quote.rates[0]
    if (!rate) {
      console.error('No ShippingRate on quote.')
      process.exit(1)
    }

    if (!order.shippingAddress) {
      console.error('Order has no shipping address.')
      process.exit(1)
    }

    console.log('--- Order ---')
    console.log(
      JSON.stringify(
        {
          orderNumber: order.orderNumber,
          status: order.status,
          paymentStatus: order.payments[0]?.status,
        },
        null,
        2,
      ),
    )

    console.log('\n--- Quote / rate ---')
    console.log(
      JSON.stringify(
        {
          quoteId: quote.id,
          providerQuoteId: quote.providerQuoteId,
          rateId: rate.id,
          providerRateId: rate.providerRateId,
          carrier: rate.carrier,
          service: rate.service,
          expiresAt: rate.expiresAt?.toISOString(),
          selectedAt: rate.selectedAt?.toISOString(),
        },
        null,
        2,
      ),
    )

    let originAddress
    let recipientAddress

    console.log('\n--- Origin validation ---')
    try {
      originAddress = validateShippingOriginForLabel()
      console.log('OK')
      console.log(JSON.stringify(summarizeLabelAddressForDebug(originAddress, 'shipper'), null, 2))
    } catch (error) {
      console.error('FAILED:', error instanceof SkydropxValidationError ? error.message : error)
      process.exit(1)
    }

    console.log('\n--- Recipient validation ---')
    try {
      validateShippingQuoteForLabel(quote, rate)
      recipientAddress = validateOrderShippingAddressForSkydropx(
        order.shippingAddress,
        order.customerEmail,
      )
      console.log('OK')
      console.log(
        JSON.stringify(summarizeLabelAddressForDebug(recipientAddress, 'recipient'), null, 2),
      )
    } catch (error) {
      console.error('FAILED:', error instanceof SkydropxValidationError ? error.message : error)
      process.exit(1)
    }

    const payload = mapOrderToSkydropxShipmentPayload({
      providerRateId: rate.providerRateId,
      printingFormat: mapLabelFormatToSkydropx('PDF'),
      origin: originAddress,
      recipient: recipientAddress,
    })

    console.log('\n--- Skydropx v1 payload (sanitized) ---')
    console.log(JSON.stringify(sanitizeSkydropxDebugPayload(payload), null, 2))
    console.log('\nEndpoint: POST {SKYDROPX_API_BASE_URL}/api/v1/shipments/')
    console.log('Canonical: address→street1, internal_number→street1 suffix, sector→area_level3')

    if (!shouldSend) {
      console.log('\nDry-run only. Pass --send to call Skydropx.')
      return
    }

    const clientId = process.env.SKYDROPX_CLIENT_ID?.trim()
    const clientSecret = process.env.SKYDROPX_CLIENT_SECRET?.trim()
    const apiBase =
      process.env.SKYDROPX_API_BASE_URL?.trim() || 'https://api-pro.skydropx.com'

    if (!clientId || !clientSecret) {
      console.error('Skydropx credentials not configured (SKYDROPX_CLIENT_ID/SECRET).')
      process.exit(1)
    }

    console.log('\n--- Calling Skydropx ---')
    const tokenRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/v1/oauth/token`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'client_credentials',
        client_id: clientId,
        client_secret: clientSecret,
      }),
    })
    const tokenJson = (await tokenRes.json()) as { access_token?: string }
    if (!tokenRes.ok || !tokenJson.access_token) {
      console.error(`OAuth failed: HTTP ${tokenRes.status}`)
      console.error(JSON.stringify(sanitizeSkydropxDebugPayload(tokenJson), null, 2))
      process.exit(1)
    }

    const shipRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/v1/shipments/`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        Authorization: `Bearer ${tokenJson.access_token}`,
      },
      body: JSON.stringify(payload),
    })
    const shipText = await shipRes.text()
    let shipJson: unknown = null
    try {
      shipJson = JSON.parse(shipText) as unknown
    } catch {
      shipJson = { raw: shipText.slice(0, 500) }
    }

    console.log(`HTTP ${shipRes.status}`)
    console.log('Response (sanitized):')
    console.log(JSON.stringify(sanitizeSkydropxDebugPayload(shipJson), null, 2))
    if (!shipRes.ok) process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
