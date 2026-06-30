import type { Product } from '@/lib/types'
import { centsToPesos } from '@/src/lib/formatters'
import { getProductMainImageUrl } from '@/src/lib/product/product-images'

import type { ProductVariantOption } from '@/src/features/storefront/products/types'

import { getProductTypeDisplayName, getProductTypePublicSlug } from '../product-type.helpers'
import type { CatalogProduct, CatalogProductVariant } from '../types'

const DEFAULT_RATING = 4.8

function mapImages(images: CatalogProduct['images']): Product['images'] {
  if (images.length === 0) return []

  return images
    .map((image) => {
      const mapped = {
        id: image.id,
        url: image.url?.trim() ?? '',
        alt: image.alt ?? '',
        isPrimary: image.isPrimary,
        sortOrder: image.sortOrder ?? null,
        publicId: image.publicId ?? null,
      }
      const resolved = getProductMainImageUrl(mapped)
      if (resolved) mapped.url = resolved
      return mapped
    })
    .filter((image) => Boolean(image.url?.trim()))
}

function uniqueColorsFromVariants(variants: CatalogProductVariant[]): Product['colors'] {
  const bySlug = new Map<string, Product['colors'][number]>()

  for (const variant of variants) {
    if (!variant.color || !variant.isActive) continue
    bySlug.set(variant.color.slug, {
      id: variant.color.slug,
      name: variant.color.name,
      hex: variant.color.hexCode,
      available: (variant.stockQty ?? 0) > 0,
    })
  }

  return Array.from(bySlug.values())
}

function uniqueSizesFromVariants(variants: CatalogProductVariant[]): string[] {
  const sizes = new Set<string>()
  for (const variant of variants) {
    if (!variant.size || !variant.isActive) continue
    sizes.add(variant.size.name.toUpperCase())
  }
  return Array.from(sizes).sort()
}

function totalStock(variants: CatalogProductVariant[]): number {
  return variants.filter((v) => v.isActive).reduce((sum, v) => sum + (v.stockQty ?? 0), 0)
}

/**
 * Maps BFF variants to PDP cart selection options.
 */
export function mapVariantsForCart(variants: CatalogProductVariant[]): ProductVariantOption[] {
  return variants
    .filter((variant) => variant.isActive && variant.color && variant.size)
    .map((variant) => ({
      id: variant.id,
      colorSlug: variant.color!.slug,
      sizeName: variant.size!.name.toUpperCase(),
      stockQty: variant.stockQty ?? 0,
      isActive: variant.isActive,
      priceCents: variant.priceCents,
    }))
}

/**
 * Maps a catalog BFF product to the legacy `Product` shape used by storefront cards.
 */
export function mapCatalogProductToCard(product: CatalogProduct): Product {
  const activeVariants = product.variants.filter((v) => v.isActive)

  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    category: getProductTypeDisplayName(product.productType),
    productTypeSlug: product.productType.slug,
    categoryShopSlug: getProductTypePublicSlug(product.productType),
    price: centsToPesos(product.basePriceCents),
    description: product.shortDescription ?? product.name,
    shortDescription: product.shortDescription ?? '',
    images: mapImages(product.images),
    colors: uniqueColorsFromVariants(activeVariants),
    sizes: uniqueSizesFromVariants(activeVariants),
    customizable: product.isCustomizable,
    badge: product.isCustomizable ? 'personalizable' : undefined,
    stock: totalStock(activeVariants),
    rating: DEFAULT_RATING,
    reviewCount: 0,
  }
}

/**
 * Maps a catalog BFF product to the legacy `Product` shape for product detail UI.
 */
export function mapCatalogProductToDetail(
  product: CatalogProduct & { description?: string | null },
): Product & { variants: ProductVariantOption[] } {
  const card = mapCatalogProductToCard(product)
  return {
    ...card,
    description: product.description ?? product.shortDescription ?? product.name,
    variants: mapVariantsForCart(product.variants),
  }
}
