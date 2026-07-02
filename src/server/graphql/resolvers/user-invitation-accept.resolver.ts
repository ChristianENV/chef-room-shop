import type { GraphQLContext } from '../context'
import {
  acceptUserInvitation,
  previewUserInvitation,
} from '@/src/server/invitations/user-invitation-accept.service'
import { parseUserInvitationToken } from '@/src/server/graphql/modules/user-invitation-accept/user-invitation-accept.validation'

type TokenArgs = {
  token: string
}

export const userInvitationAcceptResolvers = {
  Query: {
    previewUserInvitation: (_parent: unknown, args: TokenArgs, context: GraphQLContext) => {
      const token = parseUserInvitationToken(args.token)
      return previewUserInvitation(context, token)
    },
  },
  Mutation: {
    acceptUserInvitation: (_parent: unknown, args: TokenArgs, context: GraphQLContext) => {
      const token = parseUserInvitationToken(args.token)
      return acceptUserInvitation(context, token)
    },
  },
}
