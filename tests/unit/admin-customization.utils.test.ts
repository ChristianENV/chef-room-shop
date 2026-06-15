import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildAdminCustomizationFromItem } from '@/src/features/admin/orders/lib/admin-customization.utils'
import type { AdminOrderItem } from '@/src/features/admin/orders/types'

const baseItem: AdminOrderItem = {
  id: 'item-1',
  productId: 'prod-1',
  productVariantId: 'variant-1',
  designId: 'design-1',
  name: 'Filipina clásica',
  sku: 'FIL-L-BLUE',
  quantity: 1,
  unitPriceCents: 129900,
  customizationPriceCents: 25000,
  lineTotalCents: 154900,
  productSnapshotJson: {
    name: 'Filipina clásica',
    sizeName: 'L',
    colorName: 'Azul Chef Room',
    colorHex: '#1E3A5F',
    fabricColorName: 'Azul Chef Room',
    detailColorName: 'Dorado',
  },
  designSnapshotJson: {
    designId: 'design-1',
    previewUrl: 'https://example.com/front.webp',
    previewBackUrl: 'https://example.com/back.webp',
    selectedSize: { name: 'L', label: 'L' },
    fabricColor: { name: 'Azul Chef Room', hex: '#1E3A5F' },
    detailColor: { name: 'Dorado', hex: '#C0A060' },
    elements: [
      {
        id: 'text-1',
        type: 'text',
        name: 'Texto',
        text: 'Chef Carlos',
        zone: 'pecho',
      },
    ],
    summary: ['Chef Carlos'],
  },
  productionNotes: null,
  hasCustomDesign: true,
}

describe('buildAdminCustomizationFromItem', () => {
  it('maps previews, colors, elements and customization price', () => {
    const result = buildAdminCustomizationFromItem(baseItem)
    assert.ok(result)
    assert.equal(result.previewUrl, 'https://example.com/front.webp')
    assert.equal(result.previewBackUrl, 'https://example.com/back.webp')
    assert.equal(result.size, 'L')
    assert.match(result.fabricColor, /Azul Chef Room/)
    assert.match(result.detailColor, /Dorado/)
    assert.equal(result.customizationPrice, 250)
    assert.equal(result.elements.length, 1)
    assert.equal(result.elements[0]?.text, 'Chef Carlos')
  })
})
