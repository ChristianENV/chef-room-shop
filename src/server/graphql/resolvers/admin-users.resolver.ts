import type { GraphQLContext } from '../context'
import { getAdminUserById, getAdminUsers } from '../modules/admin-users/admin-users.service'
import {
  blockAdminUser,
  pauseAdminUser,
  reactivateAdminUser,
  updateAdminUser,
} from '../modules/admin-users/admin-users.mutations'
import type {
  AdminUsersListInput,
  UpdateAdminUserInput,
} from '../modules/admin-users/admin-users.types'

export const adminUsersResolvers = {
  Query: {
    adminUsers: (_parent: unknown, args: AdminUsersListInput, context: GraphQLContext) =>
      getAdminUsers(context, args),
    adminUser: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
      getAdminUserById(context, args.id),
  },
  Mutation: {
    updateAdminUser: (
      _parent: unknown,
      args: { input: UpdateAdminUserInput },
      context: GraphQLContext,
    ) => updateAdminUser(context, args.input),
    pauseAdminUser: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
      pauseAdminUser(context, args.id),
    blockAdminUser: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
      blockAdminUser(context, args.id),
    reactivateAdminUser: (_parent: unknown, args: { id: string }, context: GraphQLContext) =>
      reactivateAdminUser(context, args.id),
  },
}
