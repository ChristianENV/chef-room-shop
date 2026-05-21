import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  CREATE_SHIPPING_QUOTE_MUTATION,
  REFRESH_SHIPPING_QUOTE_MUTATION,
  SELECT_SHIPPING_RATE_MUTATION,
} from '../graphql/shipping.mutations'
import { SHIPPING_QUOTE_BY_ID_QUERY } from '../graphql/shipping.queries'
import type {
  CreateShippingQuoteInput,
  ShippingQuote,
  ShippingQuotePayload,
} from '../types'

type ShippingQuoteByIdData = { shippingQuoteById: ShippingQuote | null }
type CreateShippingQuoteData = { createShippingQuote: ShippingQuotePayload }
type RefreshShippingQuoteData = { refreshShippingQuote: ShippingQuotePayload }
type SelectShippingRateData = { selectShippingRate: ShippingQuotePayload }

/**
 * Fetches a shipping quote by id (owner must match session).
 */
export async function getShippingQuoteById(id: string): Promise<ShippingQuote | null> {
  const data = await fetchGraphQL<ShippingQuoteByIdData, { id: string }>({
    query: SHIPPING_QUOTE_BY_ID_QUERY,
    variables: { id },
  })
  return data.shippingQuoteById
}

/**
 * Creates a Skydropx-backed quote for the active cart and destination CP.
 */
export async function createShippingQuote(
  input: CreateShippingQuoteInput,
): Promise<ShippingQuotePayload> {
  const data = await fetchGraphQL<
    CreateShippingQuoteData,
    { input: CreateShippingQuoteInput }
  >({
    query: CREATE_SHIPPING_QUOTE_MUTATION,
    variables: { input },
  })
  return data.createShippingQuote
}

/**
 * Polls Skydropx for updated rates on an existing quote.
 */
export async function refreshShippingQuote(id: string): Promise<ShippingQuotePayload> {
  const data = await fetchGraphQL<RefreshShippingQuoteData, { id: string }>({
    query: REFRESH_SHIPPING_QUOTE_MUTATION,
    variables: { id },
  })
  return data.refreshShippingQuote
}

/**
 * Marks a rate as selected for a quote (checkout integration pending).
 */
export async function selectShippingRate(rateId: string): Promise<ShippingQuotePayload> {
  const data = await fetchGraphQL<SelectShippingRateData, { rateId: string }>({
    query: SELECT_SHIPPING_RATE_MUTATION,
    variables: { rateId },
  })
  return data.selectShippingRate
}
