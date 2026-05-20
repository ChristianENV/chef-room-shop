export const CLAIM_ORDER_MUTATION = /* GraphQL */ `
  mutation ClaimOrder($token: String!) {
    claimOrder(token: $token) {
      success
      orderNumber
      redirectTo
      message
    }
  }
`
