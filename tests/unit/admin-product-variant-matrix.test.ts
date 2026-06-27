import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  applyBasePriceToEmptyVariants,
  applyInitialStockToNewVariants,
  buildDeterministicVariantSku,
  buildVariantMatrixColorRows,
  ensureUniqueSkusInForm,
  filterVariantSizesForProductType,
  generateMissingVariants,
  isShoeProductType,
  resolveVariantCellState,
  sortVariantsForDisplay,
} from '@/src/features/admin/products/lib/variant-matrix'
import { buildVariantColorSelectOptions } from '@/src/features/admin/products/lib/variant-color-options'
import { mapFormOptionsToSelectOptions } from '@/src/features/admin/products/types/admin-products-ui.types'
import type { AdminProductFormOptions } from '@/src/features/admin/products/types'
import type { AdminProductVariantUi } from '@/src/features/admin/products/types/admin-products-ui.types'

const sizes = [
  { id: 'size-xs', name: 'XS', slug: 'xs', sortOrder: 1, isActive: true },
  { id: 'size-m', name: 'M', slug: 'm', sortOrder: 3, isActive: true },
  { id: 'size-22', name: '22', slug: '22', sortOrder: 220, isActive: true },
  { id: 'size-30', name: '30', slug: '30', sortOrder: 300, isActive: true },
]

const colors = [
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
    id: 'color-inactive',
    name: 'Gris',
    slug: 'warm-gray',
    hexCode: '#E2E0DB',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: false,
    sortOrder: 40,
  },
]

const formOptions: AdminProductFormOptions = {
  productTypes: [
    {
      id: 'type-jacket',
      slug: 'chef-jacket',
      name: 'Filipinas',
      nameEs: 'Filipinas',
      description: null,
      sortOrder: 10,
      isActive: true,
    },
    {
      id: 'type-shoes',
      slug: 'shoes',
      name: 'Zapatos',
      nameEs: 'Zapatos',
      description: null,
      sortOrder: 40,
      isActive: true,
    },
  ],
  colors,
  sizes,
}

describe('variant matrix size filtering', () => {
  it('uses shoe sizes 22–30 for shoes product type', () => {
    const shoeSizes = filterVariantSizesForProductType(sizes, 'shoes')
    assert.deepEqual(
      shoeSizes.map((size) => size.slug),
      ['22', '30'],
    )
    assert.equal(isShoeProductType('shoes'), true)
  })

  it('uses apparel sizes for non-shoe product types', () => {
    const apparelSizes = filterVariantSizesForProductType(sizes, 'chef-jacket')
    assert.deepEqual(
      apparelSizes.map((size) => size.slug),
      ['xs', 'm'],
    )
  })

  it('sorts sizes by sortOrder in form select options', () => {
    const jacketOptions = mapFormOptionsToSelectOptions(formOptions, 'type-jacket')
    assert.deepEqual(
      jacketOptions.sizes.map((size) => size.label),
      ['XS', 'M'],
    )

    const shoeOptions = mapFormOptionsToSelectOptions(formOptions, 'type-shoes')
    assert.deepEqual(
      shoeOptions.sizes.map((size) => size.label),
      ['22', '30'],
    )
  })
})

describe('variant matrix color rows', () => {
  it('builds rows from allowed ProductType colors', () => {
    const selectColors = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'chef-jacket',
    })

    const rows = buildVariantMatrixColorRows({
      colors: selectColors,
      colorMeta: {
        'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
        'color-white': { name: 'Blanco', hexCode: '#FFFFFF', slug: 'white' },
      },
      variants: [],
    })

    assert.equal(rows.length, 2)
    assert.equal(
      rows.every((row) => row.hexCode.startsWith('#')),
      true,
    )
  })

  it('excludes fabric-only and inactive colors for new variants', () => {
    const selectColors = buildVariantColorSelectOptions({
      colors,
      productTypeSlug: 'chef-jacket',
    })

    assert.equal(
      selectColors.some((color) => color.value === 'color-olive'),
      false,
    )
    assert.equal(
      selectColors.some((color) => color.value === 'color-inactive'),
      false,
    )
  })
})

