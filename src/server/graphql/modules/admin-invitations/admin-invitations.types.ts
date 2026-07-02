import type { AdminUserGql } from '../admin-users/admin-users.types'

export type UserInvitationGql = {
  id: string
  email: string
  targetRole: string
  status: string
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  createdAt: string
  updatedAt: string
  invitedBy: AdminUserGql | null
  acceptedBy: AdminUserGql | null
  revokedBy: AdminUserGql | null
}

export type AdminUserInvitationsPayloadGql = {
  items: UserInvitationGql[]
  total: number
}

export type AdminUserInvitationsFilterInput = {
  search?: string | null
  status?: string | null
  targetRole?: string | null
}

export type AdminUserInvitationsListInput = {
  filter?: AdminUserInvitationsFilterInput | null
  limit?: number | null
  offset?: number | null
}

export type CreateUserInvitationInput = {
  email: string
  targetRole: string
}

export type RevokeUserInvitationInput = {
  id: string
}

export type ResendUserInvitationInput = {
  id: string
}
