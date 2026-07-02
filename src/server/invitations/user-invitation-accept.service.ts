import 'server-only'

import {
  AuditAction,
  RoleSlug,
  UserInvitationStatus,
  UserStatus,
  type Prisma,
} from '@prisma/client'
import { GraphQLError } from 'graphql'

import { routes } from '@/src/config/routes'
import { maskEmail } from '@/src/lib/email/mask-email'
import {
  assignRoleIfMissing,
  userHasAdminAccess as userHasAdminAccessDb,
} from '@/src/server/auth/roles-core'
import type { GraphQLContext } from '@/src/server/graphql/context'
import { INVITABLE_ROLE_SLUGS } from '@/src/server/invitations/user-invitation.constants'
import {
  loadUserInvitationByToken,
  normalizeInvitationToken,
  resolveInvitationStatus,
} from '@/src/server/invitations/user-invitation-lookup'

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador',
}

const INVALID_INVITATION_MESSAGE = 'Este enlace de invitación no es válido o ya no está disponible.'

export type PublicUserInvitationPreviewGql = {
  valid: boolean
  status: string | null
  maskedEmail: string | null
  email: string | null
  targetRole: string | null
  targetRoleLabel: string | null
  expiresAt: string | null
  isExpired: boolean
  existingUserHint: string | null
  message: string | null
}

export type AcceptUserInvitationPayloadGql = {
  success: boolean
  message: string | null
  redirectTo: string | null
  targetRole: string | null
}

function invalidPreview(message = INVALID_INVITATION_MESSAGE): PublicUserInvitationPreviewGql {
  return {
    valid: false,
    status: null,
    maskedEmail: null,
    email: null,
    targetRole: null,
    targetRoleLabel: null,
    expiresAt: null,
    isExpired: false,
    existingUserHint: null,
    message,
  }
}

function statusMessage(status: UserInvitationStatus): string {
  switch (status) {
    case UserInvitationStatus.ACCEPTED:
      return 'Esta invitación ya fue aceptada.'
    case UserInvitationStatus.REVOKED:
      return 'Esta invitación fue revocada.'
    case UserInvitationStatus.EXPIRED:
      return 'Esta invitación expiró.'
    default:
      return INVALID_INVITATION_MESSAGE
  }
}

async function writeAcceptAuditLog(
  tx: Prisma.TransactionClient,
  userId: string,
  invitationId: string,
  metadata?: Record<string, unknown>,
): Promise<void> {
  await tx.auditLog.create({
    data: {
      userId,
      action: AuditAction.UPDATE,
      entityType: 'UserInvitation',
      entityId: invitationId,
      metadataJson: metadata ? (metadata as Prisma.InputJsonValue) : undefined,
    },
  })
}

function resolveAcceptRedirect(targetRole: RoleSlug, hasAdmin: boolean): string {
  if (targetRole === RoleSlug.ADMIN) {
    return hasAdmin ? routes.adminDashboard : routes.adminLogin
  }
  return routes.account
}

/**
 * Public preview for an invitation token (no auth required).
 */
export async function previewUserInvitation(
  context: GraphQLContext,
  rawToken: string,
): Promise<PublicUserInvitationPreviewGql> {
  const token = normalizeInvitationToken(rawToken)
  if (!token) {
    return invalidPreview('El enlace de invitación no es válido.')
  }

  const invitation = await loadUserInvitationByToken(context.prisma, token)
  if (!invitation) {
    return invalidPreview()
  }

  const status = await resolveInvitationStatus(context.prisma, invitation)
  const maskedEmail = maskEmail(invitation.email)
  const targetRoleLabel = ROLE_LABELS[invitation.targetRole] ?? invitation.targetRole
  const isExpired = status === UserInvitationStatus.EXPIRED

  if (status !== UserInvitationStatus.PENDING) {
    return {
      valid: false,
      status,
      maskedEmail,
      email: null,
      targetRole: invitation.targetRole,
      targetRoleLabel,
      expiresAt: invitation.expiresAt.toISOString(),
      isExpired,
      existingUserHint: null,
      message: statusMessage(status),
    }
  }

  const existingUser = await context.prisma.user.findUnique({
    where: { email: invitation.email },
    select: { id: true, deletedAt: true },
  })

  const existingUserHint = existingUser && existingUser.deletedAt == null ? 'existing' : 'new'

  return {
    valid: true,
    status,
    maskedEmail,
    email: invitation.email,
    targetRole: invitation.targetRole,
    targetRoleLabel,
    expiresAt: invitation.expiresAt.toISOString(),
    isExpired: false,
    existingUserHint,
    message: null,
  }
}

