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
      currency
    }
  }
`
