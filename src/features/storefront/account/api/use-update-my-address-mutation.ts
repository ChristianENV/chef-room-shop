'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMyAddress } from './account.api'
import { accountQueryKeys } from './account.query-keys'
import type { MyAddressInput } from '../types'

type UpdateAddressVariables = {
  id: string
  input: MyAddressInput
}

/**
 * Updates an existing address for the authenticated user.
 */
export function useUpdateMyAddressMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: ({ id, input }: UpdateAddressVariables) => updateMyAddress(id, input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.addresses() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
