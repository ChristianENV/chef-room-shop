'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyAddresses } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * TanStack Query hook for the authenticated user's addresses.
 */
export function useMyAddressesQuery() {
  return useQuery({
    queryKey: accountQueryKeys.addresses(),
    queryFn: getMyAddresses,
  })
}
