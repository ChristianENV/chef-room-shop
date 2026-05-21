'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationRuleById } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

export function useAdminCustomizationRuleByIdQuery(id: string, enabled = true) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.ruleDetail(id),
    queryFn: () => getAdminCustomizationRuleById(id),
    enabled: enabled && id.length > 0,
  })
}
