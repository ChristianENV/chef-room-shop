'use client'

import { useQuery } from '@tanstack/react-query'

import { getCatalogProducts } from './catalog.api'
import { catalogQueryKeys } from './catalog.query-keys'
import type { ProductsQueryParams } from './catalog-query.types'

/**
 * Fetches catalog products from the BFF with stable query keys.
 */
export function useProductsQuery(params: ProductsQueryParams) {
  return useQuery({
    queryKey: catalogQueryKeys.products(params),
    queryFn: () => getCatalogProducts(params),
  })
}
