import 'server-only'

import { prisma } from '@/src/server/db/prisma'

import {
  assignRoleIfMissing as assignRoleIfMissingDb,
  ensureCustomerRole as ensureCustomerRoleDb,
  getUserRolesAndPermissions as getUserRolesAndPermissionsDb,
  userHasAdminAccess as userHasAdminAccessDb,
} from './roles-core'

/**
 * Ensures the user has the CUSTOMER role (idempotent).
 */
export async function ensureCustomerRole(userId: string): Promise<void> {
  return ensureCustomerRoleDb(prisma, userId)
}

/**
 * Assigns a role if the user does not already have it (idempotent).
 */
export async function assignRoleIfMissing(
  userId: string,
  roleSlug: Parameters<typeof assignRoleIfMissingDb>[2],
): Promise<void> {
  return assignRoleIfMissingDb(prisma, userId, roleSlug)
}

/**
 * Returns role slugs and permission slugs for a user.
 */
export async function getUserRolesAndPermissions(
  userId: string,
): Promise<{ roles: string[]; permissions: string[] }> {
  return getUserRolesAndPermissionsDb(prisma, userId)
}

/**
 * Returns true when the user has ADMIN or SUPERADMIN role.
 */
export async function userHasAdminAccess(userId: string): Promise<boolean> {
  return userHasAdminAccessDb(prisma, userId)
}
