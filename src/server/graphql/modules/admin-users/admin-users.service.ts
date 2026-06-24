import { Prisma, RoleSlug, UserStatus } from '@prisma/client'

import type { GraphQLContext } from '../../context'
import { requireAdminGraphQL } from './admin-users.auth'
import { mapUserToAdminGql } from './admin-users.mappers'
import type { AdminUsersListInput, AdminUsersPayloadGql } from './admin-users.types'
import { parseAdminUsersListInput } from './admin-users.validation'

const userListInclude = {
  roles: { include: { role: true } },
} satisfies Prisma.UserInclude

function buildSearchWhere(search: string): Prisma.UserWhereInput {
  const term = search.trim()
  return {
    OR: [
      { name: { contains: term, mode: 'insensitive' } },
      { email: { contains: term, mode: 'insensitive' } },
      { firstName: { contains: term, mode: 'insensitive' } },
      { lastName: { contains: term, mode: 'insensitive' } },
    ],
  }
}

function buildListWhere(filter: AdminUsersListInput['filter']): Prisma.UserWhereInput {
  const and: Prisma.UserWhereInput[] = [{ deletedAt: null }]

  if (filter?.search?.trim()) {
    and.push(buildSearchWhere(filter.search))
  }

  if (filter?.role) {
    and.push({
      roles: { some: { role: { slug: filter.role as RoleSlug } } },
    })
  }

  if (filter?.status) {
    and.push({ status: filter.status as UserStatus })
  }

  return { AND: and }
}

/**
 * Read-only paginated user list for admin panel.
 */
export async function getAdminUsers(
  context: GraphQLContext,
  input: AdminUsersListInput,
): Promise<AdminUsersPayloadGql> {
  requireAdminGraphQL(context)

  const { filter, limit, offset } = parseAdminUsersListInput(input)
  const where = buildListWhere(filter)

  const [users, total] = await Promise.all([
    context.prisma.user.findMany({
      where,
      include: userListInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    context.prisma.user.count({ where }),
  ])

  return {
    total,
    items: users.map(mapUserToAdminGql),
  }
}
