import type { Product, ProductCategory, ProductColor, ProductImage } from '@/lib/types'
import { centsToPesos } from '@/src/lib/formatters'

import type { ProductVariantOption } from '@/src/features/storefront/products/types'

import type { CatalogProduct, CatalogProductVariant } from '../types'

const PRODUCT_TYPE_TO_CATEGORY: Record<string, ProductCategory> = {
  'chef-jacket': 'filipinas',
  apron: 'mandiles',
  pants: 'pantalones',
}

const DEFAULT_RATING = 4.8

/**
 * Maps BFF product type slug to legacy storefront category id.
 */
export function mapProductTypeSlugToCategory(typeSlug: string): ProductCategory {
  return PRODUCT_TYPE_TO_CATEGORY[typeSlug] ?? 'filipinas'
}

/**
 * Maps legacy storefront category id to BFF product type slug.
 */
export function mapCategoryToProductTypeSlug(category: string): string | null {
  const entry = Object.entries(PRODUCT_TYPE_TO_CATEGORY).find(([, value]) => value === category)
  return entry?.[0] ?? null
}

function mapImages(images: CatalogProduct['images']): ProductImage[] {
  if (images.length === 0) {
    return [
      {
        id: 'placeholder',
        url: '',
        alt: '',
        isPrimary: true,
      },
    ]
  }

  return images.map((image) => ({
    id: image.id,
    url: image.url,
    alt: image.alt ?? '',
    isPrimary: image.isPrimary,
  }))
}

function uniqueColorsFromVariants(variants: CatalogProductVariant[]): ProductColor[] {
  const bySlug = new Map<string, ProductColor>()

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
  return variants
    .filter((v) => v.isActive)
    .reduce((sum, v) => sum + (v.stockQty ?? 0), 0)
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
    category: mapProductTypeSlugToCategory(product.productType.slug),
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
