import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  canDeselectColorInPicker,
  deriveManualSelectedColorIdsFromDraft,
  filterColorPoolBySearch,
  resolveVisibleMatrixColorIds,
} from '@/src/features/admin/products/lib/variant-matrix-colors'

describe('variant color picker helpers', () => {
  it('derives manual selected colors from draft visible ids', () => {
    const manual = deriveManualSelectedColorIdsFromDraft({
      draftVisibleIds: ['black', 'white', 'olive', 'blue-variant'],
      defaultColorIds: ['black', 'white'],
      variantColorIds: ['blue-variant'],
    })

    assert.deepEqual(manual, ['olive'])
  })

  it('blocks deselecting colors that already have variants', () => {
    assert.equal(
      canDeselectColorInPicker({
        colorId: 'olive',
        variantColorIds: new Set(['olive']),
      }),
      false,
    )
    assert.equal(
      canDeselectColorInPicker({
        colorId: 'olive',
        variantColorIds: new Set(),
      }),
      true,
    )
  })

  it('filters color pool by name, slug or hex', () => {
    const pool = [
      { value: '1', label: 'Verde olivo', slug: 'olive-green', hexCode: '#4B5A3C' },
      { value: '2', label: 'Negro', slug: 'black', hexCode: '#111111' },
    ]

    assert.equal(filterColorPoolBySearch(pool, 'olivo').length, 1)
    assert.equal(filterColorPoolBySearch(pool, 'black').length, 1)
    assert.equal(filterColorPoolBySearch(pool, '#111111').length, 1)
  })

  it('updates visible matrix rows after applying selected colors', () => {
    const colors = [
      {
        id: 'black',
        name: 'Negro',
        slug: 'black',
        hexCode: '#111111',
        isFabricColor: true,
        isProductColor: true,
        isGeneralColor: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        id: 'white',
        name: 'Blanco',
        slug: 'white',
        hexCode: '#FFFFFF',
        isFabricColor: true,
        isProductColor: true,
        isGeneralColor: false,
        isActive: true,
        sortOrder: 2,
      },
      {
        id: 'olive',
        name: 'Verde olivo',
        slug: 'olive-green',
        hexCode: '#4B5A3C',
        isFabricColor: true,
        isProductColor: false,
        isGeneralColor: false,
        isActive: true,
        sortOrder: 3,
      },
    ]

    const before = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: [],
    })

    const after = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: ['olive'],
    })

    assert.equal(before.includes('olive'), false)
    assert.equal(after.includes('olive'), true)
  })
})

describe('variant color picker UI wiring', () => {
  it('renders a visual grid picker with apply/cancel workflow', () => {
    const source = readFileSync(
      resolve('src/features/admin/products/components/product-variant-color-selector.tsx'),
      'utf8',
    )

    assert.match(source, /DialogContent/)
    assert.match(source, /admin-product-variant-color-grid/)
    assert.match(source, /grid-cols-2/)
    assert.match(source, /admin-product-variant-color-card-/)
    assert.match(source, /admin-product-variant-color-apply/)
    assert.match(source, /admin-product-variant-color-cancel/)
    assert.match(source, /admin-product-variant-color-search/)
    assert.doesNotMatch(source, /Agregar color/)
    assert.doesNotMatch(source, /PopoverContent/)
  })

  it('uses large swatch cards with color name below', () => {
    const source = readFileSync(
      resolve('src/features/admin/products/components/product-variant-color-selector.tsx'),
      'utf8',
    )

    assert.match(source, /size="lg"/)
    assert.match(source, /line-clamp-2/)
    assert.match(source, /VARIANT_MATRIX_COLOR_PICKER_SELECTED/)
  })
})
