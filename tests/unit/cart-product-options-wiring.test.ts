import './helpers/mock-server-only'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  computeCartTotals,
  computeCheckoutTotalsFromCartItems,
  mapCartItemToGql,
} from '@/src/server/graphql/modules/cart/cart.mappers'
import type { CartItemWithRelations } from '@/src/server/graphql/modules/cart/cart.types'
import { addCartItemInputSchema } from '@/src/server/graphql/modules/cart/cart.validation'
import {
  buildCommercialOptionsLineKey,
  parseCommercialOptionsSnapshot,
  validateSelectedProductOptions,
  type ProductOptionGroupWithValues,
} from '@/src/server/product-options'

const PRODUCT_ID = 'product-1'
const PRODUCT_TYPE_ID = 'type-pants'

function makeGroup(
  overrides: Partial<ProductOptionGroupWithValues> & Pick<ProductOptionGroupWithValues, 'id' | 'slug' | 'name'>,
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

function makeCartItem(overrides: Partial<CartItemWithRelations>): CartItemWithRelations {
  return {
    id: 'item-1',
    cartId: 'cart-1',
    productId: PRODUCT_ID,
    productVariantId: 'variant-1',
    designId: null,
    quantity: 1,
    unitPriceCents: 100000,
    customizationPriceCents: 0,
    optionPriceCents: 0,
    configSnapshotJson: null,
    selectedOptionsJson: null,
    createdAt: new Date('2026-01-01T00:00:00.000Z'),
    updatedAt: new Date('2026-01-01T00:00:00.000Z'),
    product: {
      id: PRODUCT_ID,
      slug: 'pants',
      name: 'Pantalón',
      basePriceCents: 100000,
      status: 'ACTIVE',
      customizable: false,
      productTypeId: PRODUCT_TYPE_ID,
      productType: {
        id: PRODUCT_TYPE_ID,
        slug: 'pants',
        nameEs: 'Pantalón',
        optionGroups: [],
      },
      images: [],
      variants: [],
      customizationRules: [],
      optionGroups: [],
    } as unknown as CartItemWithRelations['product'],
    productVariant: null,
    design: null,
    ...overrides,
  } as CartItemWithRelations
}

describe('cart product options wiring', () => {
  it('accepts add-to-cart without selectedCommercialOptions', () => {
    const parsed = addCartItemInputSchema.parse({
      productId: PRODUCT_ID,
      quantity: 1,
    })
    assert.equal(parsed.selectedCommercialOptions, undefined)
  })

  it('validates selectedCommercialOptions shape without price fields', () => {
    assert.throws(() =>
      addCartItemInputSchema.parse({
        productId: PRODUCT_ID,
        quantity: 1,
        selectedCommercialOptions: [{ groupSlug: 'pockets' }],
      }),
    )
  })

  it('applies required group default for cart persistence payload', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      isRequired: true,
      values: [
        makeValue('group-pockets', {
          id: 'val-default',
          slug: 'sin-bolsas-cargo',
          label: 'Sin bolsas cargo',
          isDefault: true,
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

    assert.equal(result.commercialOptionsSnapshots.length, 1)
    assert.equal(result.commercialOptionsSnapshots[0]?.valueSlug, 'sin-bolsas-cargo')
  })

  it('rejects invalid and inactive commercial option selections', () => {
    const group = makeGroup({
      id: 'group-pockets',
      slug: 'pockets',
      name: 'Bolsas',
      values: [
        makeValue('group-pockets', {
          id: 'val-active',
          slug: 'con-bolsas-cargo',
          label: 'Con bolsas cargo',
        }),
        makeValue('group-pockets', {
          id: 'val-inactive',
          slug: 'retired',
          label: 'Retired',
          isActive: false,
        }),
      ],
    })

    const invalid = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupSlug: 'pockets', valueSlug: 'missing' }],
    })
    assert.equal(invalid.ok, false)

    const inactive = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupSlug: 'pockets', valueSlug: 'retired' }],
    })
    assert.equal(inactive.ok, false)
    if (!inactive.ok) {
      assert.equal(inactive.code, 'INACTIVE_VALUE')
    }
  })

  it('builds distinct commercial option line keys and merges identical selections', () => {
    const snapshotsA = [
      {
        groupId: 'g1',
        groupSlug: 'pockets',
        groupName: 'Bolsas',
        valueId: 'v1',
        valueSlug: 'sin-bolsas-cargo',
        valueLabel: 'Sin bolsas cargo',
        priceDeltaCents: 0,
      },
    ]
    const snapshotsB = [
      {
        groupId: 'g1',
        groupSlug: 'pockets',
        groupName: 'Bolsas',
        valueId: 'v2',
        valueSlug: 'con-bolsas-cargo',
        valueLabel: 'Con bolsas cargo',
        priceDeltaCents: 0,
      },
    ]

    const keyA = buildCommercialOptionsLineKey(snapshotsA)
    const keyB = buildCommercialOptionsLineKey(snapshotsB)
    assert.notEqual(keyA, keyB)
    assert.equal(buildCommercialOptionsLineKey(snapshotsA), keyA)
    assert.equal(buildCommercialOptionsLineKey([]), '')
  })

  it('includes optionPriceCents in cart totals and line totals', () => {
    const item = makeCartItem({
      unitPriceCents: 100000,
      customizationPriceCents: 5000,
      optionPriceCents: 15000,
      quantity: 2,
      selectedOptionsJson: [
        {
          groupId: 'g1',
          groupSlug: 'apron-length',
          groupName: 'Largo',
          valueId: 'v1',
          valueSlug: 'mas-10cm',
          valueLabel: '+10 cm',
          priceDeltaCents: 15000,
        },
      ],
    })

    const totals = computeCartTotals([item])
    assert.equal(totals.optionTotalCents, 30000)
    assert.equal(totals.totalCents, 100000 * 2 + 5000 * 2 + 15000 * 2)

    const gqlItem = mapCartItemToGql(item)
    assert.equal(gqlItem.optionPriceCents, 15000)
    assert.equal(gqlItem.totalPriceCents, (100000 + 5000 + 15000) * 2)
    assert.equal(gqlItem.commercialOptionsSnapshot.length, 1)
    assert.equal(gqlItem.commercialOptionsSnapshot[0]?.valueSlug, 'mas-10cm')
  })

  it('checkout totals and order line math include optionPriceCents', () => {
    const item = makeCartItem({
      unitPriceCents: 80000,
      customizationPriceCents: 2000,
      optionPriceCents: 10000,
      quantity: 1,
    })

    const totals = computeCheckoutTotalsFromCartItems([item], 5000)
    assert.equal(totals.optionTotalCents, 10000)
    assert.equal(totals.totalCents, 80000 + 2000 + 10000 + 5000)

    const lineUnitTotal = item.unitPriceCents + item.customizationPriceCents + item.optionPriceCents
    assert.equal(lineUnitTotal * item.quantity, 92000)
  })

  it('keeps customizer selectedOptions separate from commercialOptionsSnapshot', () => {
    const customizerSelectedOptions = { logo: true, embroideryText: 'Chef' }
    const item = makeCartItem({
      customizationPriceCents: 25000,
      configSnapshotJson: {
        customizationSnapshot: {
          designId: 'design-1',
          previewUrl: 'https://example.com/preview.webp',
          selectedOptions: customizerSelectedOptions,
          summary: ['Logo'],
          areas: ['pecho'],
          hasLogo: true,
          hasEmbroidery: false,
          embroideredName: null,
        },
      },
      selectedOptionsJson: [
        {
          groupId: 'g1',
          groupSlug: 'pockets',
          groupName: 'Bolsas',
          valueId: 'v1',
          valueSlug: 'con-bolsas-cargo',
          valueLabel: 'Con bolsas cargo',
          priceDeltaCents: 0,
        },
      ],
      optionPriceCents: 0,
    })

    const gqlItem = mapCartItemToGql(item)
    assert.deepEqual(gqlItem.customizationSnapshot.selectedOptions, customizerSelectedOptions)
    assert.equal(gqlItem.commercialOptionsSnapshot[0]?.groupSlug, 'pockets')
    assert.notDeepEqual(gqlItem.commercialOptionsSnapshot, customizerSelectedOptions)
  })

  it('round-trips commercial options snapshot JSON for cart line keys', () => {
    const snapshots = [
      {
        groupId: 'g2',
        groupSlug: 'embroidery',
        groupName: 'Bordado',
        valueId: 'v2',
        valueSlug: 'con-bordado',
        valueLabel: 'Con bordado',
        priceDeltaCents: 0,
      },
      {
        groupId: 'g1',
        groupSlug: 'apron-length',
        groupName: 'Largo',
        valueId: 'v1',
        valueSlug: 'mas-10cm',
        valueLabel: '+10 cm',
        priceDeltaCents: 15000,
      },
    ]

    const key = buildCommercialOptionsLineKey(snapshots)
    const parsed = parseCommercialOptionsSnapshot(snapshots)
    assert.equal(buildCommercialOptionsLineKey(parsed), key)
    assert.equal(key, 'apron-length:mas-10cm|embroidery:con-bordado')
  })
})
