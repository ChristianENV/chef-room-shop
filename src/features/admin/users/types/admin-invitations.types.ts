import type { AdminUser } from '../types'

export type UserInvitation = {
  id: string
  email: string
  targetRole: string
  status: string
  expiresAt: string
  acceptedAt: string | null
  revokedAt: string | null
  createdAt: string
  updatedAt: string
  invitedBy: Pick<AdminUser, 'id' | 'name' | 'email'> | null
  acceptedBy: Pick<AdminUser, 'id' | 'name' | 'email'> | null
  revokedBy: Pick<AdminUser, 'id' | 'name' | 'email'> | null
}

export type AdminUserInvitationsPayload = {
  items: UserInvitation[]
  total: number
}

export type AdminUserInvitationsFilter = {
  search?: string | null
  status?: string | null
  targetRole?: string | null
}

export type AdminUserInvitationsListVariables = {
  filter?: AdminUserInvitationsFilter | null
  limit?: number | null
  offset?: number | null
}

export type CreateUserInvitationInput = {
  email: string
  targetRole: string
}

export type InvitableTargetRole = 'CUSTOMER' | 'ADMIN'

export type AdminUserInvitationStatusFilter = 'all' | 'PENDING' | 'ACCEPTED' | 'REVOKED' | 'EXPIRED'

export type AdminUserInvitationsUiTableRow = {
  id: string
  email: string
  targetRole: string
  targetRoleLabel: string
  status: string
  statusLabel: string
  invitedByName: string
  createdAtLabel: string
  expiresAtLabel: string
  canRevoke: boolean
  canResend: boolean
}
