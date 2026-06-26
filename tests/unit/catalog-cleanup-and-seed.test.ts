import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ProductStatus } from '@prisma/client'

import {
  ARCHIVED_TEST_PRODUCT_SLUGS,
  deleteArchivedTestProducts,
} from '@/scripts/catalog/delete-archived-test-products'
import {
  PRODUCTION_GUARD_ERRORS,
  assertNonProductionDatabase,
} from '@/scripts/catalog/assert-non-production-db'
import {
  CANONICAL_ACTIVE_PRODUCT_SLUGS,
  CANONICAL_PRODUCTS,
  CANONICAL_PRODUCT_SLUGS,
} from '@/prisma/seed-canonical-products.data'
import {
  APPAREL_SIZE_SLUGS,
  GARMENT_COLOR_SLUGS,
  MANDIL_COLOR_SLUGS,
  PANT_COLOR_SLUGS,
  SHOE_SIZE_SLUGS,
} from '@/prisma/seed-catalog-reference'
import { buildCanonicalVariantSku, variantMatrixKey } from '@/prisma/seed-canonical-variants'
import { STICO_PRODUCT_SLUG, buildSticoDescription } from '@/prisma/seed-stico-product'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const SAFE_DATABASE_URL = 'postgresql://user:pass@ep-example.neon.tech/neondb'

describe('assertNonProductionDatabase', () => {
  it('blocks production NODE_ENV with a stable error message', () => {
    assert.throws(
      () =>
        assertNonProductionDatabase({
          databaseUrl: SAFE_DATABASE_URL,
          nodeEnv: 'production',
        }),
      (error: unknown) => {
        assert.ok(error instanceof Error)
        assert.equal(error.message, PRODUCTION_GUARD_ERRORS.nodeEnv)
        return true
      },
    )
  })

  it('blocks APP_ENV=production', () => {
    assert.throws(
      () =>
        assertNonProductionDatabase({
          databaseUrl: SAFE_DATABASE_URL,
          appEnv: 'production',
        }),
      (error: unknown) => {
        assert.ok(error instanceof Error)
        assert.equal(error.message, PRODUCTION_GUARD_ERRORS.appEnv)
        return true
      },
    )
  })

  it('blocks production DATABASE_URL markers', () => {
    assert.throws(
      () =>
        assertNonProductionDatabase({
          databaseUrl: 'postgresql://user:pass@prod-db.example.com/app',
        }),
      /DATABASE_URL appears to target production/,
    )
  })

  it('allows non-production when env is injected explicitly', () => {
    const result = assertNonProductionDatabase({
      databaseUrl: SAFE_DATABASE_URL,
      nodeEnv: 'development',
      vercelEnv: 'preview',
    })
    assert.equal(result.ok, true)
  })

  it('reads process.env.NODE_ENV without mutating it', () => {
    const originalNodeEnv = process.env.NODE_ENV
    assert.doesNotThrow(() =>
      assertNonProductionDatabase({
        databaseUrl: SAFE_DATABASE_URL,
        nodeEnv: originalNodeEnv ?? 'development',
      }),
    )
    assert.equal(process.env.NODE_ENV, originalNodeEnv)
  })
})

describe('delete archived test products', () => {
  it('uses an explicit slug allowlist', () => {
    assert.deepEqual(ARCHIVED_TEST_PRODUCT_SLUGS, [
      'demo-filipina-clasica',
      'demo-filipina-manga-corta-premium',
      'demo-mandil-denim-ejecutivo',
      'demo-pantalon-chef-slim-gris',
      'filipina-prueba',
      'filipina-prueba-copia',
    ])
  })

  it('blocks products with order history', async () => {
    const prisma = {
      product: {
        findUnique: async () => ({
          id: 'prod-1',
          slug: 'filipina-prueba',
          status: 'ARCHIVED',
          deletedAt: new Date(),
          variants: [],
          images: [],
          customizationRules: [],
          modelAssets: [],
          _count: { cartItems: 0 },
        }),
      },
      orderItem: {
        findMany: async () => [
          { productSnapshotJson: { slug: 'filipina-prueba', productId: 'prod-1' } },
        ],
      },
      cartItem: { deleteMany: async () => ({ count: 0 }) },
      $transaction: async () => {
        throw new Error('should not delete when order history exists')
      },
    }

    const report = await deleteArchivedTestProducts(prisma as never, ['filipina-prueba'])
    assert.equal(report.deleted.length, 0)
    assert.equal(report.blocked[0]?.reason, 'has 1 order item(s) in order history')
  })
})

