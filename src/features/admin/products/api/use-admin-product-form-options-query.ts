'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProductFormOptions } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'

export function useAdminProductFormOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: adminProductsQueryKeys.formOptions(),
    queryFn: getAdminProductFormOptions,
    enabled,
  })
}
