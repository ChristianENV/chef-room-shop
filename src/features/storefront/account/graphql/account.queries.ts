/**
 * GraphQL documents for authenticated account BFF (requires session cookie).
 */

export const ME_PROFILE_QUERY = /* GraphQL */ `
  query MeProfile {
    meProfile {
      id
      email
      name
      firstName
      lastName
      phone
      image
      marketingOptIn
      roles
      createdAt
    }
  }
`

export const MY_ACCOUNT_SUMMARY_QUERY = /* GraphQL */ `
  query MyAccountSummary {
    myAccountSummary {
      totalOrders
      activeOrders
      savedDesigns
      defaultShippingAddress {
        id
        type
        firstName
        lastName
        phone
        street
        extNumber
        intNumber
        neighborhood
        city
        state
        country
        postalCode
        isDefault
      }
      recentOrders {
        orderNumber
        status
        paymentStatus
        totalCents
        placedAt
      }
      recentDesigns {
        id
        name
        status
        previewUrl
        finalPriceCents
      }
    }
  }
`

const ACCOUNT_ORDER_PAYMENT_ACTIONS_FIELDS = /* GraphQL */ `
  paymentActions {
    canVerifyPayment
    canContinuePayment
    canRetryPayment
    paymentRedirectUrl
  }
`

export const MY_ORDERS_QUERY = /* GraphQL */ `
  query MyOrders($limit: Int, $offset: Int) {
    myOrders(limit: $limit, offset: $offset) {
      id
      orderNumber
      status
      paymentStatus
      fulfillmentStatus
      totalCents
      currency
      placedAt
      createdAt
      items {
        id
        name
        sku
        quantity
        totalPriceCents
      }
      payments {
        method
        status
        amountCents
      }
      shipments {
        carrier
        trackingNumber
        status
      }
      ${ACCOUNT_ORDER_PAYMENT_ACTIONS_FIELDS}
    }
  }
`

export const MY_ORDER_BY_NUMBER_QUERY = /* GraphQL */ `
  query MyOrderByNumber($orderNumber: String!) {
    myOrderByNumber(orderNumber: $orderNumber) {
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
        totalPriceCents
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
      ${ACCOUNT_ORDER_PAYMENT_ACTIONS_FIELDS}
    }
  }
`

export const MY_DESIGNS_QUERY = /* GraphQL */ `
  query MyDesigns($limit: Int, $offset: Int, $status: String) {
    myDesigns(limit: $limit, offset: $offset, status: $status) {
      id
      name
      status
      previewUrl
      previewPublicId
      finalPriceCents
      currency
      createdAt
      updatedAt
      purchasedAt
      product {
        id
        slug
        name
        basePriceCents
      }
    }
  }
`

export const MY_ADDRESSES_QUERY = /* GraphQL */ `
  query MyAddresses {
    myAddresses {
      id
      type
      firstName
      lastName
      phone
      street
      extNumber
      intNumber
      neighborhood
      city
      state
      country
      postalCode
      references
      isDefault
      createdAt
      updatedAt
    }
  }
`
