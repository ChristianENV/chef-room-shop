export const ORDER_CLAIM_PREVIEW_QUERY = /* GraphQL */ `
  query OrderClaimPreview($token: String!) {
    orderClaimPreview(token: $token) {
      orderNumber
      maskedEmail
      status
      paymentStatus
      expiresAt
      alreadyClaimed
    }
  }
`
