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
        productSnapshotJson
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

export const CHECKOUT_RESULT_BY_TOKEN_QUERY = /* GraphQL */ `
  query CheckoutResultByToken($token: String!) {
    checkoutResultByToken(token: $token) {
      orderNumber
      orderId
      status
      paymentStatus
      fulfillmentStatus
      totalCents
      shippingCents
      currency
      paymentMethod
      createdAt
      items {
        id
        name
        quantity
        totalPriceCents
        customizationPriceCents
        productSnapshotJson
      }
      payments {
        id
        provider
        method
        status
        amountCents
        currency
      }
      claimUrl
      accountOrderUrl
      canViewDetails
      detailUrl
      paymentReference
      paymentExpiresAt
      cashPaymentLocations
      returnTokenValid
      tokenExpired
      loginUrl
      registerUrl
    }
  }
`
