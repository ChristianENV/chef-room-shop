import type { GraphQLContext } from '../context'
import {
  completeCheckout,
  retryCheckoutPayment,
} from '../modules/checkout/complete-checkout.service'
import { getCheckoutResultByToken } from '../modules/checkout/checkout-result.service'
import {
  getOrderByCheckoutToken,
  verifyCheckoutPaymentByToken,
} from '../modules/checkout/checkout-token-order.service'
import { claimGuestOrderByCheckoutTokenForGraphQL } from '@/src/server/orders/claim-guest-order-by-checkout-token.service'
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

type CheckoutResultByTokenArgs = {
  token: string
}

type RetryCheckoutPaymentArgs = {
  input: { token: string }
}

type OrderByCheckoutTokenArgs = {
  orderNumber: string
  token: string
}

type VerifyCheckoutPaymentByTokenArgs = {
  orderNumber: string
  token: string
}

type ClaimGuestOrderByCheckoutTokenArgs = {
  orderNumber: string
  token: string
}

export const checkoutResolvers = {
  Query: {
    orderByNumber: (
      _parent: unknown,
      args: OrderByNumberArgs,
      context: GraphQLContext,
    ) => getPublicOrderByNumber(context, args.orderNumber, args.email),

    checkoutResultByToken: (
      _parent: unknown,
      args: CheckoutResultByTokenArgs,
      context: GraphQLContext,
    ) => getCheckoutResultByToken(context, args.token),

    orderByCheckoutToken: (
      _parent: unknown,
      args: OrderByCheckoutTokenArgs,
      context: GraphQLContext,
    ) => getOrderByCheckoutToken(context, args.orderNumber, args.token),
  },
  Mutation: {
    createCheckoutOrder: (
      _parent: unknown,
      args: CreateCheckoutOrderArgs,
      context: GraphQLContext,
    ) => createCheckoutOrder(context, args.input),

    completeCheckout: (
      _parent: unknown,
      args: CreateCheckoutOrderArgs,
      context: GraphQLContext,
    ) => completeCheckout(context, args.input),

    retryCheckoutPayment: (
      _parent: unknown,
      args: RetryCheckoutPaymentArgs,
      context: GraphQLContext,
    ) => retryCheckoutPayment(context, args.input.token),

    verifyCheckoutPaymentByToken: (
      _parent: unknown,
      args: VerifyCheckoutPaymentByTokenArgs,
      context: GraphQLContext,
    ) => verifyCheckoutPaymentByToken(context, args.orderNumber, args.token),

    claimGuestOrderByCheckoutToken: (
      _parent: unknown,
      args: ClaimGuestOrderByCheckoutTokenArgs,
      context: GraphQLContext,
    ) =>
      claimGuestOrderByCheckoutTokenForGraphQL(
        context,
        args.orderNumber,
        args.token,
      ),
  },
}
