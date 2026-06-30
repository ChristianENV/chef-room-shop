import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildSelectedCommercialOptionsPayload,
  calculateCommercialOptionsPriceDeltaCents,
  calculateEstimatedUnitPriceCents,
  getInitialCommercialOptionSelections,
  validateCommercialOptionSelections,
  type ProductOptionGroup,
} from '@/src/features/storefront/products/lib/product-commercial-options'
import { mapProductDetailToUi } from '@/src/features/storefront/products/mappers/product-ui.mapper'
import type { ProductDetail } from '@/src/features/storefront/products/types'

function makeGroup(
  overrides: Partial<ProductOptionGroup> & Pick<ProductOptionGroup, 'id' | 'slug' | 'name'>,
): ProductOptionGroup {
  return {
    description: null,
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    sortOrder: 0,
    values: [],
    ...overrides,
  }
}

const baseProductDetail = {
  id: 'prod-1',
  slug: 'pants',
  name: 'Pantalón',
  shortDescription: 'Pantalón ejecutivo',
  description: 'Descripción',
  basePriceCents: 120000,
  currency: 'MXN',
  isCustomizable: false,
  status: 'ACTIVE',
  productType: {
    id: 'type-pants',
    slug: 'pants',
    name: 'Pantalón',
    nameEs: 'Pantalón',
  },
  images: [],
  variants: [
    {
      id: 'variant-1',
      sku: 'PANTS-M-BLK',
      priceCents: 120000,
      stockQty: 5,
      isActive: true,
      color: { id: 'c1', name: 'Negro', slug: 'black', hexCode: '#000000' },
      size: { id: 's1', name: 'M', slug: 'm' },
    },
  ],
  customizationRules: [],
  optionGroups: [],
} as ProductDetail

describe('storefront product commercial options', () => {
  it('maps product detail with empty optionGroups for products without options', () => {
    const ui = mapProductDetailToUi(baseProductDetail)
    assert.deepEqual(ui.optionGroups, [])
    assert.equal(ui.basePriceCents, 120000)
  })

  it('selects default commercial option automatically', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      values: [
        {
          id: 'val-default',
          slug: 'sin-bolsas-cargo',
          label: 'Sin bolsas cargo',
          priceDeltaCents: 0,
          isDefault: true,
          sortOrder: 0,
        },
        {
          id: 'val-cargo',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
          priceDeltaCents: 0,
          isDefault: false,
          sortOrder: 1,
        },
      ],
    })

    const selections = getInitialCommercialOptionSelections([group])
    assert.equal(selections['group-pockets'], 'val-default')
  })

  it('blocks add-to-cart payload when required group has no selection', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      isRequired: true,
      values: [
        {
          id: 'val-cargo',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
          priceDeltaCents: 0,
          isDefault: false,
          sortOrder: 0,
        },
      ],
    })

    const validation = validateCommercialOptionSelections([group], {})
    assert.equal(validation.ok, false)
    if (validation.ok) return
    assert.match(validation.message, /Bolsas/)
  })

  it('builds selectedCommercialOptions with ids only', () => {
    const group = makeGroup({
      id: 'group-length',
      slug: 'apron-length',
      name: 'Largo del mandil',
      values: [
        {
          id: 'val-plus',
          slug: 'mas-10cm',
          label: '+10 cm',
          priceDeltaCents: 15000,
          isDefault: false,
          sortOrder: 0,
        },
      ],
    })

    const payload = buildSelectedCommercialOptionsPayload([group], {
      'group-length': 'val-plus',
    })

    assert.deepEqual(payload, [{ groupId: 'group-length', valueId: 'val-plus' }])
    assert.equal('priceDeltaCents' in (payload[0] ?? {}), false)
    assert.equal('valueLabel' in (payload[0] ?? {}), false)
  })

  it('updates estimated display price when option delta changes', () => {
    const group = makeGroup({
      id: 'group-length',
      slug: 'apron-length',
      name: 'Largo del mandil',
      values: [
        {
          id: 'val-plus',
          slug: 'mas-10cm',
          label: '+10 cm',
          priceDeltaCents: 15000,
          isDefault: false,
          sortOrder: 0,
        },
      ],
    })

    const withoutOptions = calculateEstimatedUnitPriceCents({
      basePriceCents: 100000,
      optionGroups: [group],
      selections: {},
    })
    const withOptions = calculateEstimatedUnitPriceCents({
      basePriceCents: 100000,
      optionGroups: [group],
      selections: { 'group-length': 'val-plus' },
    })

    assert.equal(withoutOptions, 100000)
    assert.equal(withOptions, 115000)
    assert.equal(
      calculateCommercialOptionsPriceDeltaCents([group], { 'group-length': 'val-plus' }),
      15000,
    )
  })

  it('does not reference customizer selectedOptions in commercial option helpers', () => {
    const customizerSelectedOptions = { embroideryText: 'Chef Carlos' }
    const group = makeGroup({
      id: 'group-dry-fit',
      slug: 'dry-fit-back',
      name: 'Dry fit',
      values: [
        {
          id: 'val-dry',
          slug: 'con-dry-fit',
          label: 'Con dry fit',
          priceDeltaCents: 0,
          isDefault: true,
          sortOrder: 0,
        },
      ],
    })

    const payload = buildSelectedCommercialOptionsPayload([group], {
      'group-dry-fit': 'val-dry',
    })

    assert.notDeepEqual(payload, customizerSelectedOptions)
    assert.equal('selectedOptions' in { selectedOptions: customizerSelectedOptions }, true)
    assert.equal('selectedCommercialOptions' in { selectedCommercialOptions: payload }, true)
  })
})
