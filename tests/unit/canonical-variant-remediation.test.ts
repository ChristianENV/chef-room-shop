import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CANONICAL_PRODUCTS, CANONICAL_PRODUCT_SLUGS } from '@/prisma/seed-canonical-products.data'
import {
  APPAREL_SIZE_SLUGS,
  MANDIL_COLOR_SLUGS,
  PANT_COLOR_SLUGS,
  SHOE_SIZE_SLUGS,
} from '@/prisma/seed-catalog-reference'
import {
  canonicalSeedVariantColorsAllowed,
  findNonCanonicalActiveVariantKeys,
  remediateCanonicalProductVariants,
} from '@/prisma/seed-canonical-variant-remediation'
import { variantMatrixKey } from '@/prisma/seed-canonical-variants'
import { isVariantColorAllowedForProductType } from '@/src/config/catalog-colors'

describe('canonical variant remediation', () => {
  it('identifies mandil chef-blue rows as outside canonical matrix', () => {
    const mandil = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-mandil-profesional-chef')
    assert.ok(mandil)

    const keys = findNonCanonicalActiveVariantKeys(mandil, [
      { colorSlug: 'chef-blue', sizeSlug: 'l' },
      { colorSlug: 'black', sizeSlug: 'm' },
    ])

    assert.deepEqual(keys, ['chef-blue:l'])
  })

  it('seed matrix uses allowed colors per product type', () => {
    for (const product of CANONICAL_PRODUCTS) {
      assert.equal(
        canonicalSeedVariantColorsAllowed(product),
        true,
        `${product.slug} has disallowed seed colors`,
      )
    }
  })

  it('mandil seed non-deleted matrix is black and white only', () => {
    const mandil = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-mandil-profesional-chef')
    assert.ok(mandil)
    const colors = new Set(mandil.variants.map((variant) => variant.colorSlug))
    assert.deepEqual([...colors].sort(), [...MANDIL_COLOR_SLUGS].sort())
    assert.equal(mandil.variants.length, MANDIL_COLOR_SLUGS.length * APPAREL_SIZE_SLUGS.length)
  })

  it('pants seed non-deleted matrix is black only', () => {
    const pants = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-pantalon-chef-comfort')
    assert.ok(pants)
    assert.equal(
      pants.variants.every((variant) => variant.colorSlug === 'black'),
      true,
    )
    assert.equal(pants.variants.length, PANT_COLOR_SLUGS.length * APPAREL_SIZE_SLUGS.length)
  })

  it('shoes seed non-deleted matrix is black and shoe sizes only', () => {
    const stico = CANONICAL_PRODUCTS.find((row) => row.slug === 'zapato-stico-real-safety')
    assert.ok(stico)
    assert.equal(
      stico.variants.every((variant) => variant.colorSlug === 'black'),
      true,
    )
    assert.equal(stico.variants.length, SHOE_SIZE_SLUGS.length)
    assert.equal(
      stico.variants.some((variant) => variant.sizeSlug.includes('.')),
      false,
    )
  })

  it('soft-deletes non-canonical variants without hard delete', async () => {
    const mandil = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-mandil-profesional-chef')
    assert.ok(mandil)

    const orphanId = 'variant-chef-blue-l'
    const keptId = 'variant-black-m'
    let updateManyCalled = false
    let deleteManyHard = false

    const prisma = {
      productVariant: {
        findMany: async () => [
          {
            id: orphanId,
            sku: 'DEMO-MAN-CHEFBLUE-L',
            color: { slug: 'chef-blue' },
            size: { slug: 'l' },
            _count: { cartItems: 2 },
          },
          {
            id: keptId,
            sku: 'CR-MANDILPROFESIONALCHEF-BLACK-M',
            color: { slug: 'black' },
            size: { slug: 'm' },
            _count: { cartItems: 0 },
          },
        ],
        updateMany: async () => {
          updateManyCalled = true
          return { count: 1 }
        },
        deleteMany: async () => {
          deleteManyHard = true
          return { count: 0 }
        },
      },
      cartItem: {
        deleteMany: async () => ({ count: 2 }),
      },
    }

    const result = await remediateCanonicalProductVariants(prisma as never, 'prod-mandil', mandil)

    assert.equal(result.softDeleted.length, 1)
    assert.equal(result.softDeleted[0]?.sku, 'DEMO-MAN-CHEFBLUE-L')
    assert.equal(result.cartRowsDeleted, 2)
    assert.equal(updateManyCalled, true)
    assert.equal(deleteManyHard, false)
  })

  it('is idempotent when no non-canonical active variants remain', async () => {
    const mandil = CANONICAL_PRODUCTS.find((row) => row.slug === 'demo-mandil-profesional-chef')
    assert.ok(mandil)

    const active = mandil.variants.map((variant) => ({
      colorSlug: variant.colorSlug,
      sizeSlug: variant.sizeSlug,
    }))

    assert.deepEqual(findNonCanonicalActiveVariantKeys(mandil, active), [])
  })

  it('only remediates canonical product slugs in seed', () => {
    assert.deepEqual(CANONICAL_PRODUCT_SLUGS, [
      'demo-filipina-chef-room',
      'demo-filipina-executive',
      'demo-mandil-profesional-chef',
      'demo-pantalon-chef-comfort',
      'zapato-stico-real-safety',
    ])
  })

  it('filipina seed matrix colors are allowed for chef-jacket', () => {
    for (const slug of ['demo-filipina-chef-room', 'demo-filipina-executive'] as const) {
      const product = CANONICAL_PRODUCTS.find((row) => row.slug === slug)
      assert.ok(product)
      for (const variant of product.variants) {
        assert.equal(
          isVariantColorAllowedForProductType({
            productTypeSlug: 'chef-jacket',
            colorSlug: variant.colorSlug,
          }),
          true,
        )
        assert.equal(
          APPAREL_SIZE_SLUGS.includes(variant.sizeSlug as (typeof APPAREL_SIZE_SLUGS)[number]),
          true,
        )
      }
    }
  })

  it('canonical matrix keys are unique per product', () => {
    for (const product of CANONICAL_PRODUCTS) {
      const keys = product.variants.map((variant) =>
        variantMatrixKey(variant.colorSlug, variant.sizeSlug),
      )
      assert.equal(new Set(keys).size, keys.length, `${product.slug} has duplicate matrix keys`)
    }
  })
})
