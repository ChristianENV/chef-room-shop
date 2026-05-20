import type { GraphQLContext } from '../context'
import {
  createCheckoutOrder,
  getPublicOrderByNumber,
} from '../modules/checkout/checkout.service'
import type { CreateCheckoutOrderInput } from '../modules/checkout/checkout.types'

type CreateCheckoutOrderArgs = {
  input: CreateCheckoutOrderInput
}

type OrderByNumberArgs = {
  orderNumber: string
  email: string
}

export const checkoutResolvers = {
  Query: {
    orderByNumber: (
      _parent: unknown,
      args: OrderByNumberArgs,
      context: GraphQLContext,
    ) => getPublicOrderByNumber(context, args.orderNumber, args.email),
  },
  Mutation: {
    createCheckoutOrder: (
      _parent: unknown,
      args: CreateCheckoutOrderArgs,
      context: GraphQLContext,
    ) => createCheckoutOrder(context, args.input),
  },
}
