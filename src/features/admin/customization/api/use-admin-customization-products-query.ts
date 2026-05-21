'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationProducts } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { AdminCustomizationProductsVariables } from '../types'

export function useAdminCustomizationProductsQuery(
  variables?: AdminCustomizationProductsVariables,
  enabled = true,
) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.products(variables),
    queryFn: () => getAdminCustomizationProducts(variables),
    enabled,
  })
}
