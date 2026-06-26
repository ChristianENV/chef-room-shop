import type { Metadata } from 'next'

import { routes } from '@/src/config/routes'
import { resolveProductOgImageUrl } from '@/src/lib/product-seo-image'

const SITE_ORIGIN = 'https://chefroom.mx'

export type ProductPageMetadataInput = {
  slug: string
  name: string
  shortDescription?: string | null
  description?: string | null
  seoTitle?: string | null
  seoDescription?: string | null
  seoImageId?: string | null
  images: Array<{
    id: string
    url: string
    isPrimary: boolean
    sortOrder: number
  }>
}

/**
 * Builds Next.js metadata for a storefront product detail page.
 */
export function buildProductPageMetadata(product: ProductPageMetadataInput): Metadata {
  const title = product.seoTitle?.trim() || product.name
  const description =
    product.seoDescription?.trim() ||
    product.shortDescription?.trim() ||
    product.description?.trim() ||
    undefined
  const ogImageUrl = resolveProductOgImageUrl(product.images, product.seoImageId)
  const canonical = `${SITE_ORIGIN}${routes.productDetail(product.slug)}`

  const openGraphImages = ogImageUrl ? [{ url: ogImageUrl, alt: title }] : undefined

  return {
    title,
    description,
    alternates: { canonical },
    openGraph: {
      title,
      description,
      type: 'website',
      url: canonical,
      images: openGraphImages,
    },
    twitter: {
      card: ogImageUrl ? 'summary_large_image' : 'summary',
      title,
      description,
      images: ogImageUrl ? [ogImageUrl] : undefined,
    },
  }
}
