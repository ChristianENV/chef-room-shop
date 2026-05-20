'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { updateMyProfile } from './account.api'
import { accountQueryKeys } from './account.query-keys'
import type { UpdateMyProfileInput } from '../types'

/**
 * Updates the authenticated user's profile via Account BFF.
 */
export function useUpdateMyProfileMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: UpdateMyProfileInput) => updateMyProfile(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
