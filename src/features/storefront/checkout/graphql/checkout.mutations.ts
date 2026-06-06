/**
 * GraphQL mutations for storefront checkout BFF.
 */

export const CREATE_CHECKOUT_ORDER_MUTATION = /* GraphQL */ `
  mutation CreateCheckoutOrder($input: CreateCheckoutOrderInput!) {
    createCheckoutOrder(input: $input) {
      orderNumber
      orderId
      status
      paymentStatus
      totalCents
      shippingCents
      currency
      claimUrl
      accountOrderUrl
    }
  }
`

export const COMPLETE_CHECKOUT_MUTATION = /* GraphQL */ `
  mutation CompleteCheckout($input: CreateCheckoutOrderInput!) {
    completeCheckout(input: $input) {
      orderNumber
      orderId
      status
      paymentStatus
      totalCents
      shippingCents
      currency
      claimUrl
      accountOrderUrl
      paymentRedirectUrl
      paymentProviderOrderId
      paymentMethod
      successUrl
      returnToken
    }
  }
`

export const RETRY_CHECKOUT_PAYMENT_MUTATION = /* GraphQL */ `
  mutation RetryCheckoutPayment($input: RetryCheckoutPaymentInput!) {
    retryCheckoutPayment(input: $input) {
      orderNumber
      orderId
      status
      paymentStatus
      totalCents
      shippingCents
      currency
      claimUrl
      accountOrderUrl
      paymentRedirectUrl
      paymentProviderOrderId
      paymentMethod
      successUrl
      returnToken
    }
  }
`

export const VERIFY_CHECKOUT_PAYMENT_BY_TOKEN_MUTATION = /* GraphQL */ `
  mutation VerifyCheckoutPaymentByToken($orderNumber: String!, $token: String!) {
    verifyCheckoutPaymentByToken(orderNumber: $orderNumber, token: $token) {
      orderNumber
      orderStatus
      paymentStatus
      paymentMethod
      canRetryPayment
      canContinuePayment
      paymentRedirectUrl
      checkedAt
      message
    }
  }
`

export const CLAIM_GUEST_ORDER_BY_CHECKOUT_TOKEN_MUTATION = /* GraphQL */ `
  mutation ClaimGuestOrderByCheckoutToken($orderNumber: String!, $token: String!) {
    claimGuestOrderByCheckoutToken(orderNumber: $orderNumber, token: $token) {
      success
      status
      orderNumber
      message
    }
  }
`
