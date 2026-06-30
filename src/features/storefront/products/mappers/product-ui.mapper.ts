import { mapCatalogProductToDetail } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'

import type { ProductDetail, StorefrontProductDetail } from '../types'

/**
 * Maps product detail BFF payload to the legacy storefront `Product` UI model with variants.
 */
export function mapProductDetailToUi(product: ProductDetail): StorefrontProductDetail {
  const base = mapCatalogProductToDetail(product)
  return {
    ...base,
    basePriceCents: product.basePriceCents,
    optionGroups: product.optionGroups ?? [],
  }
}
