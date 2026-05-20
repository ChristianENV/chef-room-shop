'use client'

import { useQuery } from '@tanstack/react-query'

import { getOrderClaimPreview } from './order-claim.api'
import { orderClaimQueryKeys } from './order-claim.query-keys'

type UseOrderClaimPreviewQueryOptions = {
  token: string
  enabled?: boolean
}

/**
 * Loads claim preview for a token (public, no session).
 */
export function useOrderClaimPreviewQuery(options: UseOrderClaimPreviewQueryOptions) {
  const { token, enabled = true } = options

  return useQuery({
    queryKey: orderClaimQueryKeys.preview(token),
    queryFn: () => getOrderClaimPreview(token),
    enabled: enabled && token.length > 0,
    retry: false,
  })
}
