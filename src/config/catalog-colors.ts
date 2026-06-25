/**
 * Shared catalog color rules for sellable product variants (no Prisma schema dependency).
 * Used by seeds, tests, and future Admin/catalog enforcement.
 */

export const PRODUCT_TYPE_VARIANT_COLOR_SLUGS = {
  'chef-jacket': ['black', 'white', 'chef-blue', 'warm-gray'],
  apron: ['black', 'white'],
  pants: ['black'],
  shoes: ['black'],
} as const

export type ProductTypeVariantColorSlugMap = typeof PRODUCT_TYPE_VARIANT_COLOR_SLUGS

export type CatalogProductTypeSlug = keyof ProductTypeVariantColorSlugMap

export type CatalogColorSlug = ProductTypeVariantColorSlugMap[CatalogProductTypeSlug][number]

const CATALOG_COLOR_SLUG_SET = new Set<string>(
  Object.values(PRODUCT_TYPE_VARIANT_COLOR_SLUGS).flat(),
)

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-')
}

/**
 * All distinct catalog color slugs referenced by variant rules (DB Color table subset).
 */
export function getAllCatalogColorSlugs(): readonly CatalogColorSlug[] {
  return Array.from(CATALOG_COLOR_SLUG_SET) as CatalogColorSlug[]
}

export function isKnownCatalogColorSlug(colorSlug: string): colorSlug is CatalogColorSlug {
  return CATALOG_COLOR_SLUG_SET.has(normalizeSlug(colorSlug))
}

/**
 * Allowed sellable variant colors for a product type. Unknown types return [].
 */
export function getAllowedVariantColorSlugsForProductType(
  productTypeSlug: string,
): readonly string[] {
  const normalized = normalizeSlug(productTypeSlug)
  const allowed = PRODUCT_TYPE_VARIANT_COLOR_SLUGS[normalized as CatalogProductTypeSlug]
  return allowed ? [...allowed] : []
}

export function isVariantColorAllowedForProductType(params: {
  productTypeSlug: string
  colorSlug: string
}): boolean {
  const colorSlug = normalizeSlug(params.colorSlug)
  const allowed = getAllowedVariantColorSlugsForProductType(params.productTypeSlug)
  return allowed.includes(colorSlug)
}
