import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  mapBffCartItemToUiItem,
  mapBffCartToCartPreview,
  normalizeCommercialOptionsSnapshot,
} from '@/src/features/storefront/cart/mappers/cart-ui.mapper'
import { getCartPreviewLineTotal } from '@/src/features/storefront/cart/lib/cart-utils'
import { mapBffCartToCheckoutSummary } from '@/src/features/storefront/checkout/mappers/checkout-ui.mapper'
import type { Cart, CartItem } from '@/src/features/storefront/cart/types/cart-bff.types'

function makeCartItem(overrides: Partial<CartItem> = {}): CartItem {
  return {
    id: 'item-1',
    productId: 'prod-1',
    productVariantId: 'variant-1',
    designId: null,
    quantity: 1,
    unitPriceCents: 100000,
    customizationPriceCents: 0,
    optionPriceCents: 0,
    totalPriceCents: 100000,
    product: null,
    design: null,
    productSnapshot: {
      productId: 'prod-1',
      variantId: 'variant-1',
      slug: 'pants',
      name: 'Pantalón',
      sku: 'PANTS-M',
      imageUrl: null,
      productType: 'Pantalón',
      colorName: 'Negro',
      colorHex: '#000000',
      sizeName: 'M',
    },
    customizationSnapshot: {
      designId: null,
      previewUrl: null,
      summary: [],
      areas: [],
      hasLogo: false,
      hasEmbroidery: false,
      embroideredName: null,
    },
    commercialOptionsSnapshot: [],
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
    ...overrides,
  }
}

function makeCart(items: CartItem[]): Cart {
  return {
    id: 'cart-1',
    status: 'ACTIVE',
    currency: 'MXN',
    subtotalCents: items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0),
    customizationTotalCents: items.reduce(
      (sum, item) => sum + item.customizationPriceCents * item.quantity,
      0,
    ),
    optionTotalCents: items.reduce((sum, item) => sum + item.optionPriceCents * item.quantity, 0),
    shippingCostCents: 0,
    discountTotalCents: 0,
    totalCents: items.reduce((sum, item) => sum + item.totalPriceCents, 0),
    totalItems: items.reduce((sum, item) => sum + item.quantity, 0),
    items,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-01T00:00:00.000Z',
  }
}

describe('cart commercial options UI mapping', () => {
  it('maps missing commercialOptionsSnapshot to an empty array', () => {
    assert.deepEqual(normalizeCommercialOptionsSnapshot(null), [])
    assert.deepEqual(normalizeCommercialOptionsSnapshot(undefined), [])
  })

  it('renders cart item without commercial options normally', () => {
    const uiItem = mapBffCartItemToUiItem(makeCartItem())
    assert.deepEqual(uiItem.commercialOptionsSnapshot, [])
    assert.equal(uiItem.optionPrice, undefined)
    assert.equal(getCartPreviewLineTotal(uiItem), 1000)
  })

  it('displays commercial option labels and positive price deltas', () => {
    const uiItem = mapBffCartItemToUiItem(
      makeCartItem({
        optionPriceCents: 15000,
        totalPriceCents: 115000,
        commercialOptionsSnapshot: [
          {
            groupId: 'group-length',
            groupSlug: 'apron-length',
            groupName: 'Largo del mandil',
            valueId: 'val-plus',
            valueSlug: 'mas-10cm',
            valueLabel: '+10 cm',
            priceDeltaCents: 15000,
          },
        ],
      }),
    )

    assert.equal(uiItem.commercialOptionsSnapshot[0]?.groupName, 'Largo del mandil')
    assert.equal(uiItem.commercialOptionsSnapshot[0]?.valueLabel, '+10 cm')
    assert.equal(uiItem.optionPrice, 150)
    assert.equal(uiItem.lineTotal, 1150)
  })

  it('includes optionTotal in cart preview when greater than 0', () => {
    const preview = mapBffCartToCartPreview(
      makeCart([
        makeCartItem({
          optionPriceCents: 15000,
          totalPriceCents: 115000,
          commercialOptionsSnapshot: [
            {
              groupId: 'group-length',
              groupSlug: 'apron-length',
              groupName: 'Largo del mandil',
              valueId: 'val-plus',
              valueSlug: 'mas-10cm',
              valueLabel: '+10 cm',
              priceDeltaCents: 15000,
            },
          ],
        }),
      ]),
    )

    assert.equal(preview.optionTotal, 150)
  })

  it('keeps customizer selectedOptions separate from commercialOptionsSnapshot', () => {
    const customizerSelectedOptions = { embroideryText: 'Chef Carlos' }
    const uiItem = mapBffCartItemToUiItem(
      makeCartItem({
        designId: 'design-1',
        customizationPriceCents: 25000,
        customizationSnapshot: {
          designId: 'design-1',
          previewUrl: 'https://example.com/preview.webp',
          selectedOptions: customizerSelectedOptions,
          summary: ['Chef Carlos'],
          areas: ['pecho'],
          hasLogo: false,
          hasEmbroidery: true,
          embroideredName: 'Chef Carlos',
        },
        commercialOptionsSnapshot: [
          {
            groupId: 'group-pockets',
            groupSlug: 'pockets',
            groupName: 'Bolsas',
            valueId: 'val-cargo',
            valueSlug: 'con-bolsas-cargo',
            valueLabel: 'Con bolsas cargo',
            priceDeltaCents: 0,
          },
        ],
      }),
    )

    assert.equal(uiItem.commercialOptionsSnapshot[0]?.groupSlug, 'pockets')
    assert.notDeepEqual(uiItem.commercialOptionsSnapshot, customizerSelectedOptions)
    assert.equal(uiItem.isCustomized, true)
    assert.ok(uiItem.customizationSummary)
  })

  it('maps checkout summary with commercial options and server totals', () => {
    const summary = mapBffCartToCheckoutSummary(
      makeCart([
        makeCartItem({
          optionPriceCents: 10000,
          totalPriceCents: 110000,
          commercialOptionsSnapshot: [
            {
              groupId: 'group-dry-fit',
              groupSlug: 'dry-fit-back',
              groupName: 'Dry fit en espalda',
              valueId: 'val-dry',
              valueSlug: 'con-dry-fit',
              valueLabel: 'Con dry fit en espalda',
              priceDeltaCents: 10000,
            },
          ],
        }),
      ]),
    )

    assert.equal(summary.optionTotalPesos, 100)
    assert.equal(summary.items[0]?.commercialOptionsSnapshot[0]?.valueLabel, 'Con dry fit en espalda')
    assert.equal(summary.items[0]?.lineTotalPesos, 1100)
    assert.equal(summary.totalPesos, 1100)
  })
})
