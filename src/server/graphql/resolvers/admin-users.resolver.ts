import type { GraphQLContext } from '../context'
import { getAdminUsers } from '../modules/admin-users/admin-users.service'
import type { AdminUsersListInput } from '../modules/admin-users/admin-users.types'

export const adminUsersResolvers = {
  Query: {
    adminUsers: (_parent: unknown, args: AdminUsersListInput, context: GraphQLContext) =>
      getAdminUsers(context, args),
  },
}
