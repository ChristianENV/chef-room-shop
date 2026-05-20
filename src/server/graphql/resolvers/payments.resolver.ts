import type { GraphQLContext } from '../context'
import { createConektaCheckout } from '../modules/payments/payments.service'
import type { CreateConektaCheckoutInput } from '../modules/payments/payments.types'

type CreateConektaCheckoutArgs = {
  input: CreateConektaCheckoutInput
}

export const paymentsResolvers = {
  Mutation: {
    createConektaCheckout: (
      _parent: unknown,
      args: CreateConektaCheckoutArgs,
      context: GraphQLContext,
    ) => createConektaCheckout(context, args.input),
  },
}
