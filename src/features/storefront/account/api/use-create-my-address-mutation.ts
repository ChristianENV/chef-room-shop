'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createMyAddress } from './account.api'
import { accountQueryKeys } from './account.query-keys'
import type { MyAddressInput } from '../types'

/**
 * Creates a new address for the authenticated user.
 */
export function useCreateMyAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: MyAddressInput) => createMyAddress(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
