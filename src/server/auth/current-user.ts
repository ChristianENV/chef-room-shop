import 'server-only'

import type { RoleSlug } from '@prisma/client'
import { headers } from 'next/headers'

import { prisma } from '@/src/server/db/prisma'

import { auth } from './better-auth'
import type { CurrentUser } from './types'

type UserWithRoles = {
  id: string
  email: string
  name: string
  firstName: string | null
  lastName: string | null
  phone: string | null
  image: string | null
  deletedAt: Date | null
  roles: {
    role: {
      slug: RoleSlug
      permissions: { permission: { slug: string } }[]
    }
  }[]
}

/**
 * Maps a Prisma user (with RBAC) to {@link CurrentUser}.
 */
export function mapPrismaUserToCurrentUser(user: UserWithRoles): CurrentUser {
  const roles: RoleSlug[] = user.roles.map((ur) => ur.role.slug)
  const permissionSet = new Set<string>()

  for (const userRole of user.roles) {
    for (const rp of userRole.role.permissions) {
      permissionSet.add(rp.permission.slug)
    }
  }

  return {
    id: user.id,
    email: user.email,
    name: user.name,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    image: user.image,
    roles,
    permissions: [...permissionSet],
  }
}

const userWithRolesInclude = {
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
 * Resolves the authenticated user via Better Auth session + RBAC, or null.
 */
export async function getCurrentUser(): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
    },
    include: userWithRolesInclude,
  })

  if (!user) {
    return null
  }

  return mapPrismaUserToCurrentUser(user)
}

/**
 * Resolves current user from request headers (e.g. GraphQL context).
 */
export async function getCurrentUserFromHeaders(
  requestHeaders: Headers,
): Promise<CurrentUser | null> {
  const session = await auth.api.getSession({
    headers: requestHeaders,
  })

  if (!session?.user?.id) {
    return null
  }

  const user = await prisma.user.findFirst({
    where: {
      id: session.user.id,
      deletedAt: null,
    },
    include: userWithRolesInclude,
  })

  if (!user) {
    return null
  }

  return mapPrismaUserToCurrentUser(user)
}
