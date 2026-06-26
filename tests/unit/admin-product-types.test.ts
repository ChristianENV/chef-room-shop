import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  assertCanArchiveProductType,
  canArchiveProductType,
} from '@/src/server/graphql/modules/admin-product-types/admin-product-types.guards'
import { mapAdminProductTypeToGql } from '@/src/server/graphql/modules/admin-product-types/admin-product-types.mappers'
import {
  createAdminProductTypeInputSchema,
  KEBAB_CASE_SLUG_REGEX,
  updateAdminProductTypeInputSchema,
} from '@/src/server/graphql/modules/admin-product-types/admin-product-types.validation'

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
  createdAt: new Date('2026-01-01T00:00:00.000Z'),
  updatedAt: new Date('2026-01-02T00:00:00.000Z'),
}

describe('admin product types validation', () => {
  it('accepts valid kebab-case slug and shopSlug', () => {
    const parsed = createAdminProductTypeInputSchema.parse({
      slug: 'chef-jacket',
      shopSlug: 'filipinas',
      nameEs: 'Filipinas',
    })

    assert.equal(parsed.slug, 'chef-jacket')
    assert.equal(parsed.shopSlug, 'filipinas')
  })

  it('rejects uppercase or spaced slug values', () => {
    assert.throws(() =>
      createAdminProductTypeInputSchema.parse({
        slug: 'Chef-Jacket',
        nameEs: 'Filipinas',
      }),
    )

    assert.throws(() =>
      createAdminProductTypeInputSchema.parse({
        slug: 'chef jacket',
        nameEs: 'Filipinas',
      }),
    )

    assert.equal(KEBAB_CASE_SLUG_REGEX.test('chef-jacket'), true)
    assert.equal(KEBAB_CASE_SLUG_REGEX.test('shoes'), true)
    assert.equal(KEBAB_CASE_SLUG_REGEX.test('Chef-Jacket'), false)
  })

  it('rejects invalid shopSlug format when provided', () => {
    assert.throws(() =>
      createAdminProductTypeInputSchema.parse({
        slug: 'shoes',
        shopSlug: 'Zapatos',
        nameEs: 'Zapatos',
      }),
    )
  })

  it('requires nameEs on create', () => {
    assert.throws(() =>
      createAdminProductTypeInputSchema.parse({
        slug: 'apron',
        nameEs: '   ',
      }),
    )
  })

  it('requires at least one field on update', () => {
    assert.throws(() => updateAdminProductTypeInputSchema.parse({}))
  })

  it('accepts partial update with toggles', () => {
    const parsed = updateAdminProductTypeInputSchema.parse({
      isActive: false,
      showInNav: false,
    })

    assert.equal(parsed.isActive, false)
    assert.equal(parsed.showInNav, false)
  })
})

describe('admin product types mapper', () => {
  it('maps product counts when provided', () => {
    const mapped = mapAdminProductTypeToGql(baseProductType, {
      productCount: 5,
      activeProductCount: 2,
    })

    assert.equal(mapped.productCount, 5)
    assert.equal(mapped.activeProductCount, 2)
    assert.equal(mapped.name, 'Filipinas')
    assert.equal(mapped.nameEs, 'Filipinas')
    assert.equal(mapped.shopSlug, 'filipinas')
    assert.equal(mapped.description, 'Uniformes superiores')
  })

  it('defaults product counts to zero', () => {
    const mapped = mapAdminProductTypeToGql(baseProductType)

    assert.equal(mapped.productCount, 0)
    assert.equal(mapped.activeProductCount, 0)
    assert.equal(mapped.isActive, true)
    assert.equal(mapped.showInNav, true)
  })
})

describe('admin product types archive guard', () => {
  it('allows archive when there are no active products', () => {
    assert.equal(canArchiveProductType(0), true)
    assert.doesNotThrow(() => assertCanArchiveProductType(0))
  })

  it('blocks archive when active products exist', () => {
    assert.equal(canArchiveProductType(1), false)
    assert.throws(() => assertCanArchiveProductType(3), /productos activos/)
  })
})
