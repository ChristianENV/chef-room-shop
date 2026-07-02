import { RoleSlug } from '@prisma/client'
import type { Prisma, PrismaClient } from '@prisma/client'

import { ADMIN_ROLE_SLUGS } from './permissions'

type DbClient = PrismaClient | Prisma.TransactionClient

const userRolesInclude = {
  roles: {
    include: {
      role: {
        include: {
          permissions: {
            include: { permission: true },
          },
        },
      },
    },
  },
} as const

/**
 * Ensures the user has the CUSTOMER role (idempotent).
 */
export async function ensureCustomerRole(db: DbClient, userId: string): Promise<void> {
  return assignRoleIfMissing(db, userId, RoleSlug.CUSTOMER)
}

/**
 * Assigns a role if the user does not already have it (idempotent).
 * SUPERADMIN cannot be assigned through this helper.
 */
export async function assignRoleIfMissing(
  db: DbClient,
  userId: string,
  roleSlug: RoleSlug,
): Promise<void> {
  if (roleSlug === RoleSlug.SUPERADMIN) {
    throw new Error('SUPERADMIN role cannot be assigned via invitation helper')
  }

  const role = await db.role.findUnique({
    where: { slug: roleSlug },
  })

  if (!role) {
    throw new Error(`${roleSlug} role missing — run database seed`)
  }

  const existing = await db.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId: role.id },
    },
  })

  if (!existing) {
    await db.userRole.create({
      data: { userId, roleId: role.id },
    })
  }
}

/**
 * Returns role slugs and permission slugs for a user.
 */
export async function getUserRolesAndPermissions(
  db: PrismaClient,
  userId: string,
): Promise<{ roles: string[]; permissions: string[] }> {
  const user = await db.user.findUnique({
    where: { id: userId },
    include: userRolesInclude,
  })

  if (!user) {
    return { roles: [], permissions: [] }
  }

  const roles = user.roles.map((ur) => ur.role.slug)
  const permissionSet = new Set<string>()

  for (const userRole of user.roles) {
    for (const rp of userRole.role.permissions) {
      permissionSet.add(rp.permission.slug)
    }
  }

  if (roles.includes(RoleSlug.SUPERADMIN)) {
    const all = await db.permission.findMany({ select: { slug: true } })
    for (const p of all) {
      permissionSet.add(p.slug)
    }
  }

  return { roles, permissions: [...permissionSet] }
}

/**
 * Returns true when the user has ADMIN or SUPERADMIN role.
 */
export async function userHasAdminAccess(db: PrismaClient, userId: string): Promise<boolean> {
  const { roles } = await getUserRolesAndPermissions(db, userId)
  return roles.some((role) => ADMIN_ROLE_SLUGS.includes(role as (typeof ADMIN_ROLE_SLUGS)[number]))
}
