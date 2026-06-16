export const ADMIN_PAYMENTS_QUERY = /* GraphQL */ `
  query AdminPayments($filter: AdminPaymentsFilterInput, $limit: Int, $offset: Int) {
    adminPayments(filter: $filter, limit: $limit, offset: $offset) {
      total
      items {
        id
        orderId
        orderNumber
        customerName
        customerEmail
        provider
        method
        status
        amountCents
        currency
        providerPaymentIdMasked
        paidAt
        createdAt
        updatedAt
      }
    }
  }
`
