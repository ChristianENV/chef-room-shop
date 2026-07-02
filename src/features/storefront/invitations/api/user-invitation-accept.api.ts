import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ACCEPT_USER_INVITATION_MUTATION } from '../graphql/user-invitation-accept.mutations'
import { PREVIEW_USER_INVITATION_QUERY } from '../graphql/user-invitation-accept.queries'
import type { AcceptUserInvitationPayload, PublicUserInvitationPreview } from '../types'

type PreviewData = { previewUserInvitation: PublicUserInvitationPreview }
type AcceptData = { acceptUserInvitation: AcceptUserInvitationPayload }

/**
 * Fetches invitation preview for a token (public, no session).
 */
export async function getUserInvitationPreview(
  token: string,
): Promise<PublicUserInvitationPreview> {
  const data = await fetchGraphQL<PreviewData, { token: string }>({
    query: PREVIEW_USER_INVITATION_QUERY,
    variables: { token },
  })
  return data.previewUserInvitation
}

/**
 * Accepts an invitation for the authenticated user.
 */
export async function acceptUserInvitation(token: string): Promise<AcceptUserInvitationPayload> {
  const data = await fetchGraphQL<AcceptData, { token: string }>({
    query: ACCEPT_USER_INVITATION_MUTATION,
    variables: { token },
  })
  return data.acceptUserInvitation
}
