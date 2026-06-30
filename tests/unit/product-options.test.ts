import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildProductOptionSnapshots,
  calculateProductOptionsPriceCents,
  resolveApplicableProductOptionGroups,
  validateSelectedProductOptions,
  type ProductOptionGroupWithValues,
} from '@/src/server/product-options'

const PRODUCT_ID = 'product-1'
const PRODUCT_TYPE_ID = 'type-pants'

function makeGroup(
  overrides: Partial<ProductOptionGroupWithValues> &
    Pick<ProductOptionGroupWithValues, 'id' | 'slug' | 'name'>,
): ProductOptionGroupWithValues {
  return {
    productId: null,
    productTypeId: PRODUCT_TYPE_ID,
    description: null,
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 0,
    configJson: null,
    values: [],
    ...overrides,
  }
}

function makeValue(
  groupId: string,
  overrides: {
    id: string
    slug: string
    label: string
    priceDeltaCents?: number
    isDefault?: boolean
    isActive?: boolean
    sortOrder?: number
  },
) {
  return {
    optionGroupId: groupId,
    description: null,
    priceDeltaCents: 0,
    isDefault: false,
    isActive: true,
    sortOrder: 0,
    configJson: null,
    ...overrides,
  }
}

describe('commercial product options helpers', () => {
  it('returns empty snapshots and price 0 when product has no option groups', () => {
    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [],
      selectedCommercialOptions: [],
    })

    assert.equal(result.ok, true)
    if (!result.ok) return

    assert.deepEqual(result.commercialOptionsSnapshots, [])
    assert.equal(calculateProductOptionsPriceCents(result.commercialOptionsSnapshots), 0)
  })

  it('applies default for required group when no explicit selection is provided', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      isRequired: true,
      values: [
        makeValue('group-pockets', {
          id: 'val-no-cargo',
          slug: 'sin-bolsas-cargo',
          label: 'Sin bolsas cargo',
          isDefault: true,
        }),
        makeValue('group-pockets', {
          id: 'val-cargo',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
        }),
      ],
    })

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [],
    })

    assert.equal(result.ok, true)
    if (!result.ok) return

    assert.equal(result.validatedSelections.length, 1)
    assert.equal(result.validatedSelections[0]?.fromDefault, true)
    assert.equal(result.validatedSelections[0]?.value.slug, 'sin-bolsas-cargo')
  })

  it('fails when required group has no default and no selection', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      isRequired: true,
      values: [
        makeValue('group-pockets', {
          id: 'val-cargo',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
        }),
      ],
    })

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [],
    })

    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'REQUIRED_GROUP_MISSING')
  })

  it('rejects invalid value for group', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      values: [
        makeValue('group-pockets', {
          id: 'val-cargo',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
        }),
      ],
    })

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupSlug: 'pockets', valueSlug: 'does-not-exist' }],
    })

    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'UNKNOWN_VALUE')
  })

  it('rejects inactive group and inactive value selections', () => {
    const inactiveGroup = makeGroup({
      id: 'group-old',
      slug: 'legacy',
      name: 'Legacy',
      isActive: false,
      values: [],
    })

    const activeGroup = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      values: [
        makeValue('group-pockets', {
          id: 'val-inactive',
          slug: 'retired',
          label: 'Retired',
          isActive: false,
        }),
      ],
    })

    const inactiveGroupResult = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [inactiveGroup],
      selectedCommercialOptions: [{ groupSlug: 'legacy', valueSlug: 'any' }],
    })
    assert.equal(inactiveGroupResult.ok, false)
    if (!inactiveGroupResult.ok) {
      assert.equal(inactiveGroupResult.code, 'INACTIVE_GROUP')
    }

    const inactiveValueResult = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [activeGroup],
      selectedCommercialOptions: [{ groupSlug: 'pockets', valueSlug: 'retired' }],
    })
    assert.equal(inactiveValueResult.ok, false)
    if (!inactiveValueResult.ok) {
      assert.equal(inactiveValueResult.code, 'INACTIVE_VALUE')
    }
  })

  it('calculates price from server option values, not client input', () => {
    const group = makeGroup({
      id: 'group-length',
      slug: 'apron-length',
      name: 'Largo del mandil',
      values: [
        makeValue('group-length', {
          id: 'val-plus',
          slug: 'mas-10cm',
          label: '+10 cm',
          priceDeltaCents: 15000,
        }),
      ],
    })

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupSlug: 'apron-length', valueSlug: 'mas-10cm' }],
    })

    assert.equal(result.ok, true)
    if (!result.ok) return

    const total = calculateProductOptionsPriceCents(result.commercialOptionsSnapshots)
    assert.equal(total, 15000)
    assert.equal(result.commercialOptionsSnapshots[0]?.priceDeltaCents, 15000)
  })

  it('uses selectedCommercialOptions naming distinct from customizer selectedOptions', () => {
    const group = makeGroup({
      id: 'group-dry-fit',
      slug: 'dry-fit-back',
      name: 'Dry fit en espalda',
      values: [
        makeValue('group-dry-fit', {
          id: 'val-dry',
          slug: 'con-dry-fit',
          label: 'Con dry fit en espalda',
        }),
      ],
    })

    const customizerSelectedOptions = [{ areaId: 'chest', optionId: 'logo' }]
    const commercialInput = [{ groupSlug: 'dry-fit-back', valueSlug: 'con-dry-fit' }]

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: commercialInput,
    })

    assert.equal(result.ok, true)
    if (!result.ok) return

    const snapshots = buildProductOptionSnapshots(result.validatedSelections)
    assert.equal(snapshots.length, 1)
    assert.equal(snapshots[0]?.groupSlug, 'dry-fit-back')

    assert.notDeepEqual(snapshots, customizerSelectedOptions)
    assert.equal(
      'selectedCommercialOptions' in { selectedCommercialOptions: commercialInput },
      true,
    )
    assert.equal('selectedOptions' in { selectedOptions: customizerSelectedOptions }, true)
  })

  it('merges product-level groups over product-type groups by slug', () => {
    const typeGroup = makeGroup({
      id: 'type-group',
      slug: 'pockets',
      name: 'Bolsas (tipo)',
      productTypeId: PRODUCT_TYPE_ID,
      values: [
        makeValue('type-group', {
          id: 'type-val',
          slug: 'tipo-default',
          label: 'Tipo default',
        }),
      ],
    })

    const productGroup = makeGroup({
      id: 'product-group',
      slug: 'pockets',
      name: 'Bolsas (producto)',
      productId: PRODUCT_ID,
      productTypeId: null,
      values: [
        makeValue('product-group', {
          id: 'product-val',
          slug: 'product-override',
          label: 'Producto override',
          isDefault: true,
        }),
      ],
    })

    const applicable = resolveApplicableProductOptionGroups({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [typeGroup, productGroup],
    })

    assert.equal(applicable.length, 1)
    assert.equal(applicable[0]?.id, 'product-group')
  })

  it('rejects selections for groups that do not apply to the product', () => {
    const otherTypeGroup = makeGroup({
      id: 'group-apron',
      slug: 'embroidery',
      name: 'Bordado',
      productTypeId: 'type-apron',
      values: [
        makeValue('group-apron', {
          id: 'val-emb',
          slug: 'con-bordado',
          label: 'Con bordado',
        }),
      ],
    })

    const result = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [otherTypeGroup],
      selectedCommercialOptions: [{ groupSlug: 'embroidery', valueSlug: 'con-bordado' }],
    })

    assert.equal(result.ok, false)
    if (result.ok) return
    assert.equal(result.code, 'GROUP_NOT_APPLICABLE')
  })
})
