import type { ProductType } from '@prisma/client'

import type { AdminProductTypeGql } from '../admin-products/admin-products.types'

export type ProductTypeCounts = {
  productCount: number
  activeProductCount: number
}

/**
 * Maps Prisma ProductType to admin GraphQL type with optional product counts.
 */
export function mapAdminProductTypeToGql(
  productType: ProductType,
  counts?: ProductTypeCounts,
): AdminProductTypeGql {
  return {
    id: productType.id,
    slug: productType.slug,
    shopSlug: productType.shopSlug,
    name: productType.nameEs,
    nameEs: productType.nameEs,
    nameEn: productType.nameEn,
    description: productType.description,
    sortOrder: productType.sortOrder,
    isActive: productType.isActive,
    showInNav: productType.showInNav,
    productCount: counts?.productCount ?? 0,
    activeProductCount: counts?.activeProductCount ?? 0,
    createdAt: productType.createdAt.toISOString(),
    updatedAt: productType.updatedAt.toISOString(),
  }
}
