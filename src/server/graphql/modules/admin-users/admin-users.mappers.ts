import { UserStatus, type Prisma } from '@prisma/client'

import type { AdminUserGql } from './admin-users.types'

export const userListInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude

export type AdminUserWithRoles = Prisma.UserGetPayload<{
  include: {
    roles: { include: { role: true } }
  }
}>

/**
 * Maps a Prisma user to a safe admin GraphQL shape (no passwords, tokens, or sessions).
 */
export function mapUserToAdminGql(user: AdminUserWithRoles): AdminUserGql {
  const roles = user.roles.map((userRole) => userRole.role.slug).sort((a, b) => a.localeCompare(b))

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    roles,
    status: user.status,
    customerTier: user.customerTier,
    emailVerified: user.emailVerified,
    isActive: user.status === UserStatus.ACTIVE && user.deletedAt == null,
    firstName: user.firstName,
    lastName: user.lastName,
    phone: user.phone,
    createdAt: user.createdAt.toISOString(),
    updatedAt: user.updatedAt.toISOString(),
  }
}
