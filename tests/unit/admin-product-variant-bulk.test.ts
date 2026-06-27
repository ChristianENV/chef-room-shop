import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  applyBulkPrice,
  applyBulkStock,
  parseBulkPriceValue,
  parseBulkStockValue,
  resolveBulkTargetCells,
} from '@/src/features/admin/products/lib/variant-matrix-bulk'
import { variantMatrixKey } from '@/src/features/admin/products/lib/variant-matrix'
import type { AdminProductVariantUi } from '@/src/features/admin/products/types/admin-products-ui.types'
import type {
  VariantMatrixColorRow,
  VariantMatrixSizeColumn,
} from '@/src/features/admin/products/lib/variant-matrix'

const colors: VariantMatrixColorRow[] = [
  { value: 'color-black', label: 'Negro', hexCode: '#111111', isInvalidForProductType: false },
  { value: 'color-white', label: 'Blanco', hexCode: '#FFFFFF', isInvalidForProductType: false },
]

const sizes: VariantMatrixSizeColumn[] = [
  { value: 'size-xs', label: 'XS', slug: 'xs' },
  { value: 'size-m', label: 'M', slug: 'm' },
]

const colorMeta = {
  'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
  'color-white': { name: 'Blanco', hexCode: '#FFFFFF', slug: 'white' },
}

const sizeMeta = {
  'size-xs': { name: 'XS', slug: 'xs' },
  'size-m': { name: 'M', slug: 'm' },
}

function makeVariant(overrides: Partial<AdminProductVariantUi>): AdminProductVariantUi {
  return {
    id: overrides.id ?? 'var',
    sku: overrides.sku ?? 'CR-X',
    variantName: null,
    colorId: overrides.colorId ?? 'color-black',
    sizeId: overrides.sizeId ?? 'size-xs',
    colorName: '',
    sizeName: '',
    pricePesos: overrides.pricePesos ?? 100,
    stockQty: overrides.stockQty ?? 0,
    isActive: overrides.isActive ?? true,
    isPersisted: overrides.isPersisted ?? true,
  }
}

function bulkArgs(scope: Parameters<typeof resolveBulkTargetCells>[0]['scope'], extra = {}) {
  return resolveBulkTargetCells({ scope, colors, sizes, ...extra })
}

describe('parse bulk values', () => {
  it('accepts non-negative integers for stock', () => {
    assert.equal(parseBulkStockValue('50'), 50)
    assert.equal(parseBulkStockValue('0'), 0)
    assert.equal(parseBulkStockValue('-1'), null)
    assert.equal(parseBulkStockValue('1.5'), null)
    assert.equal(parseBulkStockValue('abc'), null)
  })

  it('accepts non-negative prices', () => {
    assert.equal(parseBulkPriceValue('199'), 199)
    assert.equal(parseBulkPriceValue('0'), 0)
    assert.equal(parseBulkPriceValue('-5'), null)
  })
})

