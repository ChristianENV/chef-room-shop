import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it } from 'node:test'

import {
  buildSelectedCommercialOptionsPayload,
  calculateCommercialOptionsPriceDeltaCents,
  calculateEstimatedUnitPriceCents,
  getInitialCommercialOptionSelections,
  validateCommercialOptionSelections,
  type ProductOptionGroup,
} from '@/src/features/storefront/products/lib/product-commercial-options'
import {
  EMBROIDERY_ENABLED_VALUE_SLUG,
  isCommercialOptionGroupEnabled,
  isEmbroideryCommercialOptionEnabled,
} from '@/src/features/storefront/products/lib/product-commercial-option-dependencies'
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

function makeApronEmbroideryOptionGroups(): ProductOptionGroup[] {
  return [
    makeGroup({
      id: 'group-embroidery',
      slug: 'embroidery',
      name: 'Bordado',
      isRequired: true,
      sortOrder: 0,
      values: [
        {
          id: 'val-sin-bordado',
          slug: 'sin-bordado',
          label: 'Sin bordado',
          priceDeltaCents: 0,
          isDefault: true,
          sortOrder: 0,
        },
        {
          id: 'val-con-bordado',
          slug: EMBROIDERY_ENABLED_VALUE_SLUG,
          label: 'Con bordado',
          priceDeltaCents: 5000,
          isDefault: false,
          sortOrder: 1,
        },
      ],
    }),
    makeGroup({
      id: 'group-embroidery-position',
      slug: 'embroidery-position',
      name: 'Posición del bordado',
      isRequired: true,
      sortOrder: 1,
      values: [
        {
          id: 'val-position-pecho',
          slug: 'pecho-derecho',
          label: 'Pecho derecho',
          priceDeltaCents: 0,
          isDefault: true,
          sortOrder: 0,
        },
      ],
    }),
    makeGroup({
      id: 'group-embroidery-size',
      slug: 'embroidery-size',
      name: 'Tamaño del bordado',
      isRequired: true,
      sortOrder: 2,
      values: [
        {
          id: 'val-size-mediano',
          slug: 'mediano',
          label: 'Mediano',
          priceDeltaCents: 2000,
          isDefault: true,
          sortOrder: 0,
        },
      ],
    }),
  ]
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

describe('storefront embroidery commercial option dependencies', () => {
  const apronGroups = makeApronEmbroideryOptionGroups()
  const embroideryGroup = apronGroups[0]!
  const positionGroup = apronGroups[1]!
  const sizeGroup = apronGroups[2]!

  const sinBordadoSelections = {
    'group-embroidery': 'val-sin-bordado',
    'group-embroidery-position': 'val-position-pecho',
    'group-embroidery-size': 'val-size-mediano',
  }

  const conBordadoSelections = {
    'group-embroidery': 'val-con-bordado',
    'group-embroidery-position': 'val-position-pecho',
    'group-embroidery-size': 'val-size-mediano',
  }

  it('disables embroidery-position and embroidery-size when embroidery is sin-bordado', () => {
    assert.equal(isEmbroideryCommercialOptionEnabled(apronGroups, sinBordadoSelections), false)
    assert.equal(
      isCommercialOptionGroupEnabled(positionGroup, apronGroups, sinBordadoSelections),
      false,
    )
    assert.equal(
      isCommercialOptionGroupEnabled(sizeGroup, apronGroups, sinBordadoSelections),
      false,
    )
    assert.equal(
      isCommercialOptionGroupEnabled(embroideryGroup, apronGroups, sinBordadoSelections),
      true,
    )
  })

  it('omits dependent selections from payload when embroidery is sin-bordado', () => {
    const payload = buildSelectedCommercialOptionsPayload(apronGroups, sinBordadoSelections)

    assert.deepEqual(payload, [{ groupId: 'group-embroidery', valueId: 'val-sin-bordado' }])
  })

  it('ignores dependent price deltas when embroidery is sin-bordado', () => {
    assert.equal(calculateCommercialOptionsPriceDeltaCents(apronGroups, sinBordadoSelections), 0)
    assert.equal(
      calculateEstimatedUnitPriceCents({
        basePriceCents: 100000,
        optionGroups: apronGroups,
        selections: sinBordadoSelections,
      }),
      100000,
    )
  })

  it('does not block validation for required dependents when embroidery is sin-bordado', () => {
    const validation = validateCommercialOptionSelections(apronGroups, {
      'group-embroidery': 'val-sin-bordado',
    })

    assert.equal(validation.ok, true)
  })

  it('enables dependent groups and applies defaults when embroidery is con-bordado', () => {
    assert.equal(isEmbroideryCommercialOptionEnabled(apronGroups, conBordadoSelections), true)
    assert.equal(
      isCommercialOptionGroupEnabled(positionGroup, apronGroups, conBordadoSelections),
      true,
    )

    const initialSelections = getInitialCommercialOptionSelections(apronGroups)
    assert.equal(initialSelections['group-embroidery'], 'val-sin-bordado')
    assert.equal(initialSelections['group-embroidery-position'], undefined)
    assert.equal(initialSelections['group-embroidery-size'], undefined)

    const enabledInitial = getInitialCommercialOptionSelections(apronGroups)
    const withEmbroideryEnabled = {
      ...enabledInitial,
      'group-embroidery': 'val-con-bordado',
      'group-embroidery-position': 'val-position-pecho',
      'group-embroidery-size': 'val-size-mediano',
    }

    const payload = buildSelectedCommercialOptionsPayload(apronGroups, withEmbroideryEnabled)
    assert.equal(payload.length, 3)
    assert.equal(
      calculateCommercialOptionsPriceDeltaCents(apronGroups, withEmbroideryEnabled),
      7000,
    )
  })

  it('requires dependent groups normally when embroidery is con-bordado', () => {
    const validation = validateCommercialOptionSelections(apronGroups, {
      'group-embroidery': 'val-con-bordado',
    })

    assert.equal(validation.ok, false)
    if (validation.ok) return
    assert.match(validation.message, /Posición del bordado/)
  })

  it('keeps products without embroidery groups unchanged', () => {
    const pocketsGroup = makeGroup({
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

    const validation = validateCommercialOptionSelections([pocketsGroup], {})
    assert.equal(validation.ok, false)
    assert.equal(isCommercialOptionGroupEnabled(pocketsGroup, [pocketsGroup], {}), true)
  })
})

describe('storefront embroidery dependency UI wiring', () => {
  it('selector shows helper text and disables dependent groups in markup', () => {
    const selectorSource = readFileSync(
      resolve('src/features/storefront/products/components/product-option-selectors.tsx'),
      'utf8',
    )

    assert.match(selectorSource, /isCommercialOptionGroupEnabled/)
    assert.match(selectorSource, /Selecciona bordado para habilitar esta opción/)
    assert.match(selectorSource, /disabled=\{!groupEnabled\}/)
    assert.match(selectorSource, /data-group-enabled/)
  })

  it('product info clears disabled dependent selections on change', () => {
    const productInfoSource = readFileSync(
      resolve('src/features/storefront/products/product-info.tsx'),
      'utf8',
    )

    assert.match(productInfoSource, /clearDisabledCommercialOptionSelections/)
  })
})
