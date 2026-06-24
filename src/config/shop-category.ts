import type { ProductCategory } from '@/lib/types'
import type { FilterState } from '@/src/features/storefront/catalog/catalog-filters'
import { mapCategoryToProductTypeSlug } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'

import { routes, shopCategoryUrl } from './routes'

export const SHOP_CATEGORY_SLUGS = ['filipinas', 'mandiles', 'pantalones'] as const

export type ShopCategorySlug = (typeof SHOP_CATEGORY_SLUGS)[number]

/**
 * Validates `?category=` from the shop URL.
 */
export function parseShopCategorySlug(value: string | null | undefined): ShopCategorySlug | null {
  if (!value) return null
  const normalized = value.trim().toLowerCase()
  return SHOP_CATEGORY_SLUGS.includes(normalized as ShopCategorySlug)
    ? (normalized as ShopCategorySlug)
    : null
}

/**
 * Maps shop category query param to BFF `productTypeSlug`.
 */
export function shopCategoryToProductTypeSlug(category: ShopCategorySlug): string {
  const slug = mapCategoryToProductTypeSlug(category)
  return slug ?? 'chef-jacket'
}

/**
 * Builds filter state categories array from a shop category param.
 */
export function shopCategoryToFilterCategories(category: ShopCategorySlug | null): string[] {
  if (!category) return []
  const productTypeSlug = shopCategoryToProductTypeSlug(category)
  return productTypeSlug ? [productTypeSlug] : []
}

/**
 * Derives shop category param from a single selected product type slug.
 */
export function filterCategoriesToShopCategory(categories: string[]): ShopCategorySlug | null {
  if (categories.length !== 1) return null
  const productTypeSlug = categories[0]
  for (const shopCategory of SHOP_CATEGORY_SLUGS) {
    if (shopCategoryToProductTypeSlug(shopCategory) === productTypeSlug) {
      return shopCategory
    }
  }
  return null
}

/**
 * Resolves shop URL for current filter state (category param only when one type selected).
 */
export function shopUrlFromFilterState(filters: FilterState): string {
  const category = filterCategoriesToShopCategory(filters.categories)
  return category ? shopCategoryUrl(category) : routes.shop
}

/**
 * Shop URL for a legacy product category id (falls back to `/shop` for accesorios).
 */
export function shopUrlFromProductCategory(category: ProductCategory): string {
  const slug = parseShopCategorySlug(category)
  return slug ? shopCategoryUrl(slug) : routes.shop
}

export type SearchParamsLike = {
  get(name: string): string | null
}

export const EMPTY_SEARCH_PARAMS: SearchParamsLike = {
  get: () => null,
}

/**
 * Whether a shop nav href matches the current pathname + query.
 */
export function isShopNavHrefActive(
  pathname: string,
  searchParams: SearchParamsLike,
  href: string,
): boolean {
  if (pathname !== routes.shop) return false

  try {
    const url = new URL(href, 'http://localhost')
    const hrefCategory = parseShopCategorySlug(url.searchParams.get('category'))
    const currentCategory = parseShopCategorySlug(searchParams.get('category'))

    if (!hrefCategory) {
      return currentCategory === null
    }

    return currentCategory === hrefCategory
  } catch {
    return false
  }
}
