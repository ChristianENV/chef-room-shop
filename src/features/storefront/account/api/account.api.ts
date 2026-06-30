import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  CREATE_MY_ADDRESS_MUTATION,
  DELETE_MY_ADDRESS_MUTATION,
  RETRY_MY_ORDER_PAYMENT_MUTATION,
  SET_DEFAULT_ADDRESS_MUTATION,
  UPDATE_MY_ADDRESS_MUTATION,
  UPDATE_MY_PROFILE_MUTATION,
  VERIFY_MY_ORDER_PAYMENT_MUTATION,
} from '../graphql/account.mutations'
import {
  ME_PROFILE_QUERY,
  MY_ACCOUNT_SUMMARY_QUERY,
  MY_ADDRESSES_QUERY,
  MY_DESIGNS_QUERY,
  MY_ORDER_BY_NUMBER_QUERY,
  MY_ORDERS_QUERY,
} from '../graphql/account.queries'
import { normalizeAccountOrder } from '../order-detail/order-detail.utils'
import type {
  AccountAddress,
  AccountDashboardSummary,
  AccountDesign,
  AccountOrder,
  AccountPaymentStatusPayload,
  AccountUser,
  MyAddressInput,
  UpdateMyProfileInput,
} from '../types'

type MeProfileData = { meProfile: AccountUser }
type MyAccountSummaryData = { myAccountSummary: AccountDashboardSummary }
type MyOrdersData = { myOrders: AccountOrder[] }
type MyOrderByNumberData = { myOrderByNumber: AccountOrder | null }
type MyDesignsData = { myDesigns: AccountDesign[] }
type MyAddressesData = { myAddresses: AccountAddress[] }

/**
 * Fetches the authenticated user's profile.
 */
export async function getMeProfile(): Promise<AccountUser> {
  const data = await fetchGraphQL<MeProfileData>({ query: ME_PROFILE_QUERY })
  return data.meProfile
}

/**
 * Fetches account dashboard summary.
 */
export async function getMyAccountSummary(): Promise<AccountDashboardSummary> {
  const data = await fetchGraphQL<MyAccountSummaryData>({
    query: MY_ACCOUNT_SUMMARY_QUERY,
  })
  return data.myAccountSummary
}

/**
 * Fetches the authenticated user's orders.
 */
export async function getMyOrders(params?: {
  limit?: number
  offset?: number
}): Promise<AccountOrder[]> {
  const data = await fetchGraphQL<MyOrdersData, typeof params>({
    query: MY_ORDERS_QUERY,
    variables: params,
  })
  return data.myOrders.map(normalizeAccountOrder)
}

/**
 * Fetches a single order by order number.
 */
export async function getMyOrderByNumber(orderNumber: string): Promise<AccountOrder | null> {
  const data = await fetchGraphQL<MyOrderByNumberData, { orderNumber: string }>({
    query: MY_ORDER_BY_NUMBER_QUERY,
    variables: { orderNumber },
  })
  return data.myOrderByNumber ? normalizeAccountOrder(data.myOrderByNumber) : null
}

/**
 * Fetches the authenticated user's saved designs.
 */
export async function getMyDesigns(params?: {
  limit?: number
  offset?: number
  status?: string
}): Promise<AccountDesign[]> {
  const data = await fetchGraphQL<MyDesignsData, typeof params>({
    query: MY_DESIGNS_QUERY,
    variables: params,
  })
  return data.myDesigns
}

/**
 * Fetches the authenticated user's addresses.
 */
export async function getMyAddresses(): Promise<AccountAddress[]> {
  const data = await fetchGraphQL<MyAddressesData>({ query: MY_ADDRESSES_QUERY })
  return data.myAddresses
}

/**
 * Updates the authenticated user's profile.
 */
export async function updateMyProfile(input: UpdateMyProfileInput): Promise<AccountUser> {
  const data = await fetchGraphQL<
    { updateMyProfile: AccountUser },
    { input: UpdateMyProfileInput }
  >({
    query: UPDATE_MY_PROFILE_MUTATION,
    variables: { input },
  })
  return data.updateMyProfile
}

/**
 * Creates a new address for the authenticated user.
 */
export async function createMyAddress(input: MyAddressInput): Promise<AccountAddress> {
  const data = await fetchGraphQL<{ createMyAddress: AccountAddress }, { input: MyAddressInput }>({
    query: CREATE_MY_ADDRESS_MUTATION,
    variables: { input },
  })
  return data.createMyAddress
}

/**
 * Updates an address for the authenticated user.
 */
export async function updateMyAddress(id: string, input: MyAddressInput): Promise<AccountAddress> {
  const data = await fetchGraphQL<
    { updateMyAddress: AccountAddress },
    { id: string; input: MyAddressInput }
  >({
    query: UPDATE_MY_ADDRESS_MUTATION,
    variables: { id, input },
  })
  return data.updateMyAddress
}

/**
 * Soft-deletes an address for the authenticated user.
 */
export async function deleteMyAddress(id: string): Promise<boolean> {
  const data = await fetchGraphQL<{ deleteMyAddress: boolean }, { id: string }>({
    query: DELETE_MY_ADDRESS_MUTATION,
    variables: { id },
  })
  return data.deleteMyAddress
}

/**
 * Sets the default address for a type.
 */
export async function setDefaultAddress(id: string, type: string): Promise<AccountAddress> {
  const data = await fetchGraphQL<
    { setDefaultAddress: AccountAddress },
    { id: string; type: string }
  >({
    query: SET_DEFAULT_ADDRESS_MUTATION,
    variables: { id, type },
  })
  return data.setDefaultAddress
}

type VerifyMyOrderPaymentData = {
  verifyMyOrderPayment: AccountPaymentStatusPayload
}

type RetryMyOrderPaymentData = {
  retryMyOrderPayment: AccountPaymentStatusPayload
}

/**
 * Manually verifies payment status with Conekta for an owned order.
 */
export async function verifyMyOrderPayment(
  orderNumber: string,
): Promise<AccountPaymentStatusPayload> {
  const data = await fetchGraphQL<VerifyMyOrderPaymentData, { orderNumber: string }>({
    query: VERIFY_MY_ORDER_PAYMENT_MUTATION,
    variables: { orderNumber },
  })
  return data.verifyMyOrderPayment
}

/**
 * Retries Conekta checkout for an owned order (no new order).
 */
export async function retryMyOrderPayment(
  orderNumber: string,
): Promise<AccountPaymentStatusPayload> {
  const data = await fetchGraphQL<RetryMyOrderPaymentData, { orderNumber: string }>({
    query: RETRY_MY_ORDER_PAYMENT_MUTATION,
    variables: { orderNumber },
  })
  return data.retryMyOrderPayment
}
