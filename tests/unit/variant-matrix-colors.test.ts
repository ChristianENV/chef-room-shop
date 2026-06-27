import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildVariantColorPoolOptions,
  buildVisibleMatrixColorRows,
  canRemoveColorFromMatrix,
  partitionMatrixColorSelection,
  resolveDefaultMatrixColorIds,
  resolveVisibleMatrixColorIds,
} from '@/src/features/admin/products/lib/variant-matrix-colors'
import { generateMissingVariants } from '@/src/features/admin/products/lib/variant-matrix'
import type { AdminColor } from '@/src/features/admin/products/types'

const colors: AdminColor[] = [
  {
    id: 'color-black',
    name: 'Negro',
    slug: 'black',
    hexCode: '#111111',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: true,
    isActive: true,
    sortOrder: 10,
  },
  {
    id: 'color-white',
    name: 'Blanco',
    slug: 'white',
    hexCode: '#FFFFFF',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 20,
  },
  {
    id: 'color-chef-blue',
    name: 'Azul Chef Room',
    slug: 'chef-blue',
    hexCode: '#2B3280',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 30,
  },
  {
    id: 'color-warm-gray',
    name: 'Gris cálido',
    slug: 'warm-gray',
    hexCode: '#E2E0DB',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 40,
  },
  {
    id: 'color-olive',
    name: 'Verde olivo',
    slug: 'olive-green',
    hexCode: '#4B5A3C',
    isFabricColor: true,
    isProductColor: false,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 100,
  },
  {
    id: 'color-inactive-olive',
    name: 'Oliva apagado',
    slug: 'olive-muted',
    hexCode: '#556644',
    isFabricColor: true,
    isProductColor: false,
    isGeneralColor: false,
    isActive: false,
    sortOrder: 110,
  },
]

describe('variant matrix color pool', () => {
  it('chef-jacket color pool includes active fabric colors', () => {
    const pool = buildVariantColorPoolOptions({ colors, productTypeSlug: 'chef-jacket' })
    assert.equal(
      pool.some((color) => color.value === 'color-olive'),
      true,
    )
    assert.equal(
      pool.some((color) => color.value === 'color-inactive-olive'),
      false,
    )
  })

  it('apron color pool excludes fabric-only colors', () => {
    const pool = buildVariantColorPoolOptions({ colors, productTypeSlug: 'apron' })
    assert.deepEqual(pool.map((color) => color.value).sort(), ['color-black', 'color-white'])
  })

  it('pants color pool excludes fabric-only colors', () => {
    const pool = buildVariantColorPoolOptions({ colors, productTypeSlug: 'pants' })
    assert.deepEqual(
      pool.map((color) => color.value),
      ['color-black'],
    )
  })

  it('shoes color pool excludes fabric-only colors', () => {
    const pool = buildVariantColorPoolOptions({ colors, productTypeSlug: 'shoes' })
    assert.deepEqual(
      pool.map((color) => color.value),
      ['color-black'],
    )
  })
})

describe('visible matrix color rows', () => {
  it('includes canonical defaults without selecting every fabric color', () => {
    const visibleIds = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: [],
    })

    assert.deepEqual(visibleIds, [
      'color-black',
      'color-white',
      'color-chef-blue',
      'color-warm-gray',
    ])
    assert.equal(visibleIds.includes('color-olive'), false)
  })

  it('adds manually selected fabric color rows for Filipinas', () => {
    const visibleIds = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: ['color-olive'],
    })

    assert.equal(visibleIds.includes('color-olive'), true)
    const rows = buildVisibleMatrixColorRows({
      visibleColorIds: visibleIds,
      colors,
      productTypeSlug: 'chef-jacket',
    })
    assert.equal(
      rows.some((row) => row.value === 'color-olive'),
      true,
    )
  })

  it('keeps existing variant colors visible even if not selected', () => {
    const visibleIds = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [{ colorId: 'color-olive' }],
      selectedColorIds: [],
    })

    assert.equal(visibleIds.includes('color-olive'), true)
  })

  it('partitions selected and available colors for the selector', () => {
    const visibleIds = resolveDefaultMatrixColorIds('chef-jacket', colors)
    const pool = buildVariantColorPoolOptions({ colors, productTypeSlug: 'chef-jacket' })
    const { selected, available } = partitionMatrixColorSelection({
      visibleColorIds: visibleIds,
      pool,
    })

    assert.equal(selected.length, 4)
    assert.equal(
      available.some((color) => color.value === 'color-olive'),
      true,
    )
  })
})

describe('generate missing variants for visible rows only', () => {
  it('does not generate every fabric color by default', () => {
    const visibleIds = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: [],
    })

    const matrixColors = buildVisibleMatrixColorRows({
      visibleColorIds: visibleIds,
      colors,
      productTypeSlug: 'chef-jacket',
    })

    const generated = generateMissingVariants({
      variants: [],
      colors: matrixColors,
      sizes: [{ value: 'size-m', label: 'M', slug: 'm' }],
      colorMeta: Object.fromEntries(
        colors.map((color) => [
          color.id,
          { name: color.name, hexCode: color.hexCode, slug: color.slug },
        ]),
      ),
      sizeMeta: { 'size-m': { name: 'M', slug: 'm' } },
      productSlug: 'filipina-ejecutiva',
      basePricePesos: 799,
      newId: () => 'temp-new',
    })

    assert.equal(generated.length, 4)
    assert.equal(
      generated.some((variant) => variant.colorId === 'color-olive'),
      false,
    )
  })

  it('generates missing variants only for selected visible rows', () => {
    const visibleIds = resolveVisibleMatrixColorIds({
      productTypeSlug: 'chef-jacket',
      colors,
      variants: [],
      selectedColorIds: ['color-olive'],
    })

    const matrixColors = buildVisibleMatrixColorRows({
      visibleColorIds: visibleIds,
      colors,
      productTypeSlug: 'chef-jacket',
    })

    const generated = generateMissingVariants({
      variants: [],
      colors: matrixColors,
      sizes: [{ value: 'size-m', label: 'M', slug: 'm' }],
      colorMeta: Object.fromEntries(
        colors.map((color) => [
          color.id,
          { name: color.name, hexCode: color.hexCode, slug: color.slug },
        ]),
      ),
      sizeMeta: { 'size-m': { name: 'M', slug: 'm' } },
      productSlug: 'filipina-ejecutiva',
      basePricePesos: 799,
      newId: () => 'temp-new',
    })

    assert.equal(
      generated.some((variant) => variant.colorId === 'color-olive'),
      true,
    )
    assert.equal(generated.length, 5)
  })
})

describe('matrix color removal guard', () => {
  it('blocks removing colors that still have variants', () => {
    assert.equal(
      canRemoveColorFromMatrix({
        colorId: 'color-olive',
        variants: [{ colorId: 'color-olive' }],
      }),
      false,
    )
    assert.equal(
      canRemoveColorFromMatrix({
        colorId: 'color-olive',
        variants: [],
      }),
      true,
    )
  })
})
