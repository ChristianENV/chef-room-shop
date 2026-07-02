'use client'

import { useQuery } from '@tanstack/react-query'

import { getUserInvitationPreview } from './user-invitation-accept.api'
import { userInvitationAcceptQueryKeys } from './user-invitation-accept.query-keys'

type UseUserInvitationPreviewQueryOptions = {
  token: string
  enabled?: boolean
}

/**
 * Loads invitation preview for a token (public, no session).
 */
export function useUserInvitationPreviewQuery(options: UseUserInvitationPreviewQueryOptions) {
  const { token, enabled = true } = options

  return useQuery({
    queryKey: userInvitationAcceptQueryKeys.preview(token),
    queryFn: () => getUserInvitationPreview(token),
    enabled: enabled && token.length > 0,
    retry: false,
  })
}
