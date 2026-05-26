import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  COMPLETE_CHECKOUT_MUTATION,
  CREATE_CHECKOUT_ORDER_MUTATION,
  RETRY_CHECKOUT_PAYMENT_MUTATION,
} from '../graphql/checkout.mutations'
import { CREATE_CONEKTA_CHECKOUT_MUTATION } from '../graphql/conekta.mutations'
import {
  CHECKOUT_RESULT_BY_TOKEN_QUERY,
  ORDER_BY_NUMBER_QUERY,
} from '../graphql/checkout.queries'
import type {
  CheckoutOrderPayload,
  CheckoutResult,
  CompleteCheckoutPayload,
  ConektaCheckoutPayload,
  CreateCheckoutOrderInput,
  CreateConektaCheckoutInput,
  PublicOrder,
} from '../types'

type CreateCheckoutOrderData = { createCheckoutOrder: CheckoutOrderPayload }
type CompleteCheckoutData = { completeCheckout: CompleteCheckoutPayload }
type RetryCheckoutPaymentData = { retryCheckoutPayment: CompleteCheckoutPayload }
type CreateConektaCheckoutData = { createConektaCheckout: ConektaCheckoutPayload }
type OrderByNumberData = { orderByNumber: PublicOrder | null }
type CheckoutResultByTokenData = { checkoutResultByToken: CheckoutResult | null }

/**
 * Creates an order from the active cart (PENDING_PAYMENT, no Conekta charge).
 */
export async function createCheckoutOrder(
  input: CreateCheckoutOrderInput,
): Promise<CheckoutOrderPayload> {
  const data = await fetchGraphQL<
    CreateCheckoutOrderData,
    { input: CreateCheckoutOrderInput }
  >({
    query: CREATE_CHECKOUT_ORDER_MUTATION,
    variables: { input },
  })
  return data.createCheckoutOrder
}

/**
 * Creates order + Conekta checkout and returns payment redirect URL.
 */
export async function completeCheckout(
  input: CreateCheckoutOrderInput,
): Promise<CompleteCheckoutPayload> {
  const data = await fetchGraphQL<
    CompleteCheckoutData,
    { input: CreateCheckoutOrderInput }
  >({
    query: COMPLETE_CHECKOUT_MUTATION,
    variables: { input },
  })
  return data.completeCheckout
}

/**
 * Retries Conekta checkout for an existing order using return token.
 */
export async function retryCheckoutPayment(returnToken: string): Promise<CompleteCheckoutPayload> {
  const data = await fetchGraphQL<
    RetryCheckoutPaymentData,
    { input: { token: string } }
  >({
    query: RETRY_CHECKOUT_PAYMENT_MUTATION,
    variables: { input: { token: returnToken } },
  })
  return data.retryCheckoutPayment
}

/**
 * Looks up checkout result by opaque return token (no email required).
 */
export async function getCheckoutResultByToken(token: string): Promise<CheckoutResult | null> {
  const data = await fetchGraphQL<CheckoutResultByTokenData, { token: string }>({
    query: CHECKOUT_RESULT_BY_TOKEN_QUERY,
    variables: { token },
  })
  return data.checkoutResultByToken
}

/**
 * Looks up an order by number and customer email (public confirmation).
 */
export async function getOrderByNumber(
  orderNumber: string,
  email: string,
): Promise<PublicOrder | null> {
  const data = await fetchGraphQL<OrderByNumberData, { orderNumber: string; email: string }>(
    {
      query: ORDER_BY_NUMBER_QUERY,
      variables: { orderNumber, email },
    },
  )
  return data.orderByNumber
}

/**
 * Starts Conekta HostedPayment checkout for an existing order (server-side Conekta call).
 */
export async function createConektaCheckout(
  input: CreateConektaCheckoutInput,
): Promise<ConektaCheckoutPayload> {
  const data = await fetchGraphQL<
    CreateConektaCheckoutData,
    { input: CreateConektaCheckoutInput }
  >({
    query: CREATE_CONEKTA_CHECKOUT_MUTATION,
    variables: { input },
  })
  return data.createConektaCheckout
}
