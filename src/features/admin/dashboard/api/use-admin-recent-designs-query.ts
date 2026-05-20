'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminRecentDesigns } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin recent designs list.
 */
export function useAdminRecentDesignsQuery(limit?: number) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.recentDesigns(limit),
    queryFn: () => getAdminRecentDesigns(limit),
  })
}
