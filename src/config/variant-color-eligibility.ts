import { getAllowedVariantColorSlugsForProductType } from './catalog-colors'

export type VariantColorEligibilityInput = {
  slug: string
  name: string
  hexCode: string
  isFabricColor: boolean
  isProductColor: boolean
  isActive?: boolean
}

const HEX_PATTERN = /^#[0-9A-Fa-f]{6}$/

function normalizeSlug(value: string): string {
  return value.trim().toLowerCase().replace(/_/g, '-')
}

export function isValidVariantColorRecord(
  color: Pick<VariantColorEligibilityInput, 'slug' | 'name' | 'hexCode'>,
): boolean {
  const slug = normalizeSlug(color.slug)
  const name = color.name?.trim()
  const hex = color.hexCode?.trim()

  if (!slug || !name || !hex) return false
  return HEX_PATTERN.test(hex)
}

export function isChefJacketProductType(productTypeSlug: string): boolean {
  return normalizeSlug(productTypeSlug) === 'chef-jacket'
}

/**
 * ProductType-aware variant color eligibility.
 * Chef-jacket / Filipinas: active fabric colors + explicit allowed product colors.
 * Other types: allowed slugs from PRODUCT_TYPE_VARIANT_COLOR_SLUGS with isProductColor only.
 */
export function isVariantColorEligibleForProductType(params: {
  productTypeSlug: string
  color: VariantColorEligibilityInput
}): boolean {
  const productTypeSlug = normalizeSlug(params.productTypeSlug)
  const colorSlug = normalizeSlug(params.color.slug)

  if (params.color.isActive === false) return false
  if (!isValidVariantColorRecord(params.color)) return false

  if (isChefJacketProductType(productTypeSlug)) {
    if (params.color.isFabricColor) return true

    const allowed = getAllowedVariantColorSlugsForProductType(productTypeSlug)
    return params.color.isProductColor && allowed.includes(colorSlug)
  }

  const allowed = getAllowedVariantColorSlugsForProductType(productTypeSlug)
  if (!allowed.includes(colorSlug)) return false

  return params.color.isProductColor === true
}
