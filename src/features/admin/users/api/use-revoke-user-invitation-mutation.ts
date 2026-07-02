'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { revokeUserInvitation } from './admin-invitations.api'
import { adminInvitationsQueryKeys } from './admin-invitations.query-keys'

export function useRevokeUserInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => revokeUserInvitation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvitationsQueryKeys.all })
    },
  })
}
