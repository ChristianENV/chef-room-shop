import type { GraphQLContext } from '../context'
import {
  createShippingQuote,
  getShippingQuoteById,
  refreshShippingQuote,
  selectShippingRate,
} from '../modules/shipping/shipping.service'
import type { CreateShippingQuoteInput } from '../modules/shipping/shipping.types'

type CreateShippingQuoteArgs = { input: CreateShippingQuoteInput }
type ShippingQuoteByIdArgs = { id: string }
type RefreshShippingQuoteArgs = { id: string }
type SelectShippingRateArgs = { rateId: string }

export const shippingResolvers = {
  Query: {
    shippingQuoteById: async (
      _parent: unknown,
      args: ShippingQuoteByIdArgs,
      context: GraphQLContext,
    ) => {
      const payload = await getShippingQuoteById(context, args.id)
      return payload?.quote ?? null
    },
  },
  Mutation: {
    createShippingQuote: (
      _parent: unknown,
      args: CreateShippingQuoteArgs,
      context: GraphQLContext,
    ) => createShippingQuote(context, args.input),
    refreshShippingQuote: (
      _parent: unknown,
      args: RefreshShippingQuoteArgs,
      context: GraphQLContext,
    ) => refreshShippingQuote(context, args.id),
    selectShippingRate: (
      _parent: unknown,
      args: SelectShippingRateArgs,
      context: GraphQLContext,
    ) => selectShippingRate(context, args.rateId),
  },
}
