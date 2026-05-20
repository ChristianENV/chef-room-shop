import { mapCatalogProductToDetail } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import type { Product } from '@/lib/types'

import type { ProductDetail } from '../types'

/**
 * Maps product detail BFF payload to the legacy storefront `Product` UI model.
 */
export function mapProductDetailToUi(product: ProductDetail): Product {
  return mapCatalogProductToDetail(product)
}
