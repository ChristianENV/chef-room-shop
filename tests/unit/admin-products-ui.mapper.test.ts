import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mapAdminProductToFormValues,
  mapAdminProductToTableRow,
  mapFormOptionsToProductTypeSlugOptions,
} from '@/src/features/admin/products/mappers/admin-products-ui.mapper'
import {
  mapFormOptionsToSelectOptions,
  resolveProductTypeLabel,
} from '@/src/features/admin/products/types/admin-products-ui.types'
import type { AdminProduct, AdminProductFormOptions } from '@/src/features/admin/products/types'

const formOptions: AdminProductFormOptions = {
  productTypes: [
    {
      id: 'type-shoes',
      slug: 'shoes',
      name: 'Zapatos',
      nameEs: 'Zapatos',
      description: null,
      sortOrder: 40,
      isActive: true,
    },
    {
      id: 'type-jacket',
      slug: 'chef-jacket',
      name: 'Filipinas',
      nameEs: 'Filipinas',
      description: null,
      sortOrder: 10,
      isActive: true,
    },
  ],
  colors: [
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
  ],
  sizes: [
    { id: 'size-30', name: '30', slug: '30', sortOrder: 300, isActive: true },
    { id: 'size-22', name: '22', slug: '22', sortOrder: 220, isActive: true },
    { id: 'size-m', name: 'M', slug: 'm', sortOrder: 50, isActive: true },
  ],
}

const shoeProduct: AdminProduct = {
  id: 'prod-shoe',
  slug: 'zapato-chef-negro',
  name: 'Zapato Chef Negro',
  shortDescription: null,
  description: null,
  basePriceCents: 129900,
  currency: 'MXN',
  customizable: false,
  status: 'DRAFT',
  seoTitle: null,
  seoDescription: null,
  seoImageId: null,
  deletedAt: null,
  createdAt: '2026-01-01T00:00:00.000Z',
  updatedAt: '2026-01-02T00:00:00.000Z',
  productType: {
    id: 'type-shoes',
    slug: 'shoes',
    name: 'Zapatos',
    nameEs: 'Zapatos',
    description: null,
    sortOrder: 40,
    isActive: true,
  },
  images: [],
  variants: [],
  model3d: null,
}

describe('admin products ui mapper', () => {
  it('uses ProductType nameEs for labels', () => {
    assert.equal(
      resolveProductTypeLabel({ nameEs: 'Zapatos', name: 'Shoes', slug: 'shoes' }),
      'Zapatos',
    )
    assert.equal(mapAdminProductToTableRow(shoeProduct).productTypeLabel, 'Zapatos')
  })

  it('includes dynamic product types in form select options', () => {
    const selectOptions = mapFormOptionsToSelectOptions(formOptions)

    assert.deepEqual(
      selectOptions.productTypes.map((option) => option.label),
      ['Filipinas', 'Zapatos'],
    )
    assert.equal(
      selectOptions.productTypes.some((option) => option.label === 'Zapatos'),
      true,
    )
    assert.equal(selectOptions.hasProductTypeSelected, false)
    assert.deepEqual(selectOptions.colors, [])
  })

  it('shows only black for shoes when product type is selected', () => {
    const selectOptions = mapFormOptionsToSelectOptions(formOptions, 'type-shoes')

    assert.equal(selectOptions.hasProductTypeSelected, true)
    assert.equal(selectOptions.colors.length, 1)
    assert.equal(selectOptions.colors[0]?.value, 'color-black')
    assert.equal(selectOptions.colors[0]?.label, 'Negro')
  })

  it('sorts sizes by sortOrder for variant selectors', () => {
    const selectOptions = mapFormOptionsToSelectOptions(formOptions)

    assert.deepEqual(
      selectOptions.sizes.map((size) => size.label),
      ['M', '22', '30'],
    )
  })

  it('preserves customizable=false when mapping product to form values', () => {
    const values = mapAdminProductToFormValues(shoeProduct, formOptions)

    assert.equal(values.customizable, false)
    assert.equal(values.productTypeId, 'type-shoes')
  })

  it('builds list filter options from dynamic product types', () => {
    const filterOptions = mapFormOptionsToProductTypeSlugOptions(formOptions)

    assert.deepEqual(
      filterOptions.map((option) => option.label),
      ['Filipinas', 'Zapatos'],
    )
    assert.equal(
      filterOptions.some((option) => option.value === 'shoes'),
      true,
    )
  })

  it('keeps inactive selected category visible when editing', () => {
    const inactiveSelected = mapFormOptionsToSelectOptions(
      {
        ...formOptions,
        productTypes: formOptions.productTypes.map((type) =>
          type.id === 'type-shoes' ? { ...type, isActive: false } : type,
        ),
      },
      'type-shoes',
    )

    assert.equal(
      inactiveSelected.productTypes.some((option) => option.value === 'type-shoes'),
      true,
    )
  })
})
