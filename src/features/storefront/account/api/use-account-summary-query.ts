'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyAccountSummary } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * TanStack Query hook for account dashboard summary.
 */
export function useAccountSummaryQuery() {
  return useQuery({
    queryKey: accountQueryKeys.summary(),
    queryFn: getMyAccountSummary,
  })
}
