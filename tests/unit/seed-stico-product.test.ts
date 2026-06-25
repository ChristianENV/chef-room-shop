import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { ProductStatus } from '@prisma/client'

import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { getProducts } from '@/src/server/graphql/modules/catalog/catalog.service'
import {
  buildSticoDraftDescription,
  STICO_DRAFT_PRODUCT_SLUG,
  STICO_DRAFT_PRODUCT_TYPE_SLUG,
  STICO_DRAFT_SHORT_DESCRIPTION,
  STICO_INTENDED_COLOR_SLUG,
  STICO_INTENDED_VARIANT_SIZE_SLUGS,
} from '../../prisma/seed-stico-product'

describe('STICO draft product seed data', () => {
  it('uses shoes ProductType and DRAFT-safe defaults', () => {
    assert.equal(STICO_DRAFT_PRODUCT_SLUG, 'zapato-stico-real-safety')
    assert.equal(STICO_DRAFT_PRODUCT_TYPE_SLUG, 'shoes')
    assert.equal(STICO_INTENDED_COLOR_SLUG, 'black')
    assert.deepEqual(STICO_INTENDED_VARIANT_SIZE_SLUGS, [
      '22',
      '23',
      '24',
      '25',
      '26',
      '27',
      '28',
      '29',
      '30',
    ])
    assert.equal(STICO_INTENDED_VARIANT_SIZE_SLUGS.includes('22.5' as never), false)
  })

  it('builds description from confirmed specs only', () => {
    const description = buildSticoDraftDescription()

    assert.match(description, /90% EVA ARLON CX/)
    assert.match(description, /Plantilla antifatiga Hamble X/)
    assert.match(description, /Caucho Nanotech \+ cerámica/)
    assert.match(description, /KIFLT, SPIC, SATRA, OSHA/)
    assert.match(description, /Diseño cerrado de talón/)
    assert.equal(description.startsWith(STICO_DRAFT_SHORT_DESCRIPTION), true)
  })

  it('maps non-customizable shoe product without personalizable badge', () => {
    const product = {
      id: 'p-stico',
      slug: STICO_DRAFT_PRODUCT_SLUG,
      name: 'Zapato STICO Real Safety',
      shortDescription: STICO_DRAFT_SHORT_DESCRIPTION,
      basePriceCents: 0,
      currency: 'MXN',
      isCustomizable: false,
      status: 'DRAFT',
      productType: {
        id: 'type-shoes',
        slug: 'shoes',
        shopSlug: 'zapatos',
        name: 'Zapatos',
        nameEs: 'Zapatos',
      },
      images: [],
      variants: [],
    } satisfies CatalogProduct

    const card = mapCatalogProductToCard(product)
    assert.equal(card.customizable, false)
    assert.equal(card.badge, undefined)
    assert.equal(card.category, 'Zapatos')
  })
})

describe('catalog storefront product queries', () => {
  it('excludes DRAFT products from getProducts', async () => {
    const captured: { countWhere?: unknown; findWhere?: unknown } = {}

    const prisma = {
      product: {
        count: async ({ where }: { where: unknown }) => {
          captured.countWhere = where
          return 0
        },
        findMany: async ({ where }: { where: unknown }) => {
          captured.findWhere = where
          return []
        },
      },
    }

    await getProducts(prisma as never)

    assert.deepEqual(captured.countWhere, {
      status: ProductStatus.ACTIVE,
      deletedAt: null,
    })
    assert.deepEqual(captured.findWhere, captured.countWhere)
  })
})
