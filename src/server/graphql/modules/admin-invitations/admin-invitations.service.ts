import { Prisma, RoleSlug, UserInvitationStatus } from '@prisma/client'

import type { GraphQLContext } from '../../context'
import { requireUsersReadGraphQL } from '../admin-users/admin-users.auth'
import { invitationInclude, mapUserInvitationToGql } from './admin-invitations.mappers'
import type {
  AdminUserInvitationsListInput,
  AdminUserInvitationsPayloadGql,
} from './admin-invitations.types'
import { parseAdminUserInvitationsListInput } from './admin-invitations.validation'

function buildSearchWhere(search: string): Prisma.UserInvitationWhereInput {
  const term = search.trim()
  return {
    email: { contains: term, mode: 'insensitive' },
  }
}

function buildListWhere(
  filter: AdminUserInvitationsListInput['filter'],
): Prisma.UserInvitationWhereInput {
  const and: Prisma.UserInvitationWhereInput[] = []

  if (filter?.search?.trim()) {
    and.push(buildSearchWhere(filter.search))
  }

  if (filter?.status) {
    and.push({ status: filter.status as UserInvitationStatus })
  }

  if (filter?.targetRole) {
    and.push({ targetRole: filter.targetRole as RoleSlug })
  }

  return and.length > 0 ? { AND: and } : {}
}

/**
 * Marks a single PENDING invitation as EXPIRED when past expiresAt.
 */
export async function markInvitationExpiredIfNeeded(
  context: GraphQLContext,
  invitationId: string,
  status: UserInvitationStatus,
  expiresAt: Date,
): Promise<UserInvitationStatus> {
  if (status !== UserInvitationStatus.PENDING) {
    return status
  }

  if (expiresAt.getTime() >= Date.now()) {
    return status
  }

  await context.prisma.userInvitation.update({
    where: { id: invitationId },
    data: { status: UserInvitationStatus.EXPIRED },
  })

  return UserInvitationStatus.EXPIRED
}

/**
 * Paginated admin invitation list (requires users.read).
 */
export async function getAdminUserInvitations(
  context: GraphQLContext,
  input: AdminUserInvitationsListInput,
): Promise<AdminUserInvitationsPayloadGql> {
  requireUsersReadGraphQL(context)

  const { filter, limit, offset } = parseAdminUserInvitationsListInput(input)
  const where = buildListWhere(filter)

  const [invitations, total] = await Promise.all([
    context.prisma.userInvitation.findMany({
      where,
      include: invitationInclude,
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    context.prisma.userInvitation.count({ where }),
  ])

  const items = await Promise.all(
    invitations.map(async (invitation) => {
      const resolvedStatus = await markInvitationExpiredIfNeeded(
        context,
        invitation.id,
        invitation.status,
        invitation.expiresAt,
      )
      return mapUserInvitationToGql({
        ...invitation,
        status: resolvedStatus,
      })
    }),
  )

  return { total, items }
}
