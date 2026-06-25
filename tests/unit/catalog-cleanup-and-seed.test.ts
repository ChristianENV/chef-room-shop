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
import { STICO_PRODUCT_SLUG, buildSticoDescription } from '@/prisma/seed-stico-product'

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
  it('includes all canonical product slugs (ACTIVE and DRAFT)', () => {
    assert.deepEqual(CANONICAL_PRODUCT_SLUGS, [
      'demo-filipina-chef-room',
      'demo-filipina-executive',
      'demo-mandil-profesional-chef',
      'demo-pantalon-chef-comfort',
      'zapato-stico-real-safety',
    ])
  })

  it('seeds only ACTIVE products without variants for storefront', () => {
    assert.deepEqual(CANONICAL_ACTIVE_PRODUCT_SLUGS, [
      'demo-filipina-executive',
      'demo-mandil-profesional-chef',
      'demo-pantalon-chef-comfort',
      'zapato-stico-real-safety',
    ])

    for (const slug of CANONICAL_ACTIVE_PRODUCT_SLUGS) {
      const product = CANONICAL_PRODUCTS.find((row) => row.slug === slug)
      assert.ok(product)
      assert.equal(product.status, ProductStatus.ACTIVE)
      assert.ok(product.variants.length > 0, `${slug} must have variants to be ACTIVE`)
    }
  })

  it('keeps Filipina Clásica as DRAFT until variants exist', () => {
    const filipina = CANONICAL_PRODUCTS.find(
      (product) => product.slug === 'demo-filipina-chef-room',
    )
    assert.ok(filipina)
    assert.equal(filipina.status, ProductStatus.DRAFT)
    assert.equal(filipina.variants.length, 0)
    assert.equal(filipina.images.length, 6)
    assert.equal(CANONICAL_ACTIVE_PRODUCT_SLUGS.includes('demo-filipina-chef-room'), false)
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
})
