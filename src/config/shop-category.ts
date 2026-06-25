import type { FilterState } from '@/src/features/storefront/catalog/catalog-filters'
import {
  getProductTypePublicSlug,
  parseShopCategoryParam,
  resolveProductTypeSlugFromPublicCategory,
  type StorefrontProductType,
} from '@/src/features/storefront/catalog/product-type.helpers'

import { routes, shopCategoryUrl } from '@/src/config/routes'

/** Public shop category slug from `/shop?category=` (dynamic ProductType.shopSlug or slug). */
export type ShopCategorySlug = string

/**
 * Validates and normalizes `?category=` from the shop URL.
 */
export function parseShopCategorySlug(value: string | null | undefined): ShopCategorySlug | null {
  return parseShopCategoryParam(value)
}

/**
 * Maps shop category query param to BFF `productTypeSlug`.
 */
export function shopCategoryToProductTypeSlug(
  category: ShopCategorySlug,
  productTypes: StorefrontProductType[],
): string | null {
  return resolveProductTypeSlugFromPublicCategory(category, productTypes)
}

/**
 * Builds filter state categories array from a shop category param.
 */
export function shopCategoryToFilterCategories(
  category: ShopCategorySlug | null,
  productTypes: StorefrontProductType[],
): string[] {
  if (!category) return []
  const productTypeSlug = shopCategoryToProductTypeSlug(category, productTypes)
  return productTypeSlug ? [productTypeSlug] : []
}

/**
 * Derives shop category param from a single selected product type slug.
 */
export function filterCategoriesToShopCategory(
  categories: string[],
  productTypes: StorefrontProductType[],
): ShopCategorySlug | null {
  if (categories.length !== 1) return null
  const productType = productTypes.find((type) => type.slug === categories[0])
  if (!productType) return null
  return getProductTypePublicSlug(productType)
}

/**
 * Resolves shop URL for current filter state (category param only when one type selected).
 */
export function shopUrlFromFilterState(
  filters: FilterState,
  productTypes: StorefrontProductType[],
): string {
  const category = filterCategoriesToShopCategory(filters.categories, productTypes)
  return category ? shopCategoryUrl(category) : routes.shop
}

/**
 * Shop URL for a product type row.
 */
export function shopUrlFromProductType(productType: StorefrontProductType): string {
  return shopCategoryUrl(getProductTypePublicSlug(productType))
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

/**
 * Shop URL for a mapped storefront product (uses categoryShopSlug when available).
 */
export function shopUrlFromProductCategory(product: {
  categoryShopSlug?: string | null
  productTypeSlug?: string | null
}): string {
  const slug = product.categoryShopSlug?.trim() || product.productTypeSlug?.trim()
  return slug ? shopCategoryUrl(slug) : routes.shop
}