describe('canonical production seed', () => {
  const filipinaSlugs = ['demo-filipina-chef-room', 'demo-filipina-executive'] as const
  const expectedFilipinaVariants = GARMENT_COLOR_SLUGS.length * APPAREL_SIZE_SLUGS.length

  function findProduct(slug: string) {
    const product = CANONICAL_PRODUCTS.find((row) => row.slug === slug)
    assert.ok(product, `missing canonical product: ${slug}`)
    return product
  }

  it('includes all canonical product slugs', () => {
    assert.deepEqual(CANONICAL_PRODUCT_SLUGS, [
      'demo-filipina-chef-room',
      'demo-filipina-executive',
      'demo-mandil-profesional-chef',
      'demo-pantalon-chef-comfort',
      'zapato-stico-real-safety',
    ])
  })

  it('seeds only ACTIVE storefront-ready products with variants', () => {
    assert.deepEqual(CANONICAL_ACTIVE_PRODUCT_SLUGS, [
      'demo-filipina-chef-room',
      'demo-filipina-executive',
      'demo-mandil-profesional-chef',
      'demo-pantalon-chef-comfort',
      'zapato-stico-real-safety',
    ])

    for (const slug of CANONICAL_ACTIVE_PRODUCT_SLUGS) {
      const product = findProduct(slug)
      assert.equal(product.status, ProductStatus.ACTIVE)
      assert.ok(product.variants.length > 0, `${slug} must have variants to be ACTIVE`)
    }
  })

  it('makes Filipina Clásica ACTIVE with a full variant matrix', () => {
    const filipina = findProduct('demo-filipina-chef-room')
    assert.equal(filipina.status, ProductStatus.ACTIVE)
    assert.equal(filipina.typeSlug, 'chef-jacket')
    assert.equal(filipina.customizable, true)
    assert.equal(filipina.variants.length, expectedFilipinaVariants)
    assert.equal(filipina.images.length, 6)
    assert.equal(
      filipina.variants.every(
        (variant) =>
          GARMENT_COLOR_SLUGS.includes(variant.colorSlug as (typeof GARMENT_COLOR_SLUGS)[number]) &&
          APPAREL_SIZE_SLUGS.includes(variant.sizeSlug as (typeof APPAREL_SIZE_SLUGS)[number]),
      ),
      true,
    )
  })

  it('covers Filipinas with all apparel sizes × all garment colors', () => {
    for (const slug of filipinaSlugs) {
      const product = findProduct(slug)
      assert.equal(product.variants.length, expectedFilipinaVariants)

      for (const colorSlug of GARMENT_COLOR_SLUGS) {
        for (const sizeSlug of APPAREL_SIZE_SLUGS) {
          const match = product.variants.find(
            (variant) => variant.colorSlug === colorSlug && variant.sizeSlug === sizeSlug,
          )
          assert.ok(match, `${slug} missing ${colorSlug}×${sizeSlug}`)
        }
      }
    }
  })

  it('covers Mandil with black and white × all apparel sizes only', () => {
    const mandil = findProduct('demo-mandil-profesional-chef')
    const expected = MANDIL_COLOR_SLUGS.length * APPAREL_SIZE_SLUGS.length
    assert.equal(mandil.variants.length, expected)
    assert.equal(
      mandil.variants.every((variant) =>
        MANDIL_COLOR_SLUGS.includes(variant.colorSlug as 'black' | 'white'),
      ),
      true,
    )
    assert.equal(
      mandil.variants.some((variant) => variant.colorSlug === 'chef-blue'),
      false,
    )
  })

  it('covers Pantalón with black × all apparel sizes only', () => {
    const pantalon = findProduct('demo-pantalon-chef-comfort')
    const expected = PANT_COLOR_SLUGS.length * APPAREL_SIZE_SLUGS.length
    assert.equal(pantalon.customizable, false)
    assert.equal(pantalon.variants.length, expected)
    assert.equal(
      pantalon.variants.every((variant) => variant.colorSlug === 'black'),
      true,
    )
  })

  it('does not use shoe sizes on apparel products', () => {
    const apparelProducts = CANONICAL_PRODUCTS.filter((product) => product.typeSlug !== 'shoes')
    for (const product of apparelProducts) {
      assert.equal(
        product.variants.some((variant) =>
          SHOE_SIZE_SLUGS.includes(variant.sizeSlug as (typeof SHOE_SIZE_SLUGS)[number]),
        ),
        false,
        `${product.slug} must not include shoe sizes`,
      )
    }
  })

  it('uses basePriceCents and stockQty 0 for generated variants', () => {
    const filipina = findProduct('demo-filipina-chef-room')
    for (const variant of filipina.variants) {
      assert.equal(variant.priceCents, filipina.basePriceCents)
      assert.equal(variant.stockQty, 0)
      assert.match(variant.sku, /^CR-FILIPINACLASICA-/)
    }

    const executive = findProduct('demo-filipina-executive')
    const generatedExecutive = executive.variants.filter((variant) =>
      variant.sku.startsWith('CR-FILIPINAEXECUTIVE-'),
    )
    assert.ok(generatedExecutive.length > 0)
    for (const variant of generatedExecutive) {
      assert.equal(variant.priceCents, executive.basePriceCents)
      assert.equal(variant.stockQty, 0)
    }
  })

  it('preserves exported variant SKU/price/stock where present', () => {
    const executive = findProduct('demo-filipina-executive')
    const preserved = executive.variants.find((variant) => variant.sku === 'DEMO-FIL-CHEFBLUE-M')
    assert.ok(preserved)
    assert.equal(preserved.priceCents, 169900)
    assert.equal(preserved.stockQty, 25)

    const mandil = findProduct('demo-mandil-profesional-chef')
    const mandilWhiteL = mandil.variants.find((variant) => variant.sku === 'DEMO-MAN-WHITE-L')
    assert.ok(mandilWhiteL)
    assert.equal(mandilWhiteL.priceCents, 64900)
    assert.equal(mandilWhiteL.stockQty, 25)
  })

  it('generates deterministic unique SKUs for missing variants', () => {
    const filipina = findProduct('demo-filipina-chef-room')
    const expectedSku = buildCanonicalVariantSku('FILIPINACLASICA', 'black', 'xs')
    const variant = filipina.variants.find(
      (row) => row.colorSlug === 'black' && row.sizeSlug === 'xs',
    )
    assert.ok(variant)
    assert.equal(variant.sku, expectedSku)

    const skus = new Set(filipina.variants.map((row) => row.sku))
    assert.equal(skus.size, filipina.variants.length)
  })

  it('has no duplicate color×size variants', () => {
    for (const product of CANONICAL_PRODUCTS) {
      const keys = product.variants.map((variant) =>
        variantMatrixKey(variant.colorSlug, variant.sizeSlug),
      )
      assert.equal(new Set(keys).size, keys.length, `${product.slug} has duplicate color×size`)
    }
  })

  it('excludes archived/demo test product slugs', () => {
    for (const slug of ARCHIVED_TEST_PRODUCT_SLUGS) {
      assert.equal(CANONICAL_PRODUCT_SLUGS.includes(slug), false)
    }
  })

  it('does not reseed hard-deleted test products', () => {
    assert.equal(CANONICAL_PRODUCT_SLUGS.includes('demo-filipina-manga-corta-premium'), false)
    assert.equal(CANONICAL_PRODUCT_SLUGS.includes('filipina-prueba-copia'), false)
  })

  it('seeds STICO as ACTIVE with black shoe variants 22-30', () => {
    const stico = CANONICAL_PRODUCTS.find((product) => product.slug === STICO_PRODUCT_SLUG)
    assert.ok(stico)
    assert.equal(stico.status, ProductStatus.ACTIVE)
    assert.equal(stico.typeSlug, 'shoes')
    assert.equal(stico.basePriceCents, 99900)
    assert.equal(stico.customizable, false)
    assert.equal(stico.variants.length, 9)
    assert.equal(
      stico.variants.every(
        (variant) => variant.colorSlug === 'black' && variant.priceCents === 99900,
      ),
      true,
    )
    assert.deepEqual(
      stico.variants.map((variant) => variant.sizeSlug),
      ['22', '23', '24', '25', '26', '27', '28', '29', '30'],
    )
  })

  it('does not invent half sizes in STICO variants', () => {
    const stico = CANONICAL_PRODUCTS.find((product) => product.slug === STICO_PRODUCT_SLUG)
    assert.ok(stico)
    assert.equal(
      stico.variants.some((variant) => variant.sizeSlug.includes('.')),
      false,
    )
  })

  it('builds STICO description from confirmed specs', () => {
    const description = buildSticoDescription()
    assert.match(description, /90% EVA ARLON CX/)
    assert.match(description, /ÖNORM EN ISO 20347:2012/)
  })

  it('does not invoke demo seed from production seed path', () => {
    const seedSource = readFileSync(join(process.cwd(), 'prisma', 'seed.ts'), 'utf8')
    assert.equal(seedSource.includes('seed-demo'), false)
    assert.equal(seedSource.includes('seedDemo'), false)
  })
})
