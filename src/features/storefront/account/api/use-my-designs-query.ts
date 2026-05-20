'use client'

import { useQuery } from '@tanstack/react-query'

import { getMyDesigns } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * TanStack Query hook for the authenticated user's designs.
 */
export function useMyDesignsQuery(params?: {
  limit?: number
  offset?: number
  status?: string
}) {
  return useQuery({
    queryKey: accountQueryKeys.designs(params ?? {}),
    queryFn: () => getMyDesigns(params),
  })
}
