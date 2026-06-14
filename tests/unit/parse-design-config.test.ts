import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildDesignConfigJson } from '@/src/features/storefront/customizer/lib/build-design-config'
import { parseDesignConfigForHydration } from '@/src/features/storefront/customizer/lib/parse-design-config'
import type { CustomizerProductData } from '@/src/features/storefront/customizer/types/customizer-product.types'

const product: CustomizerProductData = {
  id: 'prod-1',
  slug: 'demo-filipina-clasica',
  name: 'Filipina clásica',
  productTypeSlug: 'filipina',
  productTypeName: 'Filipina',
  basePriceCents: 129900,
  images: [],
  colors: [
    { id: 'chef-room-blue', name: 'Azul Chef Room', hex: '#1E3A5F' },
    { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
  ],
  sizes: [
    { id: 'size-m', name: 'M' },
    { id: 'size-l', name: 'L' },
  ],
  variants: [
    {
      id: 'variant-l-blue',
      colorId: 'chef-room-blue',
      sizeId: 'size-l',
      stockQty: 10,
      isActive: true,
    },
  ],
  rules: [],
  customizationAreas: [],
  customizationAvailability: [],
  model3d: null,
}

describe('parseDesignConfigForHydration', () => {
  it('restores size, colors, text layers and view mode from configJson', () => {
    const configJson = buildDesignConfigJson({
      product,
      productVariantId: 'variant-l-blue',
      baseColor: '#1E3A5F',
      detailColor: '#C0A060',
      collarStyle: 'mao',
      sleeveStyle: '3/4',
      sleeveOption: null,
      buttonStyle: 'tradicional',
      size: 'L',
      quantity: 2,
      viewMode: '3D',
      viewAngle: 'front',
      layers: [
        {
          id: 'text-1',
          name: 'Texto',
          type: 'text',
          visible: true,
          locked: false,
          position: { x: 22, y: 28 },
          size: { width: 28, height: 8 },
          rotation: 0,
          opacity: 100,
          text: 'Chef Carlos',
          fontSize: 18,
          textColor: '#FFFFFF',
          fontFamily: 'sans-serif',
          textAlign: 'center',
          zone: 'pecho',
        },
        {
          id: 'vivos',
          name: 'Vivos',
          type: 'vivos',
          visible: true,
          locked: true,
          position: { x: 0, y: 0 },
          size: { width: 100, height: 100 },
          rotation: 0,
          opacity: 100,
        },
      ],
    })

    const parsed = parseDesignConfigForHydration(configJson, product)

    assert.equal(parsed.size, 'L')
    assert.equal(parsed.baseColor, '#1E3A5F')
    assert.equal(parsed.detailColor, '#C0A060')
    assert.equal(parsed.selectedVariantId, 'variant-l-blue')
    assert.equal(parsed.quantity, 2)
    assert.equal(parsed.viewMode, '3D')
    assert.equal(parsed.layers.some((layer) => layer.text === 'Chef Carlos'), true)
    assert.equal(parsed.selectedLayerId, 'text-1')
  })
})
