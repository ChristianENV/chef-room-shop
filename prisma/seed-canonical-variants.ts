import type { CanonicalProductVariantSeed } from './seed-canonical-products.data'

export function variantMatrixKey(colorSlug: string, sizeSlug: string): string {
  return `${colorSlug}:${sizeSlug}`
}

/**
 * Deterministic internal SKU: CR-{PRODUCT_CODE}-{COLOR}-{SIZE}
 * e.g. CR-FILIPINACLASICA-BLACK-XS
 */
export function buildCanonicalVariantSku(
  productCode: string,
  colorSlug: string,
  sizeSlug: string,
): string {
  const color = colorSlug.toUpperCase().replace(/-/g, '')
  const size = sizeSlug.toUpperCase()
  return `CR-${productCode}-${color}-${size}`
}

type BuildVariantMatrixOptions = {
  productCode: string
  basePriceCents: number
  colorSlugs: readonly string[]
  sizeSlugs: readonly string[]
  /** Existing DB/export variants preserved by color×size key. */
  preserved?: readonly CanonicalProductVariantSeed[]
}

/**
 * Builds a complete color×size variant matrix.
 * Preserves existing SKU/price/stock when a matching color×size exists.
 * New combinations use basePriceCents and stockQty 0.
 */
export function buildVariantMatrix(
  options: BuildVariantMatrixOptions,
): CanonicalProductVariantSeed[] {
  const preservedByKey = new Map<string, CanonicalProductVariantSeed>()
  for (const variant of options.preserved ?? []) {
    preservedByKey.set(variantMatrixKey(variant.colorSlug, variant.sizeSlug), variant)
  }

  const variants: CanonicalProductVariantSeed[] = []

  for (const colorSlug of options.colorSlugs) {
    for (const sizeSlug of options.sizeSlugs) {
      const key = variantMatrixKey(colorSlug, sizeSlug)
      const existing = preservedByKey.get(key)
      if (existing) {
        variants.push(existing)
        continue
      }

      variants.push({
        sku: buildCanonicalVariantSku(options.productCode, colorSlug, sizeSlug),
        stockQty: 0,
        priceCents: options.basePriceCents,
        colorSlug,
        sizeSlug,
      })
    }
  }

  return variants
}

export function assertUniqueVariantMatrix(variants: CanonicalProductVariantSeed[]): void {
  const keys = new Set<string>()
  const skus = new Set<string>()

  for (const variant of variants) {
    const key = variantMatrixKey(variant.colorSlug, variant.sizeSlug)
    if (keys.has(key)) {
      throw new Error(`Duplicate color×size variant: ${key}`)
    }
    keys.add(key)

    if (skus.has(variant.sku)) {
      throw new Error(`Duplicate variant SKU: ${variant.sku}`)
    }
    skus.add(variant.sku)
  }
}
