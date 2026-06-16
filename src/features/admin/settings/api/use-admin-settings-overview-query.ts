'use client'

import { useQuery } from '@tanstack/react-query'

import { getAdminSettingsOverview } from './admin-settings.api'
import { adminSettingsQueryKeys } from './admin-settings.query-keys'

/**
 * TanStack Query hook for read-only admin settings overview.
 */
export function useAdminSettingsOverviewQuery() {
  return useQuery({
    queryKey: adminSettingsQueryKeys.overview(),
    queryFn: getAdminSettingsOverview,
    staleTime: 60_000,
  })
}