describe('applyBulkStock scopes', () => {
  const full = [
    makeVariant({ id: 'a', colorId: 'color-black', sizeId: 'size-xs', stockQty: 1 }),
    makeVariant({ id: 'b', colorId: 'color-black', sizeId: 'size-m', stockQty: 1 }),
    makeVariant({
      id: 'c',
      colorId: 'color-white',
      sizeId: 'size-xs',
      stockQty: 1,
      isActive: false,
    }),
    makeVariant({ id: 'd', colorId: 'color-white', sizeId: 'size-m', stockQty: 1 }),
  ]

  const baseParams = {
    createMissing: false,
    colorMeta,
    sizeMeta,
    productSlug: 'filipina',
    basePricePesos: 799,
    newId: () => 'temp-new',
  }

  it('updates all visible variants', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: full,
      scope: 'all-visible',
      stockQty: 50,
      targetCells: bulkArgs('all-visible'),
    })
    assert.deepEqual(
      next.map((v) => v.stockQty),
      [50, 50, 50, 50],
    )
  })

  it('updates only active variants for active-only scope', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: full,
      scope: 'active-only',
      stockQty: 50,
      targetCells: bulkArgs('active-only'),
    })
    const inactive = next.find((v) => v.id === 'c')
    assert.equal(inactive?.stockQty, 1)
    assert.equal(next.find((v) => v.id === 'a')?.stockQty, 50)
  })

  it('updates only the selected color row', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: full,
      scope: 'color',
      stockQty: 50,
      targetCells: bulkArgs('color', { targetColorId: 'color-black' }),
    })
    assert.equal(next.find((v) => v.id === 'a')?.stockQty, 50)
    assert.equal(next.find((v) => v.id === 'b')?.stockQty, 50)
    assert.equal(next.find((v) => v.id === 'd')?.stockQty, 1)
  })

  it('updates only the selected size column', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: full,
      scope: 'size',
      stockQty: 50,
      targetCells: bulkArgs('size', { targetSizeId: 'size-m' }),
    })
    assert.equal(next.find((v) => v.id === 'b')?.stockQty, 50)
    assert.equal(next.find((v) => v.id === 'd')?.stockQty, 50)
    assert.equal(next.find((v) => v.id === 'a')?.stockQty, 1)
  })

  it('updates only the selected cells', () => {
    const selectedKeys = new Set([variantMatrixKey('color-white', 'size-m')])
    const next = applyBulkStock({
      ...baseParams,
      variants: full,
      scope: 'cells',
      stockQty: 77,
      targetCells: resolveBulkTargetCells({ scope: 'cells', colors, sizes, selectedKeys }),
    })
    assert.equal(next.find((v) => v.id === 'd')?.stockQty, 77)
    assert.equal(next.find((v) => v.id === 'a')?.stockQty, 1)
  })

  it('creates missing variants with base price, given stock, deterministic sku', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: [makeVariant({ id: 'a', colorId: 'color-black', sizeId: 'size-xs', stockQty: 5 })],
      scope: 'all-visible',
      stockQty: 30,
      createMissing: true,
      targetCells: bulkArgs('all-visible'),
    })

    assert.equal(next.length, 4)
    const created = next.find((v) => v.colorId === 'color-white' && v.sizeId === 'size-m')
    assert.ok(created)
    assert.equal(created.stockQty, 30)
    assert.equal(created.pricePesos, 799)
    assert.equal(created.isPersisted, false)
    assert.match(created.sku, /^CR-FILIPINA-WHITE-M/)
  })

  it('does not create missing variants when createMissing is false', () => {
    const next = applyBulkStock({
      ...baseParams,
      variants: [makeVariant({ id: 'a', colorId: 'color-black', sizeId: 'size-xs', stockQty: 5 })],
      scope: 'all-visible',
      stockQty: 30,
      createMissing: false,
      targetCells: bulkArgs('all-visible'),
    })
    assert.equal(next.length, 1)
  })
})

describe('applyBulkPrice', () => {
  it('updates price for targeted variants only and never touches stock', () => {
    const variants = [
      makeVariant({
        id: 'a',
        colorId: 'color-black',
        sizeId: 'size-xs',
        pricePesos: 100,
        stockQty: 9,
      }),
      makeVariant({
        id: 'b',
        colorId: 'color-white',
        sizeId: 'size-xs',
        pricePesos: 100,
        stockQty: 9,
      }),
    ]
    const next = applyBulkPrice({
      variants,
      scope: 'color',
      pricePesos: 250,
      colorMeta,
      sizeMeta,
      productSlug: 'filipina',
      basePricePesos: 799,
      newId: () => 'temp',
      targetCells: resolveBulkTargetCells({
        scope: 'color',
        colors,
        sizes,
        targetColorId: 'color-black',
      }),
    })
    assert.equal(next.find((v) => v.id === 'a')?.pricePesos, 250)
    assert.equal(next.find((v) => v.id === 'a')?.stockQty, 9)
    assert.equal(next.find((v) => v.id === 'b')?.pricePesos, 100)
  })
})

describe('resolveBulkTargetCells', () => {
  it('excludes invalid color rows from grid scopes', () => {
    const withInvalid: VariantMatrixColorRow[] = [
      ...colors,
      { value: 'color-bad', label: 'Inv', hexCode: '#000', isInvalidForProductType: true },
    ]
    const cells = resolveBulkTargetCells({ scope: 'all-visible', colors: withInvalid, sizes })
    assert.equal(
      cells.some((cell) => cell.colorId === 'color-bad'),
      false,
    )
  })
})
