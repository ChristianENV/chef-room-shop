import type { GraphQLContext } from '../context'
import {
  createUserInvitation,
  resendUserInvitation,
  revokeUserInvitation,
} from '../modules/admin-invitations/admin-invitations.mutations'
import { getAdminUserInvitations } from '../modules/admin-invitations/admin-invitations.service'
import type {
  AdminUserInvitationsListInput,
  CreateUserInvitationInput,
  ResendUserInvitationInput,
  RevokeUserInvitationInput,
} from '../modules/admin-invitations/admin-invitations.types'

export const adminInvitationsResolvers = {
  Query: {
    adminUserInvitations: (
      _parent: unknown,
      args: AdminUserInvitationsListInput,
      context: GraphQLContext,
    ) => getAdminUserInvitations(context, args),
  },
  Mutation: {
    createUserInvitation: (
      _parent: unknown,
      args: { input: CreateUserInvitationInput },
      context: GraphQLContext,
    ) => createUserInvitation(context, args.input),
    revokeUserInvitation: (
      _parent: unknown,
      args: { input: RevokeUserInvitationInput },
      context: GraphQLContext,
    ) => revokeUserInvitation(context, args.input),
    resendUserInvitation: (
      _parent: unknown,
      args: { input: ResendUserInvitationInput },
      context: GraphQLContext,
    ) => resendUserInvitation(context, args.input),
  },
}
