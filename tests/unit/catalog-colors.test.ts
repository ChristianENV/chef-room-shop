import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CANONICAL_PRODUCTS } from '@/prisma/seed-canonical-products.data'
import {
  GARMENT_COLOR_SLUGS,
  MANDIL_COLOR_SLUGS,
  PANT_COLOR_SLUGS,
  SHOE_COLOR_SLUGS,
  variantColorSlugsForProductType,
} from '@/prisma/seed-catalog-reference'
import {
  getAllowedVariantColorSlugsForProductType,
  isVariantColorAllowedForProductType,
  PRODUCT_TYPE_VARIANT_COLOR_SLUGS,
} from '@/src/config/catalog-colors'
import {
  DEFAULT_FABRIC_COLORS,
  getCatalogColorSlugForFabricColor,
} from '@/src/features/storefront/customizer/constants/fabric-colors'

describe('catalog color config', () => {
  it('allows chef-jacket colors black, white, chef-blue, warm-gray', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('chef-jacket'), [
      'black',
      'white',
      'chef-blue',
      'warm-gray',
    ])
    for (const colorSlug of ['black', 'white', 'chef-blue', 'warm-gray']) {
      assert.equal(
        isVariantColorAllowedForProductType({ productTypeSlug: 'chef-jacket', colorSlug }),
        true,
      )
    }
  })

  it('allows apron black and white only', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('apron'), ['black', 'white'])
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'apron', colorSlug: 'black' }),
      true,
    )
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'apron', colorSlug: 'white' }),
      true,
    )
  })

  it('rejects chef-blue for apron', () => {
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'apron', colorSlug: 'chef-blue' }),
      false,
    )
  })

  it('allows pants black only', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('pants'), ['black'])
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'pants', colorSlug: 'black' }),
      true,
    )
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'pants', colorSlug: 'white' }),
      false,
    )
  })

  it('allows shoes black only and rejects warm-gray', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('shoes'), ['black'])
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'shoes', colorSlug: 'black' }),
      true,
    )
    assert.equal(
      isVariantColorAllowedForProductType({ productTypeSlug: 'shoes', colorSlug: 'warm-gray' }),
      false,
    )
  })

  it('returns no colors for unknown product types', () => {
    assert.deepEqual(getAllowedVariantColorSlugsForProductType('unknown-type'), [])
    assert.equal(
      isVariantColorAllowedForProductType({
        productTypeSlug: 'unknown-type',
        colorSlug: 'black',
      }),
      false,
    )
  })

  it('normalizes slug casing and separators', () => {
    assert.equal(
      isVariantColorAllowedForProductType({
        productTypeSlug: 'Chef_Jacket',
        colorSlug: 'CHEF-BLUE',
      }),
      true,
    )
  })
})

describe('fabric to catalog color mapping', () => {
  it('maps chef-room-blue fabric id to chef-blue catalog slug', () => {
    assert.equal(getCatalogColorSlugForFabricColor('chef-room-blue'), 'chef-blue')
  })

  it('returns catalog slug when fabric id matches a known catalog slug', () => {
    assert.equal(getCatalogColorSlugForFabricColor('warm-gray'), 'warm-gray')
  })

  it('does not auto-map fabric-only colors to catalog colors', () => {
    assert.equal(getCatalogColorSlugForFabricColor('olive-green'), null)
    assert.equal(getCatalogColorSlugForFabricColor('petrol-blue'), null)
    assert.equal(getCatalogColorSlugForFabricColor('charcoal-black'), null)

    for (const fabricColor of DEFAULT_FABRIC_COLORS) {
      if (fabricColor.id === 'chef-room-blue' || fabricColor.id === 'warm-gray') {
        continue
      }
      assert.equal(
        getCatalogColorSlugForFabricColor(fabricColor.id),
        null,
        `expected no catalog mapping for fabric-only color ${fabricColor.id}`,
      )
    }
  })
})

describe('seed variant matrix uses shared product type color rules', () => {
  it('keeps seed-catalog-reference aliases aligned with shared config', () => {
    assert.deepEqual(GARMENT_COLOR_SLUGS, PRODUCT_TYPE_VARIANT_COLOR_SLUGS['chef-jacket'])
    assert.deepEqual(MANDIL_COLOR_SLUGS, PRODUCT_TYPE_VARIANT_COLOR_SLUGS.apron)
    assert.deepEqual(PANT_COLOR_SLUGS, PRODUCT_TYPE_VARIANT_COLOR_SLUGS.pants)
    assert.deepEqual(SHOE_COLOR_SLUGS, PRODUCT_TYPE_VARIANT_COLOR_SLUGS.shoes)
    assert.deepEqual(
      variantColorSlugsForProductType('chef-jacket'),
      getAllowedVariantColorSlugsForProductType('chef-jacket'),
    )
  })

  it('uses shared rules for canonical product variant color sets', () => {
    const filipinaSlugs = ['demo-filipina-chef-room', 'demo-filipina-executive']
    for (const slug of filipinaSlugs) {
      const product = CANONICAL_PRODUCTS.find((row) => row.slug === slug)
      assert.ok(product)
      const colors = new Set(product.variants.map((variant) => variant.colorSlug))
      assert.deepEqual(
        [...colors].sort(),
        [...getAllowedVariantColorSlugsForProductType('chef-jacket')].sort(),
      )
    }

    const mandil = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-mandil-profesional-chef')
    assert.ok(mandil)
    assert.deepEqual(
      [...new Set(mandil.variants.map((variant) => variant.colorSlug))].sort(),
      [...getAllowedVariantColorSlugsForProductType('apron')].sort(),
    )

    const pantalon = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-pantalon-chef-comfort')
    assert.ok(pantalon)
    assert.deepEqual(
      [...new Set(pantalon.variants.map((variant) => variant.colorSlug))].sort(),
      [...getAllowedVariantColorSlugsForProductType('pants')].sort(),
    )

    const stico = CANONICAL_PRODUCTS.find((row) => row.slug === 'zapato-stico-real-safety')
    assert.ok(stico)
    assert.deepEqual(
      [...new Set(stico.variants.map((variant) => variant.colorSlug))].sort(),
      [...getAllowedVariantColorSlugsForProductType('shoes')].sort(),
    )
  })
})
