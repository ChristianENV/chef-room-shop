const ADMIN_SHIPMENT_MUTATION_FIELDS = `
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
`

export const ADMIN_CREATE_SHIPPING_LABEL_MUTATION = /* GraphQL */ `
  mutation AdminCreateShippingLabel($input: AdminCreateShippingLabelInput!) {
    adminCreateShippingLabel(input: $input) {
      ${ADMIN_SHIPMENT_MUTATION_FIELDS}
    }
  }
`

export const ADMIN_CANCEL_SHIPPING_LABEL_MUTATION = /* GraphQL */ `
  mutation AdminCancelShippingLabel($input: AdminCancelShippingLabelInput!) {
    adminCancelShippingLabel(input: $input) {
      ${ADMIN_SHIPMENT_MUTATION_FIELDS}
    }
  }
`

export const ADMIN_REFRESH_SHIPMENT_TRACKING_MUTATION = /* GraphQL */ `
  mutation AdminRefreshShipmentTracking($orderNumber: String!) {
    adminRefreshShipmentTracking(orderNumber: $orderNumber) {
      ${ADMIN_SHIPMENT_MUTATION_FIELDS}
    }
  }
`
