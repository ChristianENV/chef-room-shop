import { ADMIN_ORDER_FIELDS } from './admin-orders.fragments'

/**
 * GraphQL mutations for admin order operations.
 */

export const UPDATE_ADMIN_ORDER_STATUS_MUTATION = /* GraphQL */ `
  mutation UpdateAdminOrderStatus($input: UpdateAdminOrderStatusInput!) {
    updateAdminOrderStatus(input: $input) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const MOVE_ADMIN_ORDER_TO_PRODUCTION_MUTATION = /* GraphQL */ `
  mutation MoveAdminOrderToProduction($orderNumber: String!) {
    moveAdminOrderToProduction(orderNumber: $orderNumber) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const MARK_ADMIN_ORDER_READY_TO_SHIP_MUTATION = /* GraphQL */ `
  mutation MarkAdminOrderReadyToShip($orderNumber: String!) {
    markAdminOrderReadyToShip(orderNumber: $orderNumber) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const ADD_ADMIN_ORDER_TRACKING_MUTATION = /* GraphQL */ `
  mutation AddAdminOrderTracking($input: AddAdminOrderTrackingInput!) {
    addAdminOrderTracking(input: $input) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const CANCEL_ADMIN_ORDER_MUTATION = /* GraphQL */ `
  mutation CancelAdminOrder($orderNumber: String!, $reason: String) {
    cancelAdminOrder(orderNumber: $orderNumber, reason: $reason) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const ADD_ADMIN_ORDER_NOTE_MUTATION = /* GraphQL */ `
  mutation AddAdminOrderNote($input: AddAdminOrderNoteInput!) {
    addAdminOrderNote(input: $input) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`
