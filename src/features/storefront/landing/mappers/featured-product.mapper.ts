import type { ProductBadgeType } from '@/lib/types'
import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'
import { getPrimaryProductImageUrl } from '@/src/lib/product/product-images'
import { routes } from '@/src/config/routes'

import type { CatalogProduct } from '@/src/features/storefront/catalog/types'

/** Display rating for featured landing cards (social proof). */
export const FEATURED_PRODUCT_RATING = 4.8
export const FEATURED_PRODUCT_REVIEW_COUNT = 5

export type FeaturedProductCardUi = {
  id: string
  title: string
  href: string
  customizeHref: string
  categoryLabel: string
  priceLabel: string
  compareAtPriceLabel?: string
  imageUrl: string | null
  alt: string
  rating?: number
  reviewCount?: number
  badge?: ProductBadgeType
  customizable: boolean
  colorSwatches: { id: string; hex: string; name: string }[]
}

function uniqueColorSwatches(product: CatalogProduct) {
  const bySlug = new Map<string, { id: string; hex: string; name: string }>()
  for (const variant of product.variants) {
    if (!variant.isActive || !variant.color) continue
    bySlug.set(variant.color.slug, {
      id: variant.color.slug,
      hex: variant.color.hexCode,
      name: variant.color.name,
    })
  }
  return Array.from(bySlug.values())
}

function resolveBadge(product: CatalogProduct): ProductBadgeType | undefined {
  if (product.isCustomizable) return 'personalizable'
  return undefined
}

function resolveComparePrice(product: CatalogProduct): string | undefined {
  const activePrices = product.variants
    .filter((v) => v.isActive && v.priceCents > product.basePriceCents)
    .map((v) => v.priceCents)
  if (activePrices.length === 0) return undefined
  const minHigher = Math.min(...activePrices)
  return formatCurrencyMXN(centsToPesos(minHigher))
}

/**
 * Maps a catalog BFF product to the landing featured card UI model.
 */
export function mapCatalogProductToFeaturedCard(product: CatalogProduct): FeaturedProductCardUi {
  const pricePesos = centsToPesos(product.basePriceCents)
  const priceLabel = product.basePriceCents > 0 ? formatCurrencyMXN(pricePesos) : 'Consultar precio'

  return {
    id: product.id,
    title: product.name,
    href: routes.productDetail(product.slug),
    customizeHref: routes.customizeProduct(product.slug),
    categoryLabel: product.productType.name,
    priceLabel,
    compareAtPriceLabel: resolveComparePrice(product),
    imageUrl: getPrimaryProductImageUrl(
      product.images.map((img) => ({
        id: img.id,
        url: img.url,
        publicId: img.publicId ?? null,
        alt: img.alt ?? product.name,
        isPrimary: img.isPrimary,
        sortOrder: img.sortOrder ?? null,
      })),
    ),
    alt: product.images.find((img) => img.isPrimary)?.alt ?? product.name,
    rating: FEATURED_PRODUCT_RATING,
    reviewCount: FEATURED_PRODUCT_REVIEW_COUNT,
    customizable: product.isCustomizable,
    badge: resolveBadge(product),
    colorSwatches: uniqueColorSwatches(product),
  }
}
