import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  COMPLETE_CHECKOUT_MUTATION,
  CREATE_CHECKOUT_ORDER_MUTATION,
  CLAIM_GUEST_ORDER_BY_CHECKOUT_TOKEN_MUTATION,
  REQUEST_ORDER_CLAIM_TRANSFER_MUTATION,
  RETRY_CHECKOUT_PAYMENT_MUTATION,
  VERIFY_CHECKOUT_PAYMENT_BY_TOKEN_MUTATION,
} from '../graphql/checkout.mutations'
import { CREATE_CONEKTA_CHECKOUT_MUTATION } from '../graphql/conekta.mutations'
import {
  CHECKOUT_RESULT_BY_TOKEN_QUERY,
  ORDER_BY_CHECKOUT_TOKEN_QUERY,
  ORDER_BY_NUMBER_QUERY,
} from '../graphql/checkout.queries'
import type {
  CheckoutOrderPayload,
  CheckoutResult,
  ClaimGuestOrderPayload,
  CompleteCheckoutPayload,
  ConektaCheckoutPayload,
  CreateCheckoutOrderInput,
  CreateConektaCheckoutInput,
  OrderClaimTransferPayload,
  PublicOrder,
} from '../types'
import type { AccountOrder, AccountPaymentStatusPayload } from '@/src/features/storefront/account/types'

type CreateCheckoutOrderData = { createCheckoutOrder: CheckoutOrderPayload }
type CompleteCheckoutData = { completeCheckout: CompleteCheckoutPayload }
type RetryCheckoutPaymentData = { retryCheckoutPayment: CompleteCheckoutPayload }
type CreateConektaCheckoutData = { createConektaCheckout: ConektaCheckoutPayload }
type OrderByNumberData = { orderByNumber: PublicOrder | null }
type CheckoutResultByTokenData = { checkoutResultByToken: CheckoutResult | null }
type OrderByCheckoutTokenData = {
  orderByCheckoutToken: {
    order: AccountOrder
    returnTokenValid: boolean
    tokenExpired: boolean
    viewerEmailMatchesOrder: boolean
    maskedCustomerEmail: string
  } | null
}
type VerifyCheckoutPaymentByTokenData = {
  verifyCheckoutPaymentByToken: AccountPaymentStatusPayload
}
type ClaimGuestOrderByCheckoutTokenData = {
  claimGuestOrderByCheckoutToken: ClaimGuestOrderPayload
}
type RequestOrderClaimTransferData = {
  requestOrderClaimTransfer: OrderClaimTransferPayload
}

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

export type CheckoutOrderDetailAccess = {
  order: AccountOrder
  returnTokenValid: boolean
  tokenExpired: boolean
  viewerEmailMatchesOrder: boolean
  maskedCustomerEmail: string
}

/**
 * Token-scoped order detail for post-checkout guest access.
 */
export async function getOrderByCheckoutToken(
  orderNumber: string,
  token: string,
): Promise<CheckoutOrderDetailAccess | null> {
  const data = await fetchGraphQL<
    OrderByCheckoutTokenData,
    { orderNumber: string; token: string }
  >({
    query: ORDER_BY_CHECKOUT_TOKEN_QUERY,
    variables: { orderNumber, token },
  })
  return data.orderByCheckoutToken
}

/**
 * Token-scoped Conekta payment verification (same sync as verifyMyOrderPayment).
 */
export async function verifyCheckoutPaymentByToken(
  orderNumber: string,
  token: string,
): Promise<AccountPaymentStatusPayload> {
  const data = await fetchGraphQL<
    VerifyCheckoutPaymentByTokenData,
    { orderNumber: string; token: string }
  >({
    query: VERIFY_CHECKOUT_PAYMENT_BY_TOKEN_MUTATION,
    variables: { orderNumber, token },
  })
  return data.verifyCheckoutPaymentByToken
}

/**
 * Links a guest checkout order to the authenticated user via checkout return token.
 */
export async function claimGuestOrderByCheckoutToken(
  orderNumber: string,
  token: string,
): Promise<ClaimGuestOrderPayload> {
  const data = await fetchGraphQL<
    ClaimGuestOrderByCheckoutTokenData,
    { orderNumber: string; token: string }
  >({
    query: CLAIM_GUEST_ORDER_BY_CHECKOUT_TOKEN_MUTATION,
    variables: { orderNumber, token },
  })
  return data.claimGuestOrderByCheckoutToken
}

/**
 * Sends an authorization email to the original order email for cross-account linking.
 */
export async function requestOrderClaimTransfer(
  orderNumber: string,
  checkoutToken: string,
): Promise<OrderClaimTransferPayload> {
  const data = await fetchGraphQL<
    RequestOrderClaimTransferData,
    { orderNumber: string; checkoutToken: string }
  >({
    query: REQUEST_ORDER_CLAIM_TRANSFER_MUTATION,
    variables: { orderNumber, checkoutToken },
  })
  return data.requestOrderClaimTransfer
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
