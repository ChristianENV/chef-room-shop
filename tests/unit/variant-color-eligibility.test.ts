import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  isVariantColorEligibleForProductType,
  isValidVariantColorRecord,
} from '@/src/config/variant-color-eligibility'
import {
  assertVariantColorAllowedForProductType,
  toVariantColorEligibilityInput,
} from '@/src/server/graphql/modules/admin-products/admin-products.variant-colors'
import { VARIANT_COLOR_NOT_ALLOWED_MESSAGE } from '@/src/config/catalog-color-messages'
import { GraphQLError } from 'graphql'

const activeFabricOnly = {
  slug: 'olive-green',
  name: 'Verde olivo',
  hexCode: '#4B5A3C',
  isFabricColor: true,
  isProductColor: false,
  isActive: true,
}

const inactiveFabric = {
  ...activeFabricOnly,
  slug: 'warm-gray',
  isProductColor: true,
  isActive: false,
}

const productBlack = {
  slug: 'black',
  name: 'Negro',
  hexCode: '#111111',
  isFabricColor: true,
  isProductColor: true,
  isActive: true,
}

describe('variant color eligibility', () => {
  it('chef-jacket includes active fabric colors', () => {
    assert.equal(
      isVariantColorEligibleForProductType({
        productTypeSlug: 'chef-jacket',
        color: activeFabricOnly,
      }),
      true,
    )
  })

  it('chef-jacket excludes inactive fabric colors', () => {
    assert.equal(
      isVariantColorEligibleForProductType({
        productTypeSlug: 'chef-jacket',
        color: inactiveFabric,
      }),
      false,
    )
  })

  it('apron does not include fabric-only colors', () => {
    assert.equal(
      isVariantColorEligibleForProductType({
        productTypeSlug: 'apron',
        color: activeFabricOnly,
      }),
      false,
    )
  })

  it('pants does not include fabric-only colors', () => {
    assert.equal(
      isVariantColorEligibleForProductType({
        productTypeSlug: 'pants',
        color: activeFabricOnly,
      }),
      false,
    )
  })

  it('shoes does not include fabric-only colors', () => {
    assert.equal(
      isVariantColorEligibleForProductType({
        productTypeSlug: 'shoes',
        color: activeFabricOnly,
      }),
      false,
    )
  })

  it('rejects colors without valid slug, name or hex', () => {
    assert.equal(isValidVariantColorRecord({ slug: '', name: 'X', hexCode: '#111111' }), false)
    assert.equal(isValidVariantColorRecord({ slug: 'black', name: '', hexCode: '#111111' }), false)
    assert.equal(
      isValidVariantColorRecord({ slug: 'black', name: 'Negro', hexCode: '111111' }),
      false,
    )
  })
})

describe('backend variant color validation', () => {
  it('accepts active fabric color for chef-jacket', () => {
    assert.doesNotThrow(() =>
      assertVariantColorAllowedForProductType({
        productTypeSlug: 'chef-jacket',
        color: activeFabricOnly,
      }),
    )
  })

  it('rejects fabric-only color for apron', () => {
    assert.throws(
      () =>
        assertVariantColorAllowedForProductType({
          productTypeSlug: 'apron',
          color: activeFabricOnly,
        }),
      (error) =>
        error instanceof GraphQLError && error.message === VARIANT_COLOR_NOT_ALLOWED_MESSAGE,
    )
  })

  it('rejects fabric-only color for pants and shoes', () => {
    for (const productTypeSlug of ['pants', 'shoes'] as const) {
      assert.throws(() =>
        assertVariantColorAllowedForProductType({
          productTypeSlug,
          color: activeFabricOnly,
        }),
      )
    }
  })

  it('maps prisma color rows to eligibility input', () => {
    const mapped = toVariantColorEligibilityInput({
      slug: 'black',
      name: 'Negro',
      hex: '#111111',
      isFabricColor: true,
      isProductColor: true,
      isActive: true,
    })

    assert.equal(mapped.hexCode, '#111111')
    assert.doesNotThrow(() =>
      assertVariantColorAllowedForProductType({
        productTypeSlug: 'apron',
        color: mapped,
      }),
    )
  })
})

describe('generate missing variants for chef-jacket fabric colors', () => {
  it('uses all eligible fabric colors without overwriting existing variants', async () => {
    const { generateMissingVariants } =
      await import('@/src/features/admin/products/lib/variant-matrix')
    const { buildVariantColorSelectOptions } =
      await import('@/src/features/admin/products/lib/variant-color-options')

    const catalogColors = [
      { id: 'color-black', sortOrder: 1, isGeneralColor: true, ...productBlack },
      { id: 'color-olive', sortOrder: 2, isGeneralColor: false, ...activeFabricOnly },
    ]

    const matrixColors = buildVariantColorSelectOptions({
      colors: catalogColors,
      productTypeSlug: 'chef-jacket',
    }).filter((row) => !row.isInvalidForProductType)

    assert.equal(matrixColors.length, 2)

    const existing = {
      id: 'var-1',
      sku: 'CR-FILIPINA-BLACK-M',
      variantName: null,
      colorId: 'color-black',
      sizeId: 'size-m',
      colorName: 'Negro',
      sizeName: 'M',
      pricePesos: 999,
      stockQty: 2,
      isActive: true,
      isPersisted: true,
    }

    const generated = generateMissingVariants({
      variants: [existing],
      colors: matrixColors.map((color) => ({
        ...color,
        hexCode: color.value === 'color-black' ? '#111111' : '#4B5A3C',
      })),
      sizes: [{ value: 'size-m', label: 'M', slug: 'm' }],
      colorMeta: {
        'color-black': { name: 'Negro', hexCode: '#111111', slug: 'black' },
        'color-olive': { name: 'Verde olivo', hexCode: '#4B5A3C', slug: 'olive-green' },
      },
      sizeMeta: { 'size-m': { name: 'M', slug: 'm' } },
      productSlug: 'filipina-ejecutiva',
      basePricePesos: 799,
      newId: () => 'temp-olive-m',
    })

    assert.equal(generated.length, 2)
    assert.equal(generated.find((row) => row.id === 'var-1')?.pricePesos, 999)
    assert.ok(generated.some((row) => row.colorId === 'color-olive'))
  })
})
