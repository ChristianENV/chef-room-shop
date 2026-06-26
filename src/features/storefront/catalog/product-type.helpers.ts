import type { CatalogProductType } from './types'

export type StorefrontProductType = Pick<
  CatalogProductType,
  | 'id'
  | 'slug'
  | 'shopSlug'
  | 'name'
  | 'nameEs'
  | 'description'
  | 'sortOrder'
  | 'isActive'
  | 'showInNav'
>

function compareSortOrder(a: number | null | undefined, b: number | null | undefined): number {
  return (a ?? 0) - (b ?? 0)
}

/**
 * Public shop category slug used in `/shop?category=...`.
 */
export function getProductTypePublicSlug(
  type: Pick<StorefrontProductType, 'shopSlug' | 'slug'>,
): string {
  return type.shopSlug?.trim() || type.slug
}

/**
 * Spanish label for storefront display (prefers nameEs).
 */
export function getProductTypeDisplayName(
  type: Pick<StorefrontProductType, 'nameEs' | 'name'>,
): string {
  return type.nameEs?.trim() || type.name?.trim() || ''
}

export function parseShopCategoryParam(value: string | null | undefined): string | null {
  if (!value?.trim()) return null
  return value.trim().toLowerCase()
}

/**
 * Resolves a public category param to a ProductType row.
 */
export function resolveProductTypeByPublicSlug(
  publicSlug: string,
  productTypes: StorefrontProductType[],
): StorefrontProductType | null {
  const normalized = publicSlug.trim().toLowerCase()
  return (
    productTypes.find((type) => getProductTypePublicSlug(type).toLowerCase() === normalized) ??
    productTypes.find((type) => type.slug.toLowerCase() === normalized) ??
    null
  )
}

/**
 * Maps `/shop?category=` to internal ProductType.slug for BFF filters.
 */
export function resolveProductTypeSlugFromPublicCategory(
  publicSlug: string,
  productTypes: StorefrontProductType[],
): string | null {
  return resolveProductTypeByPublicSlug(publicSlug, productTypes)?.slug ?? null
}

export function isKnownShopCategoryParam(
  publicSlug: string | null,
  productTypes: StorefrontProductType[],
): boolean {
  if (!publicSlug) return false
  return resolveProductTypeByPublicSlug(publicSlug, productTypes) !== null
}

export function getActiveProductTypes(
  productTypes: StorefrontProductType[],
): StorefrontProductType[] {
  return productTypes
    .filter((type) => type.isActive)
    .sort((a, b) => compareSortOrder(a.sortOrder, b.sortOrder))
}

export function getNavProductTypes(productTypes: StorefrontProductType[]): StorefrontProductType[] {
  return getActiveProductTypes(productTypes).filter((type) => type.showInNav)
}
