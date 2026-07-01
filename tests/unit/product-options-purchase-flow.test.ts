import './helpers/mock-server-only'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  computeCartTotals,
  computeCheckoutTotalsFromCartItems,
  mapCartItemToGql,
} from '@/src/server/graphql/modules/cart/cart.mappers'
import type { CartItemWithRelations } from '@/src/server/graphql/modules/cart/cart.types'
import {
  buildCommercialOptionsLineKey,
  calculateProductOptionsPriceCents,
  validateSelectedProductOptions,
  type ProductOptionGroupWithValues,
  type ProductOptionSnapshot,
} from '@/src/server/product-options'

const PRODUCT_ID = 'product-apron-1'
const PRODUCT_TYPE_ID = 'type-apron'
const GROUP_ID = 'group-apron-length'
const VALUE_ID = 'value-plus-10cm'
const OPTION_PRICE_CENTS = 15000
const UNIT_PRICE_CENTS = 85000
const CUSTOMIZATION_PRICE_CENTS = 5000
const SHIPPING_CENTS = 9900
const QUANTITY = 2

function makePricedOptionGroup(): ProductOptionGroupWithValues {
  return {
    id: GROUP_ID,
    productId: PRODUCT_ID,
    productTypeId: null,
    slug: 'apron-length',
    name: 'Largo del mandil',
    description: null,
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 0,
    configJson: null,
    values: [
      {
        id: VALUE_ID,
        optionGroupId: GROUP_ID,
        slug: 'mas-10cm',
        label: '+10 cm',
        description: null,
        priceDeltaCents: OPTION_PRICE_CENTS,
        isDefault: false,
        isActive: true,
        sortOrder: 1,
        configJson: null,
      },
    ],
  }
}

function makeCartItemFromValidatedFlow(
  commercialOptionsSnapshots: ProductOptionSnapshot[],
  optionPriceCents: number,
): CartItemWithRelations {
  const customizerSelectedOptions = { embroideryText: 'Chef Ana' }

  return {
    id: 'cart-item-1',
    cartId: 'cart-1',
    productId: PRODUCT_ID,
    productVariantId: 'variant-m',
    designId: 'design-1',
    quantity: QUANTITY,
    unitPriceCents: UNIT_PRICE_CENTS,
    customizationPriceCents: CUSTOMIZATION_PRICE_CENTS,
    optionPriceCents,
    selectedOptionsJson: commercialOptionsSnapshots,
    configSnapshotJson: {
      customizationSnapshot: {
        designId: 'design-1',
        selectedOptions: customizerSelectedOptions,
        summary: ['Nombre bordado'],
      },
    },
    createdAt: new Date('2026-06-01T00:00:00.000Z'),
    updatedAt: new Date('2026-06-01T00:00:00.000Z'),
    product: {
      id: PRODUCT_ID,
      slug: 'mandil-ejecutivo',
      name: 'Mandil ejecutivo',
      basePriceCents: UNIT_PRICE_CENTS,
      status: 'ACTIVE',
      customizable: true,
      productTypeId: PRODUCT_TYPE_ID,
      productType: { id: PRODUCT_TYPE_ID, slug: 'apron', nameEs: 'Mandil', optionGroups: [] },
      images: [],
      variants: [],
      customizationRules: [],
      optionGroups: [],
    } as unknown as CartItemWithRelations['product'],
    productVariant: null,
    design: null,
  } as CartItemWithRelations
}

function copyCartLineToOrderItem(item: CartItemWithRelations) {
  const lineUnitTotal = item.unitPriceCents + item.customizationPriceCents + item.optionPriceCents

  return {
    quantity: item.quantity,
    unitPriceCents: item.unitPriceCents,
    customizationPriceCents: item.customizationPriceCents,
    optionPriceCents: item.optionPriceCents,
    lineTotalCents: lineUnitTotal * item.quantity,
    selectedOptionsJson: item.selectedOptionsJson,
  }
}

