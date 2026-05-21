'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminCustomizationAreas } from './admin-customization.api'
import { adminCustomizationQueryKeys } from './admin-customization.query-keys'

export function useAdminCustomizationAreasQuery(enabled = true) {
  return useQuery({
    queryKey: adminCustomizationQueryKeys.areas(),
    queryFn: getAdminCustomizationAreas,
    enabled,
  })
}
