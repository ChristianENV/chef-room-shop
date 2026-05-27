/**
 * Dry-run or live Skydropx quotation smoke test.
 *
 * Usage:
 *   pnpm tsx scripts/skydropx-create-quote-smoke.ts 72830
 *   pnpm tsx scripts/skydropx-create-quote-smoke.ts 72830 --send
 *   pnpm tsx scripts/skydropx-create-quote-smoke.ts 72830 --city "San Andrés Cholula" --state Puebla --quantity 2
 *
 * Requires SKYDROPX_* and SHIPPING_ORIGIN_* in .env.local. Does not print secrets.
 */

import { config } from 'dotenv'

config({ path: '.env.local' })

function readArg(flag: string): string | undefined {
  const idx = process.argv.indexOf(flag)
  if (idx === -1) return undefined
  return process.argv[idx + 1]?.trim()
}

const postalCode = process.argv[2]?.trim()
const shouldSend = process.argv.includes('--send')
const city = readArg('--city') ?? 'Ciudad'
const state = readArg('--state') ?? 'México'
const quantityRaw = readArg('--quantity')
const quantity = quantityRaw ? Number.parseInt(quantityRaw, 10) : 1

async function main(): Promise<void> {
  if (!postalCode) {
    console.error(
      'Usage: pnpm tsx scripts/skydropx-create-quote-smoke.ts <postalCode> [--send] [--city] [--state] [--quantity]',
    )
    process.exit(1)
  }

  const {
    validateQuotationDestination,
    validateQuotationParcel,
    validateShippingOriginForQuotation,
    SkydropxValidationError,
  } = await import('../src/server/shipping/skydropx/skydropx.validation')
  const { mapShippingQuoteToSkydropxQuotationPayload } =
    await import('../src/server/shipping/skydropx/skydropx-quotation-payload')
  const { summarizeLabelAddressForDebug } =
    await import('../src/server/shipping/skydropx/skydropx-address')
  const { sanitizeSkydropxDebugPayload } =
    await import('../src/server/shipping/skydropx/skydropx.sanitize')
  const { getPackageForCartItems } =
    await import('../src/server/shipping/shipping-package.shared')

  console.log('--- Destination input ---')
  console.log(JSON.stringify({ postalCode, city, state, country: 'MX' }, null, 2))

  console.log('\n--- Origin validation ---')
  let originLabel
  try {
    originLabel = validateShippingOriginForQuotation()
    console.log('OK')
    console.log(JSON.stringify(summarizeLabelAddressForDebug(originLabel, 'shipper'), null, 2))
  } catch (error) {
    console.error('FAILED:', error instanceof SkydropxValidationError ? error.message : error)
    process.exit(1)
  }

  console.log('\n--- Destination validation ---')
  let destination
  try {
    destination = validateQuotationDestination({
      postalCode,
      city,
      state,
      neighborhood: city,
      country: 'MX',
    })
    console.log('OK')
    console.log(JSON.stringify(destination, null, 2))
  } catch (error) {
    console.error('FAILED:', error instanceof SkydropxValidationError ? error.message : error)
    process.exit(1)
  }

  const cartItems = Array.from({ length: Math.max(1, quantity) }, () => ({ quantity: 1 }))
  const pkg = getPackageForCartItems(cartItems)

  console.log('\n--- Package validation ---')
  try {
    validateQuotationParcel(pkg)
    console.log('OK', JSON.stringify(pkg, null, 2))
  } catch (error) {
    console.error('FAILED:', error instanceof SkydropxValidationError ? error.message : error)
    process.exit(1)
  }

  const payload = mapShippingQuoteToSkydropxQuotationPayload({
    destination: {
      postalCode: destination.postalCode,
      city: destination.city,
      state: destination.state,
      neighborhood: destination.neighborhood,
      country: destination.country,
    },
    cartItems,
  })

  console.log('\n--- Quotation payload (sanitized) ---')
  console.log(JSON.stringify(sanitizeSkydropxDebugPayload(payload), null, 2))
  console.log('\nEndpoint: POST {SKYDROPX_API_BASE_URL}/api/v1/quotations')

  if (!shouldSend) {
    console.log('\nDry-run only. Pass --send to call Skydropx.')
    return
  }

  const clientId = process.env.SKYDROPX_CLIENT_ID?.trim()
  const clientSecret = process.env.SKYDROPX_CLIENT_SECRET?.trim()
  const apiBase =
    process.env.SKYDROPX_API_BASE_URL?.trim() || 'https://api-pro.skydropx.com'

  if (!clientId || !clientSecret) {
    console.error('Skydropx credentials not configured.')
    process.exit(1)
  }

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
    process.exit(1)
  }

  const quoteRes = await fetch(`${apiBase.replace(/\/$/, '')}/api/v1/quotations`, {
    method: 'POST',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: `Bearer ${tokenJson.access_token}`,
    },
    body: JSON.stringify(payload),
  })

  const text = await quoteRes.text()
  let json: unknown = null
  try {
    json = JSON.parse(text) as unknown
  } catch {
    json = { raw: text.slice(0, 500) }
  }

  console.log(`\nHTTP ${quoteRes.status}`)
  console.log(JSON.stringify(sanitizeSkydropxDebugPayload(json), null, 2))
  if (!quoteRes.ok) process.exit(1)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
