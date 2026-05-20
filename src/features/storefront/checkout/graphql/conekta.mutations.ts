export const CREATE_CONEKTA_CHECKOUT_MUTATION = /* GraphQL */ `
  mutation CreateConektaCheckout($input: CreateConektaCheckoutInput!) {
    createConektaCheckout(input: $input) {
      orderId
      orderNumber
      paymentId
      providerOrderId
      checkoutId
      checkoutUrl
      status
      amountCents
      currency
    }
  }
`
