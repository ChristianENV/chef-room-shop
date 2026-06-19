import type { CatalogProduct } from '@/src/features/storefront/catalog/types'

const DEFAULT_GARMENT_TYPE_SLUGS = ['chef-jacket', 'filipina', 'chef-jackets'] as const

/**
 * Picks the default customizable product for /customize.
 * Prefers an active chef-jacket (filipina), then any customizable product.
 */
export function pickDefaultCustomizableProduct(products: CatalogProduct[]): CatalogProduct | null {
  const activeCustomizable = products.filter(
    (product) => product.isCustomizable && product.status === 'ACTIVE',
  )

  if (activeCustomizable.length === 0) return null

  const chefJacket =
    activeCustomizable.find((product) =>
      DEFAULT_GARMENT_TYPE_SLUGS.includes(
        product.productType.slug as (typeof DEFAULT_GARMENT_TYPE_SLUGS)[number],
      ),
    ) ?? null

  return chefJacket ?? activeCustomizable[0] ?? null
}
