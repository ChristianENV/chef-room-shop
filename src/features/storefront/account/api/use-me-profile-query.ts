'use client'

import { useQuery } from '@tanstack/react-query'

import { getMeProfile } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * TanStack Query hook for the authenticated user profile.
 */
export function useMeProfileQuery() {
  return useQuery({
    queryKey: accountQueryKeys.profile(),
    queryFn: getMeProfile,
  })
}
