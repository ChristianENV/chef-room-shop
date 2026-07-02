'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { resendUserInvitation } from './admin-invitations.api'
import { adminInvitationsQueryKeys } from './admin-invitations.query-keys'

export function useResendUserInvitationMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: (id: string) => resendUserInvitation(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: adminInvitationsQueryKeys.all })
    },
  })
}
