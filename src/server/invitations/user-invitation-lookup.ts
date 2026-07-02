import 'server-only'

import { UserInvitationStatus, type Prisma, type PrismaClient } from '@prisma/client'

import { hashUserInvitationToken } from './user-invitation-crypto'

type DbClient = PrismaClient | Prisma.TransactionClient

export function normalizeInvitationToken(token: string): string | null {
  const trimmed = token.trim()
  return trimmed.length > 0 ? trimmed : null
}

/**
 * Loads a UserInvitation by raw token (hashes before lookup).
 */
export async function loadUserInvitationByToken(db: DbClient, rawToken: string) {
  const token = normalizeInvitationToken(rawToken)
  if (!token) return null

  const tokenHash = hashUserInvitationToken(token)
  return db.userInvitation.findUnique({
    where: { tokenHash },
  })
}

/**
 * Marks PENDING invitation as EXPIRED when past expiresAt. Returns resolved status.
 */
export async function resolveInvitationStatus(
  db: DbClient,
  invitation: { id: string; status: UserInvitationStatus; expiresAt: Date },
): Promise<UserInvitationStatus> {
  if (invitation.status !== UserInvitationStatus.PENDING) {
    return invitation.status
  }

  if (invitation.expiresAt.getTime() >= Date.now()) {
    return invitation.status
  }

  await db.userInvitation.update({
    where: { id: invitation.id },
    data: { status: UserInvitationStatus.EXPIRED },
  })

  return UserInvitationStatus.EXPIRED
}
