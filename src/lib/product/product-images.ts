import type { ProductImage } from '@/lib/types'

export type ProductImageLike = {
  url?: string | null
  thumbnailUrl?: string | null
  imageUrl?: string | null
  publicId?: string | null
  alt?: string | null
  isPrimary?: boolean
  sortOrder?: number | null
}

/**
 * Resolves a thumbnail-friendly URL (prefers dedicated thumb, then full URL).
 */
export function getProductImageUrl(image: ProductImageLike | null | undefined): string | null {
  if (!image) return null
  const thumb = image.thumbnailUrl?.trim()
  if (thumb) return thumb
  const url = image.url?.trim()
  if (url) return url
  const imageUrl = image.imageUrl?.trim()
  if (imageUrl) return imageUrl
  return resolveUrlFromPublicId(image.publicId)
}

/**
 * Resolves the main display URL (full size preferred).
 */
export function getProductMainImageUrl(image: ProductImageLike | null | undefined): string | null {
  if (!image) return null
  const url = image.url?.trim()
  if (url) return url
  const imageUrl = image.imageUrl?.trim()
  if (imageUrl) return imageUrl
  const thumb = image.thumbnailUrl?.trim()
  if (thumb) return thumb
  return resolveUrlFromPublicId(image.publicId)
}

function resolveUrlFromPublicId(publicId: string | null | undefined): string | null {
  const key = publicId?.trim()
  if (!key) return null
  const base = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL?.trim()
  if (!base) return null
  return `${base.replace(/\/$/, '')}/${key.replace(/^\//, '')}`
}

function compareProductImages(a: ProductImage, b: ProductImage): number {
  if (a.isPrimary !== b.isPrimary) return a.isPrimary ? -1 : 1
  const orderA = a.sortOrder ?? Number.MAX_SAFE_INTEGER
  const orderB = b.sortOrder ?? Number.MAX_SAFE_INTEGER
  if (orderA !== orderB) return orderA - orderB
  return a.id.localeCompare(b.id)
}

/**
 * Returns the primary catalog image, or the first image with a resolvable URL.
 */
export function getPrimaryProductImage(
  images: ProductImage[] | undefined | null,
): ProductImage | null {
  const visible = getVisibleProductImages(images)
  if (visible.length === 0) return null
  return visible.find((img) => img.isPrimary) ?? visible[0]
}

/**
 * Resolves the display URL for a product card or gallery hero.
 */
export function getPrimaryProductImageUrl(
  images: ProductImage[] | undefined | null,
): string | null {
  const image = getPrimaryProductImage(images)
  return image ? getProductMainImageUrl(image) : null
}

/**
 * Filters images with a usable URL, sorted primary first then sortOrder.
 */
export function getVisibleProductImages(images: ProductImage[] | undefined | null): ProductImage[] {
  if (!images?.length) return []
  return [...images]
    .filter((img) => Boolean(getProductMainImageUrl(img)))
    .sort(compareProductImages)
}
