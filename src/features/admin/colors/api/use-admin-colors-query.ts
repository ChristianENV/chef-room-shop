'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminColors } from './admin-colors.api'
import { adminColorsQueryKeys } from './admin-colors.query-keys'
import type { AdminColorsListVariables } from '../types'

export function useAdminColorsQuery(variables?: AdminColorsListVariables) {
  return useQuery({
    queryKey: adminColorsQueryKeys.list(variables?.includeInactive ?? true),
    queryFn: () => getAdminColors(variables),
  })
}
