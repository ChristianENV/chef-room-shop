'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { setDefaultAddress } from './account.api'
import { accountQueryKeys } from './account.query-keys'

type SetDefaultVariables = {
  id: string
  type: string
}

/**
 * Sets the default address for a given type (SHIPPING / BILLING / BOTH).
 */
export function useSetDefaultAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, type }: SetDefaultVariables) => setDefaultAddress(id, type),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
