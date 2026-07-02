import { AuditAction, CustomerTier, RoleSlug, UserStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { GraphQLContext } from '../../context'
import { requireUsersWriteGraphQL } from './admin-users.auth'
import { mapUserToAdminGql, userListInclude } from './admin-users.mappers'
import { parseUpdateAdminUserInput, parseUserIdInput } from './admin-users.mutation-validation'
import type { AdminUserGql, UpdateAdminUserInput } from './admin-users.types'

// ─── helpers ────────────────────────────────────────────────────────────────

function notFoundError(): GraphQLError {
  return new GraphQLError('Usuario no encontrado.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

function forbiddenError(message: string): GraphQLError {
  return new GraphQLError(message, {
    extensions: { code: 'FORBIDDEN' },
  })
}

async function loadTargetUserWithRoles(context: GraphQLContext, id: string) {
  const user = await context.prisma.user.findUnique({
    where: { id },
    include: userListInclude,
  })
  if (!user) throw notFoundError()
  return user
}

async function countActiveSuperadmins(context: GraphQLContext): Promise<number> {
  return context.prisma.user.count({
    where: {
      status: UserStatus.ACTIVE,
      deletedAt: null,
      roles: { some: { role: { slug: RoleSlug.SUPERADMIN } } },
    },
  })
}

/**
 * Safety assertions shared by pause, block, and status-changing mutations.
 * - Cannot target self.
 * - ADMIN (non-SUPERADMIN caller) cannot target a SUPERADMIN.
 * - Cannot affect the last active SUPERADMIN when the action demotes/removes access.
 */
async function assertMutationSafe(
  context: GraphQLContext,
  targetId: string,
  targetRoles: string[],
  options: { checkLastSuperadmin: boolean },
): Promise<void> {
  const caller = context.currentUser!

  if (caller.id === targetId) {
    throw forbiddenError('No puedes aplicar esta acción a tu propia cuenta.')
  }

  const targetIsSuperadmin = targetRoles.includes(RoleSlug.SUPERADMIN)
  const callerIsSuperadmin = caller.roles.includes('SUPERADMIN')

  if (targetIsSuperadmin && !callerIsSuperadmin) {
    throw forbiddenError('No puedes gestionar una cuenta con rol Superadmin.')
  }

  if (options.checkLastSuperadmin && targetIsSuperadmin) {
    const count = await countActiveSuperadmins(context)
    if (count <= 1) {
      throw forbiddenError('No puedes afectar al último Superadmin activo del sistema.')
    }
  }
}

// ─── mutations ───────────────────────────────────────────────────────────────

/**
 * Updates basic profile fields of a user.
 * Allowed fields: name, firstName, lastName, phone, customerTier.
 * Does NOT update email, password, sessions, emailVerified, or auth data.
 */
export async function updateAdminUser(
  context: GraphQLContext,
  input: UpdateAdminUserInput,
): Promise<AdminUserGql> {
  const caller = requireUsersWriteGraphQL(context)
  const parsed = parseUpdateAdminUserInput(input)

  const target = await loadTargetUserWithRoles(context, parsed.id)
  const targetRoles = target.roles.map((r) => r.role.slug)

  // ADMIN cannot edit a SUPERADMIN
  await assertMutationSafe(context, parsed.id, targetRoles, { checkLastSuperadmin: false })

  const updated = await context.prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id: parsed.id },
      data: {
        ...(parsed.name != null ? { name: parsed.name } : {}),
        ...(parsed.firstName !== undefined ? { firstName: parsed.firstName } : {}),
        ...(parsed.lastName !== undefined ? { lastName: parsed.lastName } : {}),
        ...(parsed.phone !== undefined ? { phone: parsed.phone } : {}),
        ...(parsed.customerTier != null
          ? { customerTier: parsed.customerTier as CustomerTier }
          : {}),
      },
      include: userListInclude,
    })

    await tx.auditLog.create({
      data: {
        userId: caller.id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: parsed.id,
        metadataJson: { action: 'update_profile' } as never,
      },
    })

    return u
  })

  return mapUserToAdminGql(updated)
}

