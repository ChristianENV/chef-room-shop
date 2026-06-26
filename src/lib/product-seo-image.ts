export type ProductImageRef = {
  id: string
  url: string
  isPrimary: boolean
  sortOrder: number
}

/**
 * Resolves the Open Graph / SEO image URL for a product.
 * Priority: explicit seoImageId → primary image → first by sortOrder.
 */
export function resolveProductOgImageUrl(
  images: readonly ProductImageRef[],
  seoImageId: string | null | undefined,
): string | null {
  if (seoImageId) {
    const seoImage = images.find((image) => image.id === seoImageId)
    if (seoImage?.url?.trim()) {
      return seoImage.url.trim()
    }
  }

  const primary = images.find((image) => image.isPrimary)
  if (primary?.url?.trim()) {
    return primary.url.trim()
  }

  const sorted = [...images].sort((a, b) => a.sortOrder - b.sortOrder)
  const first = sorted[0]
  return first?.url?.trim() ? first.url.trim() : null
}
