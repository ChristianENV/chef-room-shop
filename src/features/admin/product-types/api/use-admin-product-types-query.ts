'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminProductTypes } from './admin-product-types.api'
import { adminProductTypesQueryKeys } from './admin-product-types.query-keys'
import type { AdminProductTypesListVariables } from '../types'

export function useAdminProductTypesQuery(
  variables?: AdminProductTypesListVariables,
  queryOptions?: { enabled?: boolean },
) {
  return useQuery({
    queryKey: adminProductTypesQueryKeys.list(variables),
    queryFn: () => getAdminProductTypes(variables),
    enabled: queryOptions?.enabled ?? true,
  })
}
