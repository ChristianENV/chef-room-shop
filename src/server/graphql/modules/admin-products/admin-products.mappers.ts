import type {
  Color,
  Product,
  ProductImage,
  ProductModelAsset,
  ProductType,
  ProductVariant,
  Size,
} from '@prisma/client'

import type {
  AdminColorGql,
  AdminProductGql,
  AdminProductImageGql,
  AdminProductModel3dGql,
  AdminProductTypeGql,
  AdminProductVariantGql,
  AdminSizeGql,
} from './admin-products.types'
import { mapProductModelAssetToGql } from './admin-products.model-3d.service'

export type AdminProductWithRelations = Product & {
  productType: ProductType
  images: ProductImage[]
  variants: (ProductVariant & { color: Color; size: Size })[]
  modelAssets?: ProductModelAsset[]
}

function toIso(date: Date | null | undefined): string | null {
  return date ? date.toISOString() : null
}

/**
 * Maps Prisma product type to admin GraphQL type.
 */
export function mapAdminProductTypeToGql(productType: ProductType): AdminProductTypeGql {
  return {
    id: productType.id,
    slug: productType.slug,
    name: productType.nameEs,
    description: productType.nameEn,
    sortOrder: productType.sortOrder,
    isActive: true,
  }
}

/**
 * Maps Prisma color to admin GraphQL type.
 */
export function mapAdminColorToGql(color: Color): AdminColorGql {
  return {
    id: color.id,
    name: color.name,
    slug: color.slug,
    hexCode: color.hex,
    isActive: true,
    sortOrder: null,
  }
}

/**
 * Maps Prisma size to admin GraphQL type.
 */
export function mapAdminSizeToGql(size: Size): AdminSizeGql {
  return {
    id: size.id,
    name: size.name,
    slug: size.slug,
    sortOrder: size.sortOrder,
    isActive: true,
  }
}

/**
 * Maps Prisma product image to admin GraphQL type.
 */
export function mapAdminProductImageToGql(image: ProductImage): AdminProductImageGql {
  return {
    id: image.id,
    url: image.url,
    publicId: image.publicId,
    alt: image.alt,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  }
}

/**
 * Maps Prisma variant with relations to admin GraphQL type.
 */
export function mapAdminProductVariantToGql(
  variant: ProductVariant & { color: Color; size: Size },
  productBasePriceCents: number,
  variantNameOverride?: string | null,
): AdminProductVariantGql {
  return {
    id: variant.id,
    sku: variant.sku,
    variantName:
      variantNameOverride?.trim() ||
      `${variant.color.name} / ${variant.size.name}`,
    priceCents: variant.priceCents ?? productBasePriceCents,
    stockQty: variant.stockQty,
    color: mapAdminColorToGql(variant.color),
    size: mapAdminSizeToGql(variant.size),
    isActive: variant.deletedAt === null,
    createdAt: variant.createdAt.toISOString(),
    updatedAt: variant.updatedAt.toISOString(),
  }
}

/**
 * Maps a full Prisma product graph to admin GraphQL product type.
 */
export function mapAdminProductToGql(product: AdminProductWithRelations): AdminProductGql {
  const activeModel = (product.modelAssets ?? []).find((a) => a.isActive && !a.deletedAt) ?? null
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    shortDescription: product.shortDescription,
    description: product.description,
    basePriceCents: product.basePriceCents,
    currency: 'MXN',
    customizable: product.customizable,
    status: product.status,
    seoTitle: product.seoTitle,
    seoDescription: product.seoDescription,
    deletedAt: toIso(product.deletedAt),
    createdAt: product.createdAt.toISOString(),
    updatedAt: product.updatedAt.toISOString(),
    productType: mapAdminProductTypeToGql(product.productType),
    images: product.images.map(mapAdminProductImageToGql),
    variants: product.variants.map((v) => mapAdminProductVariantToGql(v, product.basePriceCents)),
    model3d: activeModel ? mapProductModelAssetToGql(activeModel) : null,
  }
}
