'use client'

import { useMutation } from '@tanstack/react-query'

import { acceptUserInvitation } from './user-invitation-accept.api'

/**
 * Accepts an invitation for the authenticated user.
 */
export function useAcceptUserInvitationMutation() {
  return useMutation({
    mutationFn: (token: string) => acceptUserInvitation(token),
  })
}
