'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationRules } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'
import type { AdminCustomizationRulesListVariables } from '../types'

export function useAdminCustomizationRulesQuery(
  variables?: AdminCustomizationRulesListVariables,
  enabled = true,
) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.rules(variables),
    queryFn: () => getAdminCustomizationRules(variables),
    enabled,
  })
}