describe('product options purchase flow (server-side chain)', () => {
  it('validates ID-only add-to-cart input and prices options on the server', () => {
    const group = makePricedOptionGroup()

    const validation = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupId: GROUP_ID, valueId: VALUE_ID }],
    })

    assert.equal(validation.ok, true)
    if (!validation.ok) return

    assert.equal(validation.commercialOptionsSnapshots.length, 1)
    assert.equal(validation.commercialOptionsSnapshots[0]?.priceDeltaCents, OPTION_PRICE_CENTS)
    assert.equal(
      calculateProductOptionsPriceCents(validation.commercialOptionsSnapshots),
      OPTION_PRICE_CENTS,
    )
    assert.equal(validation.validatedSelections[0]?.value.id, VALUE_ID)
    assert.equal(validation.validatedSelections[0]?.fromDefault, false)
  })

  it('persists priced snapshots on the cart line and includes them in totals', () => {
    const group = makePricedOptionGroup()
    const validation = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupId: GROUP_ID, valueId: VALUE_ID }],
    })

    assert.equal(validation.ok, true)
    if (!validation.ok) return

    const optionPriceCents = calculateProductOptionsPriceCents(
      validation.commercialOptionsSnapshots,
    )
    const cartItem = makeCartItemFromValidatedFlow(
      validation.commercialOptionsSnapshots,
      optionPriceCents,
    )

    assert.equal(cartItem.optionPriceCents, OPTION_PRICE_CENTS)
    assert.equal(
      buildCommercialOptionsLineKey(validation.commercialOptionsSnapshots),
      'apron-length:mas-10cm',
    )

    const cartTotals = computeCartTotals([cartItem])
    assert.equal(cartTotals.optionTotalCents, OPTION_PRICE_CENTS * QUANTITY)
    assert.equal(
      cartTotals.totalCents,
      UNIT_PRICE_CENTS * QUANTITY +
        CUSTOMIZATION_PRICE_CENTS * QUANTITY +
        OPTION_PRICE_CENTS * QUANTITY,
    )

    const gqlItem = mapCartItemToGql(cartItem)
    assert.equal(gqlItem.optionPriceCents, OPTION_PRICE_CENTS)
    assert.equal(gqlItem.commercialOptionsSnapshot[0]?.valueSlug, 'mas-10cm')
    assert.equal(
      gqlItem.totalPriceCents,
      (UNIT_PRICE_CENTS + CUSTOMIZATION_PRICE_CENTS + OPTION_PRICE_CENTS) * QUANTITY,
    )
    assert.deepEqual(gqlItem.customizationSnapshot.selectedOptions, {
      embroideryText: 'Chef Ana',
    })
    assert.notDeepEqual(
      gqlItem.commercialOptionsSnapshot,
      gqlItem.customizationSnapshot.selectedOptions,
    )
  })

  it('carries optionPriceCents through checkout totals and order line copy', () => {
    const group = makePricedOptionGroup()
    const validation = validateSelectedProductOptions({
      productId: PRODUCT_ID,
      productTypeId: PRODUCT_TYPE_ID,
      optionGroups: [group],
      selectedCommercialOptions: [{ groupId: GROUP_ID, valueId: VALUE_ID }],
    })

    assert.equal(validation.ok, true)
    if (!validation.ok) return

    const cartItem = makeCartItemFromValidatedFlow(
      validation.commercialOptionsSnapshots,
      calculateProductOptionsPriceCents(validation.commercialOptionsSnapshots),
    )

    const checkoutTotals = computeCheckoutTotalsFromCartItems([cartItem], SHIPPING_CENTS)
    assert.equal(checkoutTotals.optionTotalCents, OPTION_PRICE_CENTS * QUANTITY)
    assert.equal(
      checkoutTotals.totalCents,
      UNIT_PRICE_CENTS * QUANTITY +
        CUSTOMIZATION_PRICE_CENTS * QUANTITY +
        OPTION_PRICE_CENTS * QUANTITY +
        SHIPPING_CENTS,
    )

    const orderItem = copyCartLineToOrderItem(cartItem)
    assert.equal(orderItem.optionPriceCents, OPTION_PRICE_CENTS)
    assert.deepEqual(orderItem.selectedOptionsJson, validation.commercialOptionsSnapshots)
    assert.equal(orderItem.lineTotalCents, 210000)
  })
})
