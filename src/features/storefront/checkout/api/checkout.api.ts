import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { CREATE_CHECKOUT_ORDER_MUTATION } from '../graphql/checkout.mutations'
import { ORDER_BY_NUMBER_QUERY } from '../graphql/checkout.queries'
import type {
  CheckoutOrderPayload,
  CreateCheckoutOrderInput,
  PublicOrder,
} from '../types'

type CreateCheckoutOrderData = { createCheckoutOrder: CheckoutOrderPayload }
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
