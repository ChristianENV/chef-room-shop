import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { FulfillmentStatus, OrderStatus, ShipmentStatus } from '@prisma/client'

import { deriveAdminLabelCreationStatuses } from '@/src/server/graphql/modules/admin-shipping/admin-shipping-label-status'

describe('deriveAdminLabelCreationStatuses', () => {
  it('keeps mock labels at READY_TO_SHIP even when tracking exists', () => {
    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: true,
      hasTracking: true,
    })

    assert.equal(statuses.shipmentStatus, ShipmentStatus.LABEL_CREATED)
    assert.equal(statuses.orderStatus, OrderStatus.READY_TO_SHIP)
    assert.equal(statuses.fulfillmentStatus, FulfillmentStatus.PROCESSING)
    assert.equal(statuses.setShippedAt, false)
  })

  it('marks live labels with tracking as SHIPPED / IN_TRANSIT', () => {
    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: false,
      hasTracking: true,
    })

    assert.equal(statuses.shipmentStatus, ShipmentStatus.IN_TRANSIT)
    assert.equal(statuses.orderStatus, OrderStatus.SHIPPED)
    assert.equal(statuses.fulfillmentStatus, FulfillmentStatus.SHIPPED)
    assert.equal(statuses.setShippedAt, true)
  })

  it('marks live labels without tracking as READY_TO_SHIP / LABEL_CREATED', () => {
    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: false,
      hasTracking: false,
    })

    assert.equal(statuses.shipmentStatus, ShipmentStatus.LABEL_CREATED)
    assert.equal(statuses.orderStatus, OrderStatus.READY_TO_SHIP)
    assert.equal(statuses.fulfillmentStatus, FulfillmentStatus.PROCESSING)
    assert.equal(statuses.setShippedAt, false)
  })
})

describe('mock label provider data with admin status derivation', () => {
  it('returns tracking and label URL while staying non-shipped in mock mode', async () => {
    await import('./helpers/mock-server-only')
    const { buildMockSkydropxShipmentResponse } =
      await import('@/src/server/shipping/skydropx/skydropx.mock-provider')
    const { parseSkydropxShipmentResponse } =
      await import('@/src/server/shipping/skydropx/skydropx.mappers')

    const orderNumber = 'CR-2026-STATUS-001'
    const parsed = parseSkydropxShipmentResponse(buildMockSkydropxShipmentResponse({ orderNumber }))
    const statuses = deriveAdminLabelCreationStatuses({
      isMockMode: true,
      hasTracking: Boolean(parsed.trackingNumber?.trim()),
    })

    assert.ok(parsed.trackingNumber?.trim())
    assert.ok(parsed.labelUrl?.trim())
    assert.ok(parsed.providerShipmentId?.trim())
    assert.ok(parsed.providerLabelId?.trim())
    assert.equal(statuses.shipmentStatus, ShipmentStatus.LABEL_CREATED)
    assert.equal(statuses.orderStatus, OrderStatus.READY_TO_SHIP)
    assert.notEqual(statuses.shipmentStatus, ShipmentStatus.IN_TRANSIT)
    assert.notEqual(statuses.orderStatus, OrderStatus.SHIPPED)
  })
})
