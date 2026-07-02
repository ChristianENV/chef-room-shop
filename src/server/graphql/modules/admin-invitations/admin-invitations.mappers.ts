import type { Prisma } from '@prisma/client'

import { mapUserToAdminGql } from '../admin-users/admin-users.mappers'
import type { UserInvitationGql } from './admin-invitations.types'

export const invitationInclude = {
  invitedBy: { include: { roles: { include: { role: true } } } },
  acceptedBy: { include: { roles: { include: { role: true } } } },
  revokedBy: { include: { roles: { include: { role: true } } } },
} satisfies Prisma.UserInvitationInclude

export type UserInvitationWithRelations = Prisma.UserInvitationGetPayload<{
  include: typeof invitationInclude
}>

function mapOptionalAdminUser(user: UserInvitationWithRelations['invitedBy'] | null | undefined) {
  if (!user) return null
  return mapUserToAdminGql(user)
}

/**
 * Maps a Prisma UserInvitation to GraphQL shape (never exposes tokenHash).
 */
export function mapUserInvitationToGql(invitation: UserInvitationWithRelations): UserInvitationGql {
  return {
    id: invitation.id,
    email: invitation.email,
    targetRole: invitation.targetRole,
    status: invitation.status,
    expiresAt: invitation.expiresAt.toISOString(),
    acceptedAt: invitation.acceptedAt?.toISOString() ?? null,
    revokedAt: invitation.revokedAt?.toISOString() ?? null,
    createdAt: invitation.createdAt.toISOString(),
    updatedAt: invitation.updatedAt.toISOString(),
    invitedBy: mapOptionalAdminUser(invitation.invitedBy),
    acceptedBy: mapOptionalAdminUser(invitation.acceptedBy),
    revokedBy: mapOptionalAdminUser(invitation.revokedBy),
  }
}