describe('variant matrix generation', () => {
  const matrixColors = buildVariantMatrixColorRows({
    colors: buildVariantColorSelectOptions({ colors, productTypeSlug: 'apron' }),
    colorMeta: {
      'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
      'color-white': { name: 'Blanco', hexCode: '#FFFFFF', slug: 'white' },
    },
    variants: [],
  }).filter((row) => !row.isInvalidForProductType)

  const matrixSizes = filterVariantSizesForProductType(sizes, 'apron').map((size) => ({
    value: size.id,
    label: size.name,
    slug: size.slug,
  }))

  const existingVariant: AdminProductVariantUi = {
    id: 'var-1',
    sku: 'CR-MANDIL-BLACK-XS',
    variantName: null,
    colorId: 'color-black',
    sizeId: 'size-xs',
    colorName: 'Negro',
    sizeName: 'XS',
    pricePesos: 899,
    stockQty: 5,
    isActive: true,
    isPersisted: true,
  }

  it('generates missing variants with base price and stock 0', () => {
    const generated = generateMissingVariants({
      variants: [existingVariant],
      colors: matrixColors,
      sizes: matrixSizes,
      colorMeta: {
        'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
        'color-white': { name: 'Blanco', hexCode: '#FFFFFF', slug: 'white' },
      },
      sizeMeta: {
        'size-xs': { name: 'XS', slug: 'xs' },
        'size-m': { name: 'M', slug: 'm' },
      },
      productSlug: 'mandil-ejecutivo',
      basePricePesos: 799,
      newId: () => `temp-${Math.random()}`,
    })

    assert.equal(generated.length, 4)
    const preserved = generated.find(
      (variant) => variant.colorId === 'color-black' && variant.sizeId === 'size-xs',
    )
    assert.equal(preserved?.pricePesos, 899)
    assert.equal(preserved?.stockQty, 5)

    const created = generated.find(
      (variant) => variant.colorId === 'color-white' && variant.sizeId === 'size-m',
    )
    assert.ok(created)
    assert.equal(created.pricePesos, 799)
    assert.equal(created.stockQty, 0)
    assert.equal(created.isPersisted, false)
  })

  it('does not overwrite existing variant fields when generating', () => {
    const generated = generateMissingVariants({
      variants: [existingVariant],
      colors: matrixColors,
      sizes: matrixSizes,
      colorMeta: {
        'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
        'color-white': { name: 'Blanco', hexCode: '#FFFFFF', slug: 'white' },
      },
      sizeMeta: {
        'size-xs': { name: 'XS', slug: 'xs' },
        'size-m': { name: 'M', slug: 'm' },
      },
      productSlug: 'mandil-ejecutivo',
      basePricePesos: 799,
      newId: () => 'temp-new',
    })

    const preserved = generated.find((variant) => variant.id === 'var-1')
    assert.equal(preserved?.sku, 'CR-MANDIL-BLACK-XS')
    assert.equal(preserved?.pricePesos, 899)
  })

  it('creates deterministic unique SKUs', () => {
    const sku = buildDeterministicVariantSku('filipina-ejecutiva', 'chef-blue', 'm')
    assert.equal(sku, 'CR-FILIPINAEJECUTIVA-CHEFBLUE-M')

    const deduped = ensureUniqueSkusInForm([
      { ...existingVariant, sku: 'CR-TEST' },
      { ...existingVariant, id: 'var-2', sku: 'CR-TEST' },
    ])
    assert.notEqual(deduped[0]?.sku, deduped[1]?.sku)
  })

  it('applies base price only to empty-price variants', () => {
    const updated = applyBasePriceToEmptyVariants(
      [existingVariant, { ...existingVariant, id: 'var-2', pricePesos: 0, sizeId: 'size-m' }],
      799,
    )
    assert.equal(updated[0]?.pricePesos, 899)
    assert.equal(updated[1]?.pricePesos, 799)
  })

  it('applies initial stock only to non-persisted variants', () => {
    const updated = applyInitialStockToNewVariants(
      [existingVariant, { ...existingVariant, id: 'temp-1', isPersisted: false, stockQty: 99 }],
      0,
    )
    assert.equal(updated[0]?.stockQty, 5)
    assert.equal(updated[1]?.stockQty, 0)
  })
})

describe('variant matrix cell states', () => {
  it('resolves missing, active, inactive and invalid states', () => {
    assert.equal(resolveVariantCellState(undefined, false), 'missing')
    assert.equal(
      resolveVariantCellState(
        {
          id: '1',
          sku: '',
          variantName: null,
          colorId: 'c',
          sizeId: 's',
          colorName: '',
          sizeName: '',
          pricePesos: 0,
          stockQty: 0,
          isActive: true,
          isPersisted: false,
        },
        false,
      ),
      'active',
    )
    assert.equal(
      resolveVariantCellState(
        {
          id: '1',
          sku: '',
          variantName: null,
          colorId: 'c',
          sizeId: 's',
          colorName: '',
          sizeName: '',
          pricePesos: 0,
          stockQty: 0,
          isActive: false,
          isPersisted: true,
        },
        false,
      ),
      'inactive',
    )
    assert.equal(
      resolveVariantCellState(
        {
          id: '1',
          sku: '',
          variantName: null,
          colorId: 'c',
          sizeId: 's',
          colorName: '',
          sizeName: '',
          pricePesos: 0,
          stockQty: 0,
          isActive: true,
          isPersisted: true,
        },
        true,
      ),
      'invalid',
    )
  })
})

describe('variant editor UI wiring', () => {
  it('uses matrix on desktop and list on mobile', () => {
    const matrixSource = readFileSync(
      resolve('src/features/admin/products/components/product-variant-matrix.tsx'),
      'utf8',
    )
    const listSource = readFileSync(
      resolve('src/features/admin/products/components/product-variant-list.tsx'),
      'utf8',
    )

    assert.match(matrixSource, /hidden lg:block/)
    assert.match(listSource, /lg:hidden/)
  })

  it('product form still uses pending save guard', () => {
    const dialogSource = readFileSync(
      resolve('src/features/admin/products/product-form-dialog.tsx'),
      'utf8',
    )

    assert.match(dialogSource, /ProductVariantEditor/)
    assert.match(dialogSource, /isFormPending/)
    assert.match(dialogSource, /PRODUCT_FORM_SAVE_STATUS_MESSAGE/)
    assert.match(dialogSource, /showCloseButton=\{!formPending\}/)
  })
})

describe('variant display ordering', () => {
  it('sorts variants by color and size order', () => {
    const ordered = sortVariantsForDisplay(
      [
        {
          id: 'b',
          sku: '',
          variantName: null,
          colorId: 'color-white',
          sizeId: 'size-m',
          colorName: '',
          sizeName: '',
          pricePesos: 0,
          stockQty: 0,
          isActive: true,
          isPersisted: false,
        },
        {
          id: 'a',
          sku: '',
          variantName: null,
          colorId: 'color-black',
          sizeId: 'size-xs',
          colorName: '',
          sizeName: '',
          pricePesos: 0,
          stockQty: 0,
          isActive: true,
          isPersisted: false,
        },
      ],
      ['color-black', 'color-white'],
      ['size-xs', 'size-m'],
    )

    assert.equal(ordered[0]?.id, 'a')
    assert.equal(ordered[1]?.id, 'b')
  })
})
