import type { ProductVariantOption } from '../types'

/**
 * Finds an active variant matching color slug and size label (uppercase).
 */
export function findVariantByColorAndSize(
  variants: ProductVariantOption[],
  colorSlug: string,
  sizeName: string,
): ProductVariantOption | undefined {
  const normalizedSize = sizeName.trim().toUpperCase()
  return variants.find(
    (variant) =>
      variant.isActive &&
      variant.colorSlug === colorSlug &&
      variant.sizeName === normalizedSize,
  )
}

/**
 * Returns the sole variant when the product has exactly one active row.
 */
export function getSingleVariant(
  variants: ProductVariantOption[],
): ProductVariantOption | undefined {
  const active = variants.filter((variant) => variant.isActive)
  return active.length === 1 ? active[0] : undefined
}

/**
 * Size labels available for a color with stock &gt; 0.
 */
export function getAvailableSizesForColor(
  variants: ProductVariantOption[],
  colorSlug: string,
): string[] {
  const sizes = new Set<string>()
  for (const variant of variants) {
    if (
      variant.isActive &&
      variant.colorSlug === colorSlug &&
      variant.stockQty > 0
    ) {
      sizes.add(variant.sizeName)
    }
  }
  return Array.from(sizes).sort()
}

/**
 * Whether the product requires an explicit variant selection before add-to-cart.
 */
export function productRequiresVariantSelection(variants: ProductVariantOption[]): boolean {
  return variants.length > 0
}
