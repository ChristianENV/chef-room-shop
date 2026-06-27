import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildVariantColorSelectOptions,
  validateFormVariantColors,
  VARIANT_COLOR_SELECT_HELP,
} from '@/src/features/admin/products/lib/variant-color-options'
import { mapFormOptionsToSelectOptions } from '@/src/features/admin/products/types/admin-products-ui.types'
import type { ProductFormValues } from '@/src/features/admin/products/types/admin-products-ui.types'
import type { AdminProductFormOptions } from '@/src/features/admin/products/types'

const catalogColors = [
  {
    id: 'color-black',
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
    id: 'color-white',
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
    id: 'color-chef-blue',
    name: 'Azul Chef Room',
    slug: 'chef-blue',
    hexCode: '#2B3280',
    isFabricColor: true,
    isProductColor: true,
    isGeneralColor: false,
    isActive: true,
    sortOrder: 3,
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
    sortOrder: 4,
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
] as const

const formOptions: AdminProductFormOptions = {
  productTypes: [
    {
      id: 'type-apron',
      slug: 'apron',
      name: 'Aprons',
      nameEs: 'Mandiles',
      description: null,
      sortOrder: 20,
      isActive: true,
    },
    {
      id: 'type-jacket',
      slug: 'chef-jacket',
      name: 'Chef Jackets',
      nameEs: 'Filipinas',
      description: null,
      sortOrder: 10,
      isActive: true,
    },
    {
      id: 'type-shoes',
      slug: 'shoes',
      name: 'Shoes',
      nameEs: 'Zapatos',
      description: null,
      sortOrder: 40,
      isActive: true,
    },
  ],
  colors: [...catalogColors],
  sizes: [{ id: 'size-m', name: 'M', slug: 'm', sortOrder: 50, isActive: true }],
}

describe('admin product variant color options', () => {
  it('returns no colors when product type is not selected', () => {
    const selectOptions = mapFormOptionsToSelectOptions(formOptions)

    assert.equal(selectOptions.hasProductTypeSelected, false)
    assert.deepEqual(selectOptions.colors, [])
  })

  it('filters colors by selected product type', () => {
    const apronOptions = mapFormOptionsToSelectOptions(formOptions, {
      selectedProductTypeId: 'type-apron',
    })
    assert.deepEqual(apronOptions.colors.map((color) => color.value).sort(), [
      'color-black',
      'color-white',
    ])

    const shoeOptions = mapFormOptionsToSelectOptions(formOptions, {
      selectedProductTypeId: 'type-shoes',
    })
    assert.deepEqual(
      shoeOptions.colors.map((color) => color.value),
      ['color-black'],
    )

    const jacketOptions = mapFormOptionsToSelectOptions(formOptions, {
      selectedProductTypeId: 'type-jacket',
    })
    assert.equal(jacketOptions.colors.length, 4)
    assert.equal(
      jacketOptions.colors.some((color) => color.value === 'color-olive'),
      false,
    )
  })

  it('keeps invalid legacy colors visible with invalid label when editing', () => {
    const options = buildVariantColorSelectOptions({
      colors: formOptions.colors,
      productTypeSlug: 'apron',
      existingVariantColorIds: ['color-chef-blue'],
    })

    assert.equal(options.length, 3)
    const legacy = options.find((row) => row.value === 'color-chef-blue')
    assert.ok(legacy)
    assert.equal(legacy.isInvalidForProductType, true)
    assert.match(legacy.label, /Color no permitido para esta categoría/)
  })

  it('validates form variants against selected product type', () => {
    const conflict = validateFormVariantColors(
      {
        productTypeId: 'type-apron',
        variants: [{ colorId: 'color-chef-blue' }] as ProductFormValues['variants'],
      },
      formOptions,
    )
    assert.ok(conflict)

    const ok = validateFormVariantColors(
      {
        productTypeId: 'type-apron',
        variants: [{ colorId: 'color-white' }] as ProductFormValues['variants'],
      },
      formOptions,
    )
    assert.equal(ok, null)
  })

  it('exposes helper copy for missing product type', () => {
    assert.match(VARIANT_COLOR_SELECT_HELP, /Selecciona primero una categoría/)
  })
})