/**
 * Accepts an invitation for the authenticated user (application-layer RBAC).
 */
export async function acceptUserInvitation(
  context: GraphQLContext,
  rawToken: string,
): Promise<AcceptUserInvitationPayloadGql> {
  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para aceptar la invitación.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  const token = normalizeInvitationToken(rawToken)
  if (!token) {
    return {
      success: false,
      message: INVALID_INVITATION_MESSAGE,
      redirectTo: null,
      targetRole: null,
    }
  }

  const invitation = await loadUserInvitationByToken(context.prisma, token)
  if (!invitation) {
    return {
      success: false,
      message: INVALID_INVITATION_MESSAGE,
      redirectTo: null,
      targetRole: null,
    }
  }

  const status = await resolveInvitationStatus(context.prisma, invitation)

  if (status !== UserInvitationStatus.PENDING) {
    return {
      success: false,
      message: statusMessage(status),
      redirectTo: null,
      targetRole: invitation.targetRole,
    }
  }

  if (invitation.targetRole === RoleSlug.SUPERADMIN) {
    return {
      success: false,
      message: 'Esta invitación no puede aceptarse.',
      redirectTo: null,
      targetRole: null,
    }
  }

  if (!INVITABLE_ROLE_SLUGS.includes(invitation.targetRole)) {
    return {
      success: false,
      message: 'Esta invitación no puede aceptarse.',
      redirectTo: null,
      targetRole: null,
    }
  }

  const callerEmail = context.currentUser.email.trim().toLowerCase()
  if (callerEmail !== invitation.email) {
    return {
      success: false,
      message: 'Debes iniciar sesión con el correo al que se envió la invitación.',
      redirectTo: null,
      targetRole: invitation.targetRole,
    }
  }

  const user = await context.prisma.user.findUnique({
    where: { id: context.currentUser.id },
    select: { id: true, status: true, deletedAt: true },
  })

  if (!user || user.deletedAt != null || user.status === UserStatus.DELETED) {
    return {
      success: false,
      message: 'Tu cuenta está bloqueada. Contacta a soporte para reactivarla.',
      redirectTo: null,
      targetRole: invitation.targetRole,
    }
  }

  if (user.status === UserStatus.SUSPENDED) {
    return {
      success: false,
      message: 'Tu cuenta está suspendida. Un administrador debe reactivarla antes de aceptar.',
      redirectTo: null,
      targetRole: invitation.targetRole,
    }
  }

  const now = new Date()
  const userId = context.currentUser.id

  await context.prisma.$transaction(async (tx) => {
    await assignRoleIfMissing(tx, userId, invitation.targetRole)

    if (invitation.targetRole === RoleSlug.ADMIN) {
      await assignRoleIfMissing(tx, userId, RoleSlug.CUSTOMER)
    }

    await tx.userInvitation.update({
      where: { id: invitation.id },
      data: {
        status: UserInvitationStatus.ACCEPTED,
        acceptedAt: now,
        acceptedByUserId: userId,
      },
    })

    await writeAcceptAuditLog(tx, userId, invitation.id, {
      action: 'accept',
      targetRole: invitation.targetRole,
    })
  })

  const hasAdmin = await userHasAdminAccessDb(context.prisma, userId)
  const redirectTo = resolveAcceptRedirect(invitation.targetRole, hasAdmin)

  return {
    success: true,
    message: 'Invitación aceptada correctamente.',
    redirectTo,
    targetRole: invitation.targetRole,
  }
}
