'use client'

import { useMutation } from '@tanstack/react-query'

import { claimOrder } from './order-claim.api'

/**
 * Claims a guest order for the authenticated user.
 */
export function useClaimOrderMutation() {
  return useMutation({
    mutationFn: (token: string) => claimOrder(token),
  })
}
