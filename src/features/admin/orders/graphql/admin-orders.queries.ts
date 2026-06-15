import { ADMIN_ORDER_FIELDS, ADMIN_ORDER_ITEM_FIELDS } from './admin-orders.fragments'

/**
 * GraphQL documents for admin orders BFF (requires ADMIN/SUPERADMIN session).
 */

export const ADMIN_ORDERS_QUERY = /* GraphQL */ `
  query AdminOrders(
    $filter: AdminOrdersFilterInput
    $sort: AdminOrdersSortInput
    $limit: Int
    $offset: Int
  ) {
    adminOrders(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      total
      items {
        ${ADMIN_ORDER_FIELDS}
      }
    }
  }
`

export const ADMIN_ORDER_BY_NUMBER_QUERY = /* GraphQL */ `
  query AdminOrderByNumber($orderNumber: String!) {
    adminOrderByNumber(orderNumber: $orderNumber) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const ADMIN_ORDER_STATUS_SUMMARY_QUERY = /* GraphQL */ `
  query AdminOrderStatusSummary {
    adminOrderStatusSummary {
      pendingPayment
      paid
      inProduction
      readyToShip
      shipped
      delivered
      cancelled
    }
  }
`

export const ADMIN_ORDER_PRODUCTION_QUEUE_QUERY = /* GraphQL */ `
  query AdminOrderProductionQueue($limit: Int) {
    adminOrderProductionQueue(limit: $limit) {
      ${ADMIN_ORDER_FIELDS}
    }
  }
`

export const ADMIN_ORDER_PRODUCTION_SHEET_QUERY = /* GraphQL */ `
  query AdminOrderProductionSheet($orderNumber: String!) {
    adminOrderProductionSheet(orderNumber: $orderNumber) {
      orderNumber
      customerName
      customerEmail
      notes
      generatedAt
      items {
        ${ADMIN_ORDER_ITEM_FIELDS}
      }
    }
  }
`

export const ADMIN_DESIGN_CONFIG_JSON_QUERY = /* GraphQL */ `
  query AdminDesignConfigJson($designId: ID!) {
    adminDesignConfigJson(designId: $designId)
  }
`
