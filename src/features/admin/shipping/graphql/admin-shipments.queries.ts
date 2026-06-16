export const ADMIN_SHIPMENTS_QUERY = /* GraphQL */ `
  query AdminShipments($filter: AdminShipmentsFilterInput, $limit: Int, $offset: Int) {
    adminShipments(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        id
        orderNumber
        customerName
        customerEmail
        status
        carrier
        trackingNumber
        labelStatus
        costCents
        currency
        createdAt
        updatedAt
        trackingUpdatedAt
      }
    }
  }
`
