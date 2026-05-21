'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProductById } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

export function useAdminProductByIdQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: adminProductsQueryKeys.detail(id),
    queryFn: () => getAdminProductById(id),
    enabled: enabled && id.length > 0,
  })
}
