import { AuditAction, Prisma, RoleSlug, UserInvitationStatus, UserStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import {
  generateUserInvitationToken,
  hashUserInvitationToken,
} from '@/src/server/invitations/user-invitation-crypto'
import { USER_INVITATION_TTL_DAYS } from '@/src/server/invitations/user-invitation.constants'

import type { GraphQLContext } from '../../context'
import { requireUsersWriteGraphQL } from '../admin-users/admin-users.auth'
import { userListInclude } from '../admin-users/admin-users.mappers'
import { buildInvitationEmailUrl, sendUserInvitationEmail } from './admin-invitations.email'
import { invitationInclude, mapUserInvitationToGql } from './admin-invitations.mappers'
import type {
  CreateUserInvitationInput,
  ResendUserInvitationInput,
  RevokeUserInvitationInput,
  UserInvitationGql,
} from './admin-invitations.types'
import {
  parseCreateUserInvitationInput,
  parseInvitationIdInput,
} from './admin-invitations.validation'
import { markInvitationExpiredIfNeeded } from './admin-invitations.service'

function notFoundError(): GraphQLError {
  return new GraphQLError('Invitación no encontrada.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

function userInputError(message: string, code: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code },
  })
}

function invitationExpiresAt(from = new Date()): Date {
  const expiresAt = new Date(from)
  expiresAt.setDate(expiresAt.getDate() + USER_INVITATION_TTL_DAYS)
  return expiresAt
}

