import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { OrderStatus, ShipmentStatus } from '@prisma/client'

async function loadSkydropxModeModule() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/shipping/skydropx/skydropx.mode')
}

async function loadSkydropxProviderModules() {
  await import('./helpers/mock-server-only')
  const [provider, mockProvider, mappers] = await Promise.all([
    import('@/src/server/shipping/skydropx/skydropx.provider'),
    import('@/src/server/shipping/skydropx/skydropx.mock-provider'),
    import('@/src/server/shipping/skydropx/skydropx.mappers'),
  ])
  return { ...provider, ...mockProvider, ...mappers }
}

describe('resolveSkydropxModeFromEnvironment', () => {
  it('local resolves to mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(resolveSkydropxModeFromEnvironment({ nodeEnv: 'development' }), 'mock')
  })

  it('np resolves to mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'preview',
      }),
      'mock',
    )
  })

  it('prod resolves to live', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'production',
      }),
      'live',
    )
  })

  it('production runtime cannot use mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'production',
      }),
      'live',
    )
  })

  it('NODE_ENV=production without staging signals fails safe to live', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(resolveSkydropxModeFromEnvironment({ nodeEnv: 'production' }), 'live')
  })
})

describe('mock Skydropx shipment provider', () => {
  it('returns deterministic tracking and label data', async () => {
    const { buildMockSkydropxShipmentResponse, parseSkydropxShipmentResponse } =
      await loadSkydropxProviderModules()

    const raw = buildMockSkydropxShipmentResponse({
      orderNumber: 'CR-2026-000099',
      carrier: 'fedex',
      service: 'standard',
    })
    const parsed = parseSkydropxShipmentResponse(raw)

    assert.equal(parsed.providerShipmentId, 'mock-shipment-CR-2026-000099')
    assert.equal(parsed.providerLabelId, 'mock-label-CR-2026-000099')
    assert.equal(parsed.trackingNumber, 'CRMOCK-CR-2026-000099')
    assert.equal(parsed.labelUrl, '/mock-labels/CR-2026-000099.pdf')
    assert.equal(parsed.carrier, 'fedex')
    assert.equal(parsed.service, 'standard')
    assert.equal(
      (parsed.rawJson as { tracking_url_provider?: string }).tracking_url_provider,
      'https://tracking.example.test/CRMOCK-CR-2026-000099',
    )
  })

  it('does not require Skydropx credentials in mock mode', async () => {
    delete process.env.SKYDROPX_CLIENT_ID
    delete process.env.SKYDROPX_CLIENT_SECRET

    const { createShippingProviderForMode, parseSkydropxShipmentResponse } =
      await loadSkydropxProviderModules()
    const provider = createShippingProviderForMode('mock')
    const raw = await provider.createShipment(
      { shipment: { rate_id: 'rate-mock-1' } },
      {
        orderNumber: 'CR-2026-MOCK-001',
        carrier: 'fedex',
        service: 'standard',
      },
    )
    const parsed = parseSkydropxShipmentResponse(raw)

    assert.equal(parsed.trackingNumber, 'CRMOCK-CR-2026-MOCK-001')
    assert.equal(parsed.labelUrl, '/mock-labels/CR-2026-MOCK-001.pdf')
  })
})

describe('mock admin label persistence shape', () => {
  it('maps mock provider response to the same DB fields as live flow', async () => {
    const { buildMockSkydropxShipmentResponse, parseSkydropxShipmentResponse } =
      await loadSkydropxProviderModules()

    const orderNumber = 'CR-2026-PERSIST-001'
    const parsed = parseSkydropxShipmentResponse(buildMockSkydropxShipmentResponse({ orderNumber }))

    assert.ok(parsed.providerShipmentId)
    assert.ok(parsed.providerLabelId)
    assert.ok(parsed.trackingNumber)
    assert.ok(parsed.labelUrl)
    assert.match(parsed.trackingNumber!, /^CRMOCK-/)
    assert.match(parsed.labelUrl!, /^\/mock-labels\//)
    assert.deepEqual(Object.keys(parsed.rawJson as object).sort(), [
      'carrier',
      'carrier_name',
      'created_at',
      'id',
      'label_id',
      'label_url',
      'packages',
      'rate',
      'service',
      'status',
      'tracking_number',
      'tracking_url_provider',
    ])
  })

  it('does not infer shipped status from mock tracking number alone', async () => {
    const { buildMockSkydropxShipmentResponse, parseSkydropxShipmentResponse } =
      await loadSkydropxProviderModules()
    const { deriveAdminLabelCreationStatuses } =
      await import('@/src/server/graphql/modules/admin-shipping/admin-shipping-label-status')

    const parsed = parseSkydropxShipmentResponse(
      buildMockSkydropxShipmentResponse({ orderNumber: 'CR-2026-STATUS-001' }),
    )

    assert.ok(parsed.trackingNumber?.trim())

    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: true,
      hasTracking: true,
    })

    assert.equal(statuses.orderStatus, OrderStatus.READY_TO_SHIP)
    assert.equal(statuses.shipmentStatus, ShipmentStatus.LABEL_CREATED)
  })
})
