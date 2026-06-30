import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { mapAdminOrderToDetail } from '@/src/features/admin/orders/mappers/admin-orders-ui.mapper'
import type { AdminOrder, AdminOrderItem } from '@/src/features/admin/orders/types'
import { parseCommercialOptionsSnapshot } from '@/src/server/product-options'
import { normalizeAccountOrderItem } from '@/src/features/storefront/account/order-detail/order-detail.utils'

function makeCommercialOptionSnapshot() {
  return {
    groupId: 'group-dry-fit',
    groupSlug: 'dry-fit',
    groupName: 'Dry fit',
    valueId: 'value-dry-fit-yes',
    valueSlug: 'con-dry-fit',
    valueLabel: 'Con dry fit',
    priceDeltaCents: 0,
  }
}

function makeOrderItem(overrides: Partial<AdminOrderItem> = {}): AdminOrderItem {
  return {
    id: 'item-1',
    productId: 'prod-1',
    productVariantId: 'variant-1',
    designId: null,
    name: 'Pantalón ejecutivo',
    sku: 'PANT-M',
    quantity: 2,
    unitPriceCents: 100000,
    customizationPriceCents: 0,
    optionPriceCents: 8000,
    lineTotalCents: 216000,
    commercialOptionsSnapshot: [
      {
        ...makeCommercialOptionSnapshot(),
        groupSlug: 'bolsas',
        groupName: 'Bolsas',
        valueSlug: 'cargo',
        valueLabel: 'Con bolsas cargo',
        priceDeltaCents: 8000,
      },
    ],
    productSnapshotJson: {
      name: 'Pantalón ejecutivo',
      sizeName: 'M',
      sku: 'PANT-M',
    },
    designSnapshotJson: null,
    productionNotes: null,
    hasCustomDesign: false,
    ...overrides,
  }
}

function makeOrder(items: AdminOrderItem[]): AdminOrder {
  return {
    id: 'order-1',
    orderNumber: 'CR-1001',
    customer: {
      userId: 'user-1',
      name: 'Chef Test',
      email: 'chef@example.com',
      phone: null,
    },
    status: 'PAID',
    paymentStatus: 'PAID',
    fulfillmentStatus: 'UNFULFILLED',
    currency: 'MXN',
    subtotalCents: 200000,
    customizationTotalCents: 0,
    shippingCents: 0,
    discountCents: 0,
    taxCents: 0,
    totalCents: 216000,
    notes: null,
    placedAt: '2026-01-01T00:00:00.000Z',
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    shippingAddress: null,
    billingAddress: null,
    items,
    payments: [],
    shipments: [],
    events: [],
    hasCustomDesign: false,
  }
}

describe('order commercial options UI mapping', () => {
  it('maps order items without commercialOptionsSnapshot normally', () => {
    const order = makeOrder([
      makeOrderItem({
        optionPriceCents: 0,
        commercialOptionsSnapshot: [],
        lineTotalCents: 200000,
      }),
    ])

    const detail = mapAdminOrderToDetail(order)
    const item = detail.items[0]

    assert.equal(item.commercialOptionsSnapshot.length, 0)
    assert.equal(item.optionPriceCents, 0)
    assert.equal(detail.optionTotal, 0)
  })

  it('maps commercialOptionsSnapshot labels for admin order detail', () => {
    const order = makeOrder([makeOrderItem()])
    const detail = mapAdminOrderToDetail(order)
    const item = detail.items[0]

    assert.equal(item.commercialOptionsSnapshot.length, 1)
    assert.equal(item.commercialOptionsSnapshot[0]?.groupName, 'Bolsas')
    assert.equal(item.commercialOptionsSnapshot[0]?.valueLabel, 'Con bolsas cargo')
    assert.equal(item.commercialOptionsSnapshot[0]?.priceDeltaCents, 8000)
    assert.equal(detail.optionTotal, 160)
  })

  it('parses selectedOptionsJson safely into commercialOptionsSnapshot', () => {
    const parsed = parseCommercialOptionsSnapshot([
      makeCommercialOptionSnapshot(),
      { invalid: true },
      null,
    ])

    assert.equal(parsed.length, 1)
    assert.equal(parsed[0]?.groupName, 'Dry fit')
    assert.equal(parsed[0]?.valueLabel, 'Con dry fit')
  })

  it('normalizes missing commercialOptionsSnapshot on account order items', () => {
    const normalized = normalizeAccountOrderItem({
      id: 'item-1',
      name: 'Pantalón',
      sku: null,
      quantity: 1,
      unitPriceCents: 100000,
      customizationPriceCents: 0,
      optionPriceCents: undefined as unknown as number,
      totalPriceCents: 100000,
      commercialOptionsSnapshot: undefined as unknown as [],
      productSnapshotJson: null,
      designSnapshotJson: null,
    })

    assert.deepEqual(normalized.commercialOptionsSnapshot, [])
    assert.equal(normalized.optionPriceCents, 0)
  })

  it('keeps commercial options separate from customizer design snapshots', () => {
    const item = makeOrderItem({
      hasCustomDesign: true,
      designSnapshotJson: {
        selectedOptions: [{ id: 'customizer-only', label: 'Logo' }],
        elements: [],
      },
      commercialOptionsSnapshot: [makeCommercialOptionSnapshot()],
    })

    const order = makeOrder([item])
    const detail = mapAdminOrderToDetail(order)

    assert.equal(detail.items[0]?.commercialOptionsSnapshot[0]?.groupSlug, 'dry-fit')
    assert.equal(detail.items[0]?.hasCustomization, true)
    assert.ok(detail.items[0]?.customization)
  })
})