/**
 * Temporarily suspends a user.
 * Sets status = SUSPENDED. Does not modify deletedAt.
 * Reversible via reactivateAdminUser.
 */
export async function pauseAdminUser(context: GraphQLContext, id: string): Promise<AdminUserGql> {
  const caller = requireUsersWriteGraphQL(context)
  parseUserIdInput({ id })

  const target = await loadTargetUserWithRoles(context, id)
  const targetRoles = target.roles.map((r) => r.role.slug)

  await assertMutationSafe(context, id, targetRoles, { checkLastSuperadmin: true })

  if (target.status === UserStatus.SUSPENDED) {
    throw new GraphQLError('El usuario ya está suspendido.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const updated = await context.prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id },
      data: { status: UserStatus.SUSPENDED },
      include: userListInclude,
    })

    await tx.auditLog.create({
      data: {
        userId: caller.id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: id,
        metadataJson: { action: 'pause', previousStatus: target.status } as never,
      },
    })

    return u
  })

  return mapUserToAdminGql(updated)
}

/**
 * Blocks a user via soft-delete.
 * Sets status = DELETED and deletedAt = now().
 * The user will be excluded from getCurrentUser (enforced by existing auth logic).
 */
export async function blockAdminUser(context: GraphQLContext, id: string): Promise<AdminUserGql> {
  const caller = requireUsersWriteGraphQL(context)
  parseUserIdInput({ id })

  const target = await loadTargetUserWithRoles(context, id)
  const targetRoles = target.roles.map((r) => r.role.slug)

  await assertMutationSafe(context, id, targetRoles, { checkLastSuperadmin: true })

  if (target.deletedAt != null) {
    throw new GraphQLError('El usuario ya está bloqueado.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const now = new Date()

  const updated = await context.prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id },
      data: { status: UserStatus.DELETED, deletedAt: now },
      include: userListInclude,
    })

    await tx.auditLog.create({
      data: {
        userId: caller.id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: id,
        metadataJson: { action: 'block', previousStatus: target.status } as never,
      },
    })

    return u
  })

  return mapUserToAdminGql(updated)
}

/**
 * Reactivates a suspended or blocked user.
 * - SUSPENDED → ACTIVE (deletedAt untouched, should be null).
 * - DELETED (blocked) → ACTIVE + deletedAt = null.
 */
export async function reactivateAdminUser(
  context: GraphQLContext,
  id: string,
): Promise<AdminUserGql> {
  const caller = requireUsersWriteGraphQL(context)
  parseUserIdInput({ id })

  const target = await context.prisma.user.findUnique({
    where: { id },
    include: userListInclude,
  })
  if (!target) throw notFoundError()

  const targetRoles = target.roles.map((r) => r.role.slug)

  // Only restrict self-action for pause/block; reactivate is safe to allow on self
  // (but ADMIN still cannot reactivate a SUPERADMIN)
  const callerIsSuperadmin = context.currentUser!.roles.includes('SUPERADMIN')
  if (targetRoles.includes(RoleSlug.SUPERADMIN) && !callerIsSuperadmin) {
    throw forbiddenError('No puedes gestionar una cuenta con rol Superadmin.')
  }

  if (target.status === UserStatus.ACTIVE && target.deletedAt == null) {
    throw new GraphQLError('El usuario ya está activo.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }

  const previousStatus = target.status

  const updated = await context.prisma.$transaction(async (tx) => {
    const u = await tx.user.update({
      where: { id },
      data: { status: UserStatus.ACTIVE, deletedAt: null },
      include: userListInclude,
    })

    await tx.auditLog.create({
      data: {
        userId: caller.id,
        action: AuditAction.UPDATE,
        entityType: 'User',
        entityId: id,
        metadataJson: { action: 'reactivate', previousStatus } as never,
      },
    })

    return u
  })

  return mapUserToAdminGql(updated)
}
