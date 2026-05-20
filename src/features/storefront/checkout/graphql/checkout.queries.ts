/**
 * GraphQL queries for storefront checkout confirmation (guest + email).
 */

export const ORDER_BY_NUMBER_QUERY = /* GraphQL */ `
  query OrderByNumber($orderNumber: String!, $email: String!) {
    orderByNumber(orderNumber: $orderNumber, email: $email) {
      id
      orderNumber
      status
      paymentStatus
      fulfillmentStatus
      customerEmail
      customerPhone
      currency
      subtotalCents
      customizationTotalCents
      shippingCostCents
      discountTotalCents
      taxTotalCents
      totalCents
      createdAt
      items {
        id
        name
        quantity
        totalPriceCents
        customizationPriceCents
      }
      payments {
        id
        provider
        method
        status
        amountCents
        currency
      }
    }
  }
`
