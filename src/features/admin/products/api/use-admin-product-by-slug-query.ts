'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProductBySlug } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

export function useAdminProductBySlugQuery(slug: string, enabled = true) {
  return useQuery({
    queryKey: adminProductsQueryKeys.bySlug(slug),
    queryFn: () => getAdminProductBySlug(slug),
    enabled: enabled && slug.length > 0,
  })
}
