import { RoleSlug } from '@prisma/client'
import type { PrismaClient } from '@prisma/client'

import { ADMIN_ROLE_SLUGS } from './permissions'

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
export async function ensureCustomerRole(
  db: PrismaClient,
  userId: string,
): Promise<void> {
  const customerRole = await db.role.findUnique({
    where: { slug: RoleSlug.CUSTOMER },
  })

  if (!customerRole) {
    throw new Error('CUSTOMER role missing — run database seed')
  }

  const existing = await db.userRole.findUnique({
    where: {
      userId_roleId: { userId, roleId: customerRole.id },
    },
  })

  if (!existing) {
    await db.userRole.create({
      data: { userId, roleId: customerRole.id },
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
export async function userHasAdminAccess(
  db: PrismaClient,
  userId: string,
): Promise<boolean> {
  const { roles } = await getUserRolesAndPermissions(db, userId)
  return roles.some((role) =>
    ADMIN_ROLE_SLUGS.includes(role as (typeof ADMIN_ROLE_SLUGS)[number]),
  )
}
