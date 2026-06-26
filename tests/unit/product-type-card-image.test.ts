import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { GraphQLError } from 'graphql'

import { mapAdminProductTypeToGql } from '@/src/server/graphql/modules/admin-product-types/admin-product-types.mappers'
import { requireProductTypeCardImageUploadActor } from '@/src/server/graphql/modules/uploads/uploads.auth'
import type { GraphQLContext } from '@/src/server/graphql/context'
import { resolveLandingCategoryCardImage } from '@/src/features/storefront/landing/lib/landing-category-card-image'

const baseProductType = {
  id: '11111111-1111-4111-8111-111111111111',
  slug: 'chef-jacket',
  shopSlug: 'filipinas',
  nameEs: 'Filipinas',
  nameEn: 'Chef Jackets',
  description: 'Uniformes superiores',
  sortOrder: 10,
  isActive: true,
  showInNav: true,
  cardImageUrl: 'https://cdn.example/product-types/card.webp',
  cardImagePublicId: 'product-types/111/card/abc/image.webp',
  cardImageAlt: 'Filipina premium',
  cardImageThumbUrl: 'https://cdn.example/product-types/thumb.webp',
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
}

describe('admin product type card image mapper', () => {
  it('maps card image fields to admin GraphQL shape', () => {
    const mapped = mapAdminProductTypeToGql(baseProductType)

    assert.equal(mapped.cardImageUrl, baseProductType.cardImageUrl)
    assert.equal(mapped.cardImagePublicId, baseProductType.cardImagePublicId)
    assert.equal(mapped.cardImageAlt, 'Filipina premium')
    assert.equal(mapped.cardImageThumbUrl, baseProductType.cardImageThumbUrl)
  })
})

describe('landing category card image resolver', () => {
  const typeBase = {
    slug: 'chef-jacket',
    shopSlug: 'filipinas',
    name: 'Filipinas',
    nameEs: 'Filipinas',
  }

  it('prefers database image over static fallback', () => {
    const resolved = resolveLandingCategoryCardImage(
      {
        ...typeBase,
        cardImageUrl: 'https://cdn.example/db-card.webp',
        cardImageAlt: 'DB alt',
      },
      'Filipinas',
    )

    assert.equal(resolved.source, 'database')
    assert.equal(resolved.src, 'https://cdn.example/db-card.webp')
    assert.equal(resolved.alt, 'DB alt')
  })

  it('falls back to static landing asset when DB image is null', () => {
    const resolved = resolveLandingCategoryCardImage(
      {
        ...typeBase,
        cardImageUrl: null,
        cardImageAlt: null,
      },
      'Filipinas',
    )

    assert.equal(resolved.source, 'static')
    assert.ok(resolved.src?.includes('landing-category-filipina'))
    assert.ok(resolved.alt.length > 0)
  })

  it('uses premium fallback when no DB or static image exists', () => {
    const resolved = resolveLandingCategoryCardImage(
      {
        slug: 'shoes',
        shopSlug: 'zapatos',
        name: 'Zapatos',
        nameEs: 'Zapatos',
        cardImageUrl: null,
        cardImageAlt: null,
      },
      'Zapatos',
    )

    assert.equal(resolved.source, 'fallback')
    assert.equal(resolved.src, null)
  })
})

describe('product type card image upload auth', () => {
  it('requires admin access for category image uploads', () => {
    assert.throws(
      () =>
        requireProductTypeCardImageUploadActor({
          currentUser: null,
          prisma: {} as GraphQLContext['prisma'],
        } as GraphQLContext),
      (error: unknown) =>
        error instanceof GraphQLError && error.extensions?.code === 'UNAUTHENTICATED',
    )
  })
})
