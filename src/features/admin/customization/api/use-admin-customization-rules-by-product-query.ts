'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationRulesByProduct } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

export function useAdminCustomizationRulesByProductQuery(productId: string, enabled = true) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.rulesByProduct(productId),
    queryFn: () => getAdminCustomizationRulesByProduct(productId),
    enabled: enabled && productId.length > 0,
  })
}
