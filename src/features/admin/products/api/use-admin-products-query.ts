'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProducts } from './admin-products.api'
import { adminProductsQueryKeys } from './admin-products.query-keys'
import type { AdminProductsListVariables } from '../types'

export function useAdminProductsQuery(variables?: AdminProductsListVariables) {
  return useQuery({
    queryKey: adminProductsQueryKeys.list(variables),
    queryFn: () => getAdminProducts(variables),
  })
}
