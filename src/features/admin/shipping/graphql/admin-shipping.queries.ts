const ADMIN_SHIPMENT_EVENT_FIELDS = `
  id
  status
  message
  createdAt
`

const ADMIN_SHIPMENT_FIELDS = `
  id
  orderNumber
  provider
  providerShipmentId
  providerLabelId
  carrier
  service
  trackingNumber
  status
  labelUrl
  labelFormat
  costCents
  currency
  shippedAt
  deliveredAt
  createdAt
  updatedAt
  events {
    ${ADMIN_SHIPMENT_EVENT_FIELDS}
  }
`

/**
 * GraphQL documents for admin shipping label BFF (ADMIN/SUPERADMIN only).
 */
export const ADMIN_SHIPMENT_BY_ORDER_NUMBER_QUERY = /* GraphQL */ `
  query AdminShipmentByOrderNumber($orderNumber: String!) {
    adminShipmentByOrderNumber(orderNumber: $orderNumber) {
      isSkydropxMockMode
      shipment {
        ${ADMIN_SHIPMENT_FIELDS}
      }
    }
  }
`
