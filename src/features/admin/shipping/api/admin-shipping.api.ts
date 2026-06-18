import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ADMIN_CANCEL_SHIPPING_LABEL_MUTATION,
  ADMIN_CREATE_SHIPPING_LABEL_MUTATION,
  ADMIN_REFRESH_SHIPMENT_TRACKING_MUTATION,
  ADMIN_SIMULATE_MOCK_SHIPMENT_TRACKING_MUTATION,
} from '../graphql/admin-shipping.mutations'
import { ADMIN_SHIPMENT_BY_ORDER_NUMBER_QUERY } from '../graphql/admin-shipping.queries'
import type {
  AdminCancelShippingLabelInput,
  AdminCreateShippingLabelInput,
  AdminShipment,
  AdminSimulateMockShipmentTrackingInput,
} from '../types'

type ShipmentQueryData = {
  adminShipmentByOrderNumber: AdminShipment | null
}

type CreateLabelData = { adminCreateShippingLabel: AdminShipment }
type CancelLabelData = { adminCancelShippingLabel: AdminShipment }
type RefreshTrackingData = { adminRefreshShipmentTracking: AdminShipment }
type SimulateMockTrackingData = {
  adminSimulateMockShipmentTrackingStatus: AdminShipment
}

/**
 * Fetches Skydropx shipment/label data for an order (admin only).
 */
export async function getAdminShipmentByOrderNumber(
  orderNumber: string,
): Promise<AdminShipment | null> {
  const data = await fetchGraphQL<ShipmentQueryData, { orderNumber: string }>({
    query: ADMIN_SHIPMENT_BY_ORDER_NUMBER_QUERY,
    variables: { orderNumber },
  })
  return data.adminShipmentByOrderNumber
}

/**
 * Creates a Skydropx shipping label for a paid order.
 */
export async function createAdminShippingLabel(
  input: AdminCreateShippingLabelInput,
): Promise<AdminShipment> {
  const data = await fetchGraphQL<CreateLabelData, { input: AdminCreateShippingLabelInput }>({
    query: ADMIN_CREATE_SHIPPING_LABEL_MUTATION,
    variables: { input },
  })
  return data.adminCreateShippingLabel
}

/**
 * Cancels a Skydropx label for an order.
 */
export async function cancelAdminShippingLabel(
  input: AdminCancelShippingLabelInput,
): Promise<AdminShipment> {
  const data = await fetchGraphQL<CancelLabelData, { input: AdminCancelShippingLabelInput }>({
    query: ADMIN_CANCEL_SHIPPING_LABEL_MUTATION,
    variables: { input },
  })
  return data.adminCancelShippingLabel
}

/**
 * Refreshes tracking from Skydropx for an existing shipment.
 */
export async function refreshAdminShipmentTracking(
  orderNumber: string,
): Promise<AdminShipment> {
  const data = await fetchGraphQL<RefreshTrackingData, { orderNumber: string }>({
    query: ADMIN_REFRESH_SHIPMENT_TRACKING_MUTATION,
    variables: { orderNumber },
  })
  return data.adminRefreshShipmentTracking
}

/**
 * Simulates mock shipment tracking status (SKYDROPX_MODE=mock only).
 */
export async function simulateAdminMockShipmentTracking(
  input: AdminSimulateMockShipmentTrackingInput,
): Promise<AdminShipment> {
  const data = await fetchGraphQL<
    SimulateMockTrackingData,
    { input: AdminSimulateMockShipmentTrackingInput }
  >({
    query: ADMIN_SIMULATE_MOCK_SHIPMENT_TRACKING_MUTATION,
    variables: { input },
  })
  return data.adminSimulateMockShipmentTrackingStatus
}
