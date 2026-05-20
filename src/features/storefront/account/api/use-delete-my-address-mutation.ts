'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { deleteMyAddress } from './account.api'
import { accountQueryKeys } from './account.query-keys'

/**
 * Soft-deletes an address for the authenticated user.
 */
export function useDeleteMyAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => deleteMyAddress(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
