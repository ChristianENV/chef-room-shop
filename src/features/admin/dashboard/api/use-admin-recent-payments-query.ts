'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminRecentPayments } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin recent payments list.
 */
export function useAdminRecentPaymentsQuery(limit?: number) {
  return useQuery({
    queryKey: adminDashboardQueryKeys.recentPayments(limit),
    queryFn: () => getAdminRecentPayments(limit),
  })
}
