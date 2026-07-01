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
      subtotalCents
      customizationTotalCents
      discountTotalCents
      taxTotalCents
      currency
      paymentMethod
      createdAt
      placedAt
      maskedCustomerEmail
      items {
        id
        name
        quantity
        totalPriceCents
        customizationPriceCents
        productSnapshotJson
        designSnapshotJson
      }
      payments {
        id
        provider
        method
        status
        amountCents
        currency
        paidAt
        expiresAt
      }
      shipments {
        id
        carrier
        trackingNumber
        status
        shippedAt
        deliveredAt
      }
      events {
        id
        type
        message
        createdAt
      }
      paymentActions {
        canVerifyPayment
        canContinuePayment
        canRetryPayment
        paymentRedirectUrl
      }
      claimUrl
      accountOrderUrl
      canViewDetails
      viewerEmailMatchesOrder
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

export const ORDER_BY_CHECKOUT_TOKEN_QUERY = /* GraphQL */ `
  query OrderByCheckoutToken($orderNumber: String!, $token: String!) {
    orderByCheckoutToken(orderNumber: $orderNumber, token: $token) {
      returnTokenValid
      tokenExpired
      viewerEmailMatchesOrder
      maskedCustomerEmail
      order {
        id
        orderNumber
        status
        paymentStatus
        fulfillmentStatus
        customerEmail
        customerPhone
        subtotalCents
        customizationTotalCents
        shippingCostCents
        discountTotalCents
        taxTotalCents
        totalCents
        currency
        placedAt
        createdAt
        items {
          id
          name
          sku
          quantity
          unitPriceCents
          customizationPriceCents
          optionPriceCents
          totalPriceCents
          commercialOptionsSnapshot {
            groupId
            groupSlug
            groupName
            valueId
            valueSlug
            valueLabel
            priceDeltaCents
          }
          productSnapshotJson
          designSnapshotJson
        }
        payments {
          id
          provider
          method
          status
          amountCents
          currency
          paidAt
          expiresAt
        }
        shipments {
          id
          carrier
          trackingNumber
          status
          shippedAt
          deliveredAt
        }
        events {
          id
          type
          message
          createdAt
        }
        paymentActions {
          canVerifyPayment
          canContinuePayment
          canRetryPayment
          paymentRedirectUrl
        }
      }
    }
  }
`
