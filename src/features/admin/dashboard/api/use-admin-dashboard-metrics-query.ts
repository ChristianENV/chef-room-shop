'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminDashboardMetrics } from './admin-dashboard.api'
import { adminDashboardQueryKeys } from './admin-dashboard.query-keys'

/**
 * TanStack Query hook for admin dashboard KPI metrics.
 */
export function useAdminDashboardMetricsQuery() {
  return useQuery({
    queryKey: adminDashboardQueryKeys.metrics(),
    queryFn: getAdminDashboardMetrics,
  })
}
