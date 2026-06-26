import { getProductTypePublicSlug } from '@/src/features/storefront/catalog/product-type.helpers'
import type { CatalogProductType } from '@/src/features/storefront/catalog/types'

import { LANDING_MEDIA, type LandingMediaKey } from './landing-media'

export type LandingCategoryCardImageSource = 'database' | 'static' | 'fallback'

export type ResolvedLandingCategoryCardImage = {
  src: string | null
  alt: string
  source: LandingCategoryCardImageSource
}

const LANDING_MEDIA_BY_PUBLIC_SLUG: Partial<Record<string, LandingMediaKey>> = {
  filipinas: 'categoryFilipinas',
  mandiles: 'categoryMandiles',
  pantalones: 'categoryPantalones',
}

export type LandingCategoryImageInput = Pick<
  CatalogProductType,
  'shopSlug' | 'slug' | 'name' | 'nameEs' | 'cardImageUrl' | 'cardImageAlt'
>

/**
 * Resolves the image shown on a landing category card.
 * Priority: ProductType.cardImageUrl → static landing asset → fallback visual.
 */
export function resolveLandingCategoryCardImage(
  type: LandingCategoryImageInput,
  title: string,
): ResolvedLandingCategoryCardImage {
  const dbUrl = type.cardImageUrl?.trim()
  if (dbUrl) {
    return {
      src: dbUrl,
      alt: type.cardImageAlt?.trim() || title,
      source: 'database',
    }
  }

  const publicSlug = getProductTypePublicSlug(type)
  const mediaKey = LANDING_MEDIA_BY_PUBLIC_SLUG[publicSlug]
  const staticAsset = mediaKey ? LANDING_MEDIA[mediaKey] : null
  const staticSrc = staticAsset?.src?.trim()

  if (staticSrc) {
    return {
      src: staticSrc,
      alt: staticAsset?.alt || title,
      source: 'static',
    }
  }

  return {
    src: null,
    alt: title,
    source: 'fallback',
  }
}
