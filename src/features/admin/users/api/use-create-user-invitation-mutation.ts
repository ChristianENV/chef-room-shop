'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { createUserInvitation } from './admin-invitations.api'
import { adminInvitationsQueryKeys } from './admin-invitations.query-keys'
import type { CreateUserInvitationInput } from '../types/admin-invitations.types'

export function useCreateUserInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (input: CreateUserInvitationInput) => createUserInvitation(input),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvitationsQueryKeys.all })
    },
  })
}