async function writeInvitationAuditLog(
  tx: Prisma.TransactionClient,
  userId: string,
  action: AuditAction,
  invitationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId,
      action,
      entityType: 'UserInvitation',
      entityId: invitationId,
      metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

async function loadInvitationById(context: GraphQLContext, id: string) {
  const invitation = await context.prisma.userInvitation.findUnique({
    where: { id },
    include: invitationInclude,
  })
  if (!invitation) throw notFoundError()
  return invitation
}

async function assertInviteTargetEligible(
  context: GraphQLContext,
  email: string,
  targetRole: RoleSlug,
): Promise<void> {
  const user = await context.prisma.user.findUnique({
    where: { email },
    include: userListInclude,
  })

  if (!user) return

  if (user.deletedAt != null || user.status === UserStatus.DELETED) {
    throw userInputError(
      'No se puede invitar a un usuario bloqueado. Reactívalo primero.',
      'USER_BLOCKED',
    )
  }

  const hasRole = user.roles.some((userRole) => userRole.role.slug === targetRole)
  if (hasRole) {
    throw userInputError('El usuario ya tiene este rol asignado.', 'USER_ALREADY_HAS_ROLE')
  }
}

async function revokePendingInvitesForEmailRole(
  tx: Prisma.TransactionClient,
  callerId: string,
  email: string,
  targetRole: RoleSlug,
): Promise<string[]> {
  const pending = await tx.userInvitation.findMany({
    where: {
      email,
      targetRole,
      status: UserInvitationStatus.PENDING,
    },
    select: { id: true },
  })

  if (pending.length === 0) return []

  const now = new Date()
  const revokedIds: string[] = []

  for (const invite of pending) {
    await tx.userInvitation.update({
      where: { id: invite.id },
      data: {
        status: UserInvitationStatus.REVOKED,
        revokedAt: now,
        revokedByUserId: callerId,
      },
    })
    await writeInvitationAuditLog(tx, callerId, AuditAction.UPDATE, invite.id, {
      action: 'supersede_on_create',
      email,
      targetRole,
    })
    revokedIds.push(invite.id)
  }

  return revokedIds
}

/**
 * Creates a user invitation, supersedes duplicate pending invites, and sends email.
 */
export async function createUserInvitation(
  context: GraphQLContext,
  input: CreateUserInvitationInput,
): Promise<UserInvitationGql> {
  const caller = requireUsersWriteGraphQL(context)
  const parsed = parseCreateUserInvitationInput(input)

  if (parsed.targetRole === RoleSlug.SUPERADMIN) {
    throw userInputError('No se pueden crear invitaciones de Superadmin.', 'INVALID_TARGET_ROLE')
  }

  await assertInviteTargetEligible(context, parsed.email, parsed.targetRole)

  const rawToken = generateUserInvitationToken()
  const tokenHash = hashUserInvitationToken(rawToken)
  const expiresAt = invitationExpiresAt()

  const created = await context.prisma.$transaction(async (tx) => {
    await revokePendingInvitesForEmailRole(tx, caller.id, parsed.email, parsed.targetRole)

    const invitation = await tx.userInvitation.create({
      data: {
        email: parsed.email,
        targetRole: parsed.targetRole,
        tokenHash,
        status: UserInvitationStatus.PENDING,
        invitedByUserId: caller.id,
        expiresAt,
      },
      include: invitationInclude,
    })

    await writeInvitationAuditLog(tx, caller.id, AuditAction.CREATE, invitation.id, {
      email: parsed.email,
      targetRole: parsed.targetRole,
    })

    return invitation
  })

  await sendUserInvitationEmail({
    to: parsed.email,
    invitationUrl: buildInvitationEmailUrl(rawToken),
    targetRole: parsed.targetRole,
    invitedByName: caller.name,
    expiresAt,
  })

  return mapUserInvitationToGql(created)
}

/**
 * Revokes a pending invitation.
 */
export async function revokeUserInvitation(
  context: GraphQLContext,
  input: RevokeUserInvitationInput,
): Promise<UserInvitationGql> {
  const caller = requireUsersWriteGraphQL(context)
  const { id } = parseInvitationIdInput(input)

  const existing = await loadInvitationById(context, id)
  const resolvedStatus = await markInvitationExpiredIfNeeded(
    context,
    existing.id,
    existing.status,
    existing.expiresAt,
  )

  if (resolvedStatus !== UserInvitationStatus.PENDING) {
    throw userInputError(
      'Solo se pueden revocar invitaciones pendientes.',
      'INVITATION_NOT_PENDING',
    )
  }

  const now = new Date()

  const updated = await context.prisma.$transaction(async (tx) => {
    const invitation = await tx.userInvitation.update({
      where: { id },
      data: {
        status: UserInvitationStatus.REVOKED,
        revokedAt: now,
        revokedByUserId: caller.id,
      },
      include: invitationInclude,
    })

    await writeInvitationAuditLog(tx, caller.id, AuditAction.UPDATE, id, {
      action: 'revoke',
    })

    return invitation
  })

  return mapUserInvitationToGql(updated)
}

/**
 * Resends a pending invitation with a rotated token and refreshed expiry.
 */
export async function resendUserInvitation(
  context: GraphQLContext,
  input: ResendUserInvitationInput,
): Promise<UserInvitationGql> {
  const caller = requireUsersWriteGraphQL(context)
  const { id } = parseInvitationIdInput(input)

  const existing = await loadInvitationById(context, id)
  const resolvedStatus = await markInvitationExpiredIfNeeded(
    context,
    existing.id,
    existing.status,
    existing.expiresAt,
  )

  if (resolvedStatus !== UserInvitationStatus.PENDING) {
    throw userInputError(
      'Solo se pueden reenviar invitaciones pendientes.',
      'INVITATION_NOT_PENDING',
    )
  }

  await assertInviteTargetEligible(context, existing.email, existing.targetRole)

  const rawToken = generateUserInvitationToken()
  const tokenHash = hashUserInvitationToken(rawToken)
  const expiresAt = invitationExpiresAt()

  const updated = await context.prisma.$transaction(async (tx) => {
    const invitation = await tx.userInvitation.update({
      where: { id },
      data: {
        tokenHash,
        expiresAt,
      },
      include: invitationInclude,
    })

    await writeInvitationAuditLog(tx, caller.id, AuditAction.UPDATE, id, {
      action: 'resend',
      tokenRotated: true,
    })

    return invitation
  })

  await sendUserInvitationEmail({
    to: existing.email,
    invitationUrl: buildInvitationEmailUrl(rawToken),
    targetRole: existing.targetRole,
    invitedByName: caller.name,
    expiresAt,
  })

  return mapUserInvitationToGql(updated)
}
