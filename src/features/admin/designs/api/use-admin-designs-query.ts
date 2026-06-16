'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminDesigns } from './admin-designs.api'
import { adminDesignsQueryKeys } from './admin-designs.query-keys'
import type { AdminDesignsListVariables } from '../types'

/**
 * TanStack Query hook for paginated admin designs list.
 */
export function useAdminDesignsQuery(variables?: AdminDesignsListVariables) {
  return useQuery({
    queryKey: adminDesignsQueryKeys.list(variables),
    queryFn: () => getAdminDesigns(variables),
  })
}
