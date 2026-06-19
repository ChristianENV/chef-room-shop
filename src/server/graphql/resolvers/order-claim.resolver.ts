import type { GraphQLContext } from '../context'
import { claimOrder, getOrderClaimPreview } from '../modules/order-claim/order-claim.service'

type OrderClaimTokenArgs = {
  token: string
}

export const orderClaimResolvers = {
  Query: {
    orderClaimPreview: (_parent: unknown, args: OrderClaimTokenArgs, context: GraphQLContext) =>
      getOrderClaimPreview(context, args.token),
  },

  Mutation: {
    claimOrder: (_parent: unknown, args: OrderClaimTokenArgs, context: GraphQLContext) =>
      claimOrder(context, args.token),
  },
}
