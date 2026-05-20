import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { CREATE_CHECKOUT_ORDER_MUTATION } from '../graphql/checkout.mutations'
import { CREATE_CONEKTA_CHECKOUT_MUTATION } from '../graphql/conekta.mutations'
import { ORDER_BY_NUMBER_QUERY } from '../graphql/checkout.queries'
import type {
  CheckoutOrderPayload,
  ConektaCheckoutPayload,
  CreateCheckoutOrderInput,
  CreateConektaCheckoutInput,
  PublicOrder,
} from '../types'

type CreateCheckoutOrderData = { createCheckoutOrder: CheckoutOrderPayload }
type CreateConektaCheckoutData = { createConektaCheckout: ConektaCheckoutPayload }
type OrderByNumberData = { orderByNumber: PublicOrder | null }

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
