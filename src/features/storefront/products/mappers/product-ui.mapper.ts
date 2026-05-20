import { mapCatalogProductToDetail } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'

import type { ProductDetail, StorefrontProductDetail } from '../types'

/**
 * Maps product detail BFF payload to the legacy storefront `Product` UI model with variants.
 */
export function mapProductDetailToUi(product: ProductDetail): StorefrontProductDetail {
  return mapCatalogProductToDetail(product)
}
