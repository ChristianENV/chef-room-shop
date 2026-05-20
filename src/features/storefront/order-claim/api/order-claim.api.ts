import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import { CLAIM_ORDER_MUTATION } from '../graphql/order-claim.mutations'
import { ORDER_CLAIM_PREVIEW_QUERY } from '../graphql/order-claim.queries'
import type { OrderClaimPayload, OrderClaimPreview } from '../types'

type OrderClaimPreviewData = { orderClaimPreview: OrderClaimPreview | null }
type ClaimOrderData = { claimOrder: OrderClaimPayload }

/**
 * Fetches minimal preview for a claim token (no auth required).
 */
export async function getOrderClaimPreview(
  token: string,
): Promise<OrderClaimPreview | null> {
  const data = await fetchGraphQL<OrderClaimPreviewData, { token: string }>({
    query: ORDER_CLAIM_PREVIEW_QUERY,
    variables: { token },
  })
  return data.orderClaimPreview
}

/**
 * Links the guest order to the authenticated user (requires session).
 */
export async function claimOrder(token: string): Promise<OrderClaimPayload> {
  const data = await fetchGraphQL<ClaimOrderData, { token: string }>({
    query: CLAIM_ORDER_MUTATION,
    variables: { token },
  })
  return data.claimOrder
}
