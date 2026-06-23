import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  ADD_ADMIN_ORDER_NOTE_MUTATION,
  ADD_ADMIN_ORDER_TRACKING_MUTATION,
  CANCEL_ADMIN_ORDER_MUTATION,
  MARK_ADMIN_ORDER_READY_TO_SHIP_MUTATION,
  MOVE_ADMIN_ORDER_TO_PRODUCTION_MUTATION,
  UPDATE_ADMIN_ORDER_STATUS_MUTATION,
} from '../graphql/admin-orders.mutations'
import {
  ADMIN_ORDER_BY_NUMBER_QUERY,
  ADMIN_ORDER_PRODUCTION_QUEUE_QUERY,
  ADMIN_ORDER_PRODUCTION_SHEET_QUERY,
  ADMIN_ORDER_STATUS_SUMMARY_QUERY,
  ADMIN_ORDERS_QUERY,
} from '../graphql/admin-orders.queries'
import type {
  AddAdminOrderNoteInput,
  AddAdminOrderTrackingInput,
  AdminOrder,
  AdminOrdersListVariables,
  AdminOrdersPayload,
  AdminOrderStatusSummary,
  AdminProductionSheet,
  UpdateAdminOrderStatusInput,
} from '../types'

type AdminOrdersData = { adminOrders: AdminOrdersPayload }
type AdminOrderDetailData = { adminOrderByNumber: AdminOrder | null }
type StatusSummaryData = { adminOrderStatusSummary: AdminOrderStatusSummary }
type ProductionQueueData = { adminOrderProductionQueue: AdminOrder[] }
type ProductionSheetData = { adminOrderProductionSheet: AdminProductionSheet }

type OrderMutationData = {
  updateAdminOrderStatus?: AdminOrder
  moveAdminOrderToProduction?: AdminOrder
  markAdminOrderReadyToShip?: AdminOrder
  addAdminOrderTracking?: AdminOrder
  cancelAdminOrder?: AdminOrder
  addAdminOrderNote?: AdminOrder
}

/**
 * Lists admin orders with optional filters and pagination.
 */
export async function getAdminOrders(
  variables?: AdminOrdersListVariables,
): Promise<AdminOrdersPayload> {
  const data = await fetchGraphQL<AdminOrdersData, AdminOrdersListVariables>({
    query: ADMIN_ORDERS_QUERY,
    variables,
  })
  return data.adminOrders
}

/**
 * Fetches a single order by order number for admin detail views.
 */
export async function getAdminOrderByNumber(orderNumber: string): Promise<AdminOrder | null> {
  const data = await fetchGraphQL<AdminOrderDetailData, { orderNumber: string }>({
    query: ADMIN_ORDER_BY_NUMBER_QUERY,
    variables: { orderNumber },
  })
  return data.adminOrderByNumber
}

/**
 * Fetches order status counts for admin dashboard cards.
 */
export async function getAdminOrderStatusSummary(): Promise<AdminOrderStatusSummary> {
  const data = await fetchGraphQL<StatusSummaryData>({
    query: ADMIN_ORDER_STATUS_SUMMARY_QUERY,
  })
  return data.adminOrderStatusSummary
}

/**
 * Fetches orders in the production pipeline.
 */
export async function getAdminOrderProductionQueue(limit?: number): Promise<AdminOrder[]> {
  const data = await fetchGraphQL<ProductionQueueData, { limit?: number }>({
    query: ADMIN_ORDER_PRODUCTION_QUEUE_QUERY,
    variables: { limit },
  })
  return data.adminOrderProductionQueue
}

/**
 * Fetches production sheet payload for internal ops.
 */
export async function getAdminOrderProductionSheet(
  orderNumber: string,
): Promise<AdminProductionSheet> {
  const data = await fetchGraphQL<ProductionSheetData, { orderNumber: string }>({
    query: ADMIN_ORDER_PRODUCTION_SHEET_QUERY,
    variables: { orderNumber },
  })
  return data.adminOrderProductionSheet
}

/**
 * Updates order status with an audit event.
 */
export async function updateAdminOrderStatus(
  input: UpdateAdminOrderStatusInput,
): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { updateAdminOrderStatus: AdminOrder },
    { input: UpdateAdminOrderStatusInput }
  >({
    query: UPDATE_ADMIN_ORDER_STATUS_MUTATION,
    variables: { input },
  })
  return data.updateAdminOrderStatus
}

/**
 * Moves a paid order into production.
 */
export async function moveAdminOrderToProduction(orderNumber: string): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { moveAdminOrderToProduction: AdminOrder },
    { orderNumber: string }
  >({
    query: MOVE_ADMIN_ORDER_TO_PRODUCTION_MUTATION,
    variables: { orderNumber },
  })
  return data.moveAdminOrderToProduction
}

/**
 * Marks an order as ready to ship.
 */
export async function markAdminOrderReadyToShip(orderNumber: string): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { markAdminOrderReadyToShip: AdminOrder },
    { orderNumber: string }
  >({
    query: MARK_ADMIN_ORDER_READY_TO_SHIP_MUTATION,
    variables: { orderNumber },
  })
  return data.markAdminOrderReadyToShip
}

/**
 * Adds or updates shipment tracking for an order.
 */
export async function addAdminOrderTracking(
  input: AddAdminOrderTrackingInput,
): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { addAdminOrderTracking: AdminOrder },
    { input: AddAdminOrderTrackingInput }
  >({
    query: ADD_ADMIN_ORDER_TRACKING_MUTATION,
    variables: { input },
  })
  return data.addAdminOrderTracking
}

/**
 * Cancels an order (no automatic refund).
 */
export async function cancelAdminOrder(
  orderNumber: string,
  reason?: string | null,
): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { cancelAdminOrder: AdminOrder },
    { orderNumber: string; reason?: string | null }
  >({
    query: CANCEL_ADMIN_ORDER_MUTATION,
    variables: { orderNumber, reason },
  })
  return data.cancelAdminOrder
}

/**
 * Adds an internal note to an order.
 */
export async function addAdminOrderNote(input: AddAdminOrderNoteInput): Promise<AdminOrder> {
  const data = await fetchGraphQL<
    { addAdminOrderNote: AdminOrder },
    { input: AddAdminOrderNoteInput }
  >({
    query: ADD_ADMIN_ORDER_NOTE_MUTATION,
    variables: { input },
  })
  return data.addAdminOrderNote
}

export type { OrderMutationData }
