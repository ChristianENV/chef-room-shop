import type { ProductImage } from '@/lib/types'

/**
 * Returns the primary catalog image, or the first image with a non-empty URL.
 */
export function getPrimaryProductImage(
  images: ProductImage[] | undefined | null,
): ProductImage | null {
  if (!images?.length) return null

  const primary = images.find((img) => img.isPrimary && img.url.trim())
  if (primary) return primary

  return images.find((img) => img.url.trim()) ?? null
}

/**
 * Resolves the display URL for a product card or gallery hero.
 */
export function getPrimaryProductImageUrl(
  images: ProductImage[] | undefined | null,
): string | null {
  const image = getPrimaryProductImage(images)
  const url = image?.url?.trim()
  return url ? url : null
}

/**
 * Filters images that have a usable URL, preserving order (primary first when sorted).
 */
export function getVisibleProductImages(
  images: ProductImage[] | undefined | null,
): ProductImage[] {
  if (!images?.length) return []
  return images.filter((img) => Boolean(img.url?.trim()))
}
