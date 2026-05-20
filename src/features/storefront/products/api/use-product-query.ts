'use client'

import { useQuery } from '@tanstack/react-query'

import { getProductBySlug } from './products.api'
import { productQueryKeys } from './products.query-keys'

/**
 * Fetches a single product detail by slug from the BFF.
 */
export function useProductQuery(slug: string) {
  return useQuery({
    queryKey: productQueryKeys.detail(slug),
    queryFn: () => getProductBySlug(slug),
    enabled: Boolean(slug),
  })
}
