'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationOptions } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

export function useAdminCustomizationOptionsQuery(enabled = true) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.options(),
    queryFn: getAdminCustomizationOptions,
    enabled,
  })
}
