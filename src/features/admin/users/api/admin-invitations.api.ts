import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { ADMIN_USER_INVITATIONS_QUERY } from '../graphql/admin-invitations.queries'
import {
  CREATE_USER_INVITATION_MUTATION,
  RESEND_USER_INVITATION_MUTATION,
  REVOKE_USER_INVITATION_MUTATION,
} from '../graphql/admin-invitations.mutations'
import type {
  AdminUserInvitationsListVariables,
  AdminUserInvitationsPayload,
  CreateUserInvitationInput,
  UserInvitation,
} from '../types/admin-invitations.types'

type AdminUserInvitationsData = { adminUserInvitations: AdminUserInvitationsPayload }
type CreateUserInvitationData = { createUserInvitation: UserInvitation }
type RevokeUserInvitationData = { revokeUserInvitation: UserInvitation }
type ResendUserInvitationData = { resendUserInvitation: UserInvitation }

export async function getAdminUserInvitations(
  variables?: AdminUserInvitationsListVariables,
): Promise<AdminUserInvitationsPayload> {
  const data = await fetchGraphQL<AdminUserInvitationsData, AdminUserInvitationsListVariables>({
    query: ADMIN_USER_INVITATIONS_QUERY,
    variables,
  })
  return data.adminUserInvitations
}

export async function createUserInvitation(
  input: CreateUserInvitationInput,
): Promise<UserInvitation> {
  const data = await fetchGraphQL<CreateUserInvitationData, { input: CreateUserInvitationInput }>({
    query: CREATE_USER_INVITATION_MUTATION,
    variables: { input },
  })
  return data.createUserInvitation
}

export async function revokeUserInvitation(id: string): Promise<UserInvitation> {
  const data = await fetchGraphQL<RevokeUserInvitationData, { input: { id: string } }>({
    query: REVOKE_USER_INVITATION_MUTATION,
    variables: { input: { id } },
  })
  return data.revokeUserInvitation
}

export async function resendUserInvitation(id: string): Promise<UserInvitation> {
  const data = await fetchGraphQL<ResendUserInvitationData, { input: { id: string } }>({
    query: RESEND_USER_INVITATION_MUTATION,
    variables: { input: { id } },
  })
  return data.resendUserInvitation
}
