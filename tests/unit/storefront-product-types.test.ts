import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  filterCategoriesToShopCategory,
  parseShopCategorySlug,
  shopCategoryToFilterCategories,
  shopCategoryToProductTypeSlug,
} from '@/src/config/shop-category'
import { toCatalogFilterOptions } from '@/src/features/storefront/catalog/catalog-filter-options'
import { buildShopNavCategories } from '@/src/features/storefront/catalog/build-shop-nav-categories'
import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import {
  getNavProductTypes,
  getProductTypePublicSlug,
  resolveProductTypeSlugFromPublicCategory,
} from '@/src/features/storefront/catalog/product-type.helpers'
import type { CatalogFilters, CatalogProduct } from '@/src/features/storefront/catalog/types'

const PRODUCT_TYPES = [
  {
    id: '1',
    slug: 'chef-jacket',
    shopSlug: 'filipinas',
    name: 'Filipinas',
    nameEs: 'Filipinas',
    sortOrder: 1,
    isActive: true,
    showInNav: true,
  },
  {
    id: '2',
    slug: 'apron',
    shopSlug: 'mandiles',
    name: 'Mandiles',
    nameEs: 'Mandiles',
    sortOrder: 2,
    isActive: true,
    showInNav: true,
  },
  {
    id: '3',
    slug: 'pants',
    shopSlug: 'pantalones',
    name: 'Pantalones',
    nameEs: 'Pantalones',
    sortOrder: 3,
    isActive: true,
    showInNav: false,
  },
  {
    id: '4',
    slug: 'shoes',
    shopSlug: 'zapatos',
    name: 'Zapatos',
    nameEs: 'Zapatos',
    sortOrder: 4,
    isActive: true,
    showInNav: true,
  },
  {
    id: '5',
    slug: 'legacy',
    shopSlug: null,
    name: 'Legacy',
    nameEs: 'Legacy',
    sortOrder: 5,
    isActive: false,
    showInNav: true,
  },
] satisfies CatalogFilters['productTypes']

describe('storefront product type helpers', () => {
  it('maps public shop slug to internal product type slug', () => {
    assert.equal(resolveProductTypeSlugFromPublicCategory('zapatos', PRODUCT_TYPES), 'shoes')
    assert.equal(shopCategoryToProductTypeSlug('filipinas', PRODUCT_TYPES), 'chef-jacket')
  })

  it('falls back to slug when shopSlug is null', () => {
    const types = [
      {
        id: 'x',
        slug: 'only-slug',
        shopSlug: null,
        name: 'Only',
        nameEs: 'Only',
        isActive: true,
        showInNav: true,
      },
    ]
    assert.equal(getProductTypePublicSlug(types[0]!), 'only-slug')
    assert.equal(resolveProductTypeSlugFromPublicCategory('only-slug', types), 'only-slug')
  })

  it('does not fallback unknown categories to filipinas', () => {
    assert.equal(resolveProductTypeSlugFromPublicCategory('unknown-category', PRODUCT_TYPES), null)
    assert.deepEqual(shopCategoryToFilterCategories('unknown-category', PRODUCT_TYPES), [])
    assert.equal(shopCategoryToProductTypeSlug('unknown-category', PRODUCT_TYPES), null)
  })

  it('builds filter options from active product types with nameEs labels', () => {
    const options = toCatalogFilterOptions({
      productTypes: PRODUCT_TYPES,
      colors: [],
      sizes: [],
    })

    assert.deepEqual(
      options.productTypes.map((type) => type.label),
      ['Filipinas', 'Mandiles', 'Pantalones', 'Zapatos'],
    )
    assert.equal(
      options.productTypes.some((type) => type.publicSlug === 'zapatos'),
      true,
    )
    assert.equal(
      options.productTypes.some((type) => type.slug === 'legacy'),
      false,
    )
  })

  it('respects showInNav for navigation categories', () => {
    const nav = buildShopNavCategories(PRODUCT_TYPES)
    assert.deepEqual(
      nav.map((link) => link.label),
      ['Filipinas', 'Mandiles', 'Zapatos'],
    )
    assert.equal(
      nav.some((link) => link.href.includes('category=pantalones')),
      false,
    )
  })

  it('maps filter categories back to shop slug', () => {
    assert.equal(filterCategoriesToShopCategory(['shoes'], PRODUCT_TYPES), 'zapatos')
    assert.equal(filterCategoriesToShopCategory(['chef-jacket'], PRODUCT_TYPES), 'filipinas')
  })

  it('maps catalog product card category label from nameEs', () => {
    const product = {
      id: 'p1',
      slug: 'chef-shoe',
      name: 'Zapato Pro',
      basePriceCents: 100000,
      currency: 'MXN',
      isCustomizable: false,
      status: 'ACTIVE',
      productType: PRODUCT_TYPES[3]!,
      images: [],
      variants: [],
    } satisfies CatalogProduct

    const card = mapCatalogProductToCard(product)
    assert.equal(card.category, 'Zapatos')
    assert.equal(card.productTypeSlug, 'shoes')
    assert.equal(card.categoryShopSlug, 'zapatos')
  })

  it('parseShopCategorySlug normalizes query params', () => {
    assert.equal(parseShopCategorySlug(' Zapatos '), 'zapatos')
    assert.equal(parseShopCategorySlug(''), null)
  })

  it('getNavProductTypes excludes inactive categories', () => {
    assert.equal(
      getNavProductTypes(PRODUCT_TYPES).some((type) => type.slug === 'legacy'),
      false,
    )
  })
})
