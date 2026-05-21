export const SHIPPING_RATE_FIELDS = /* GraphQL */ `
  fragment ShippingRateFields on ShippingRate {
    id
    providerRateId
    carrier
    service
    amountCents
    currency
    estimatedDays
    estimatedDeliveryDate
    expiresAt
    selectedAt
  }
`

export const SHIPPING_QUOTE_FIELDS = /* GraphQL */ `
  fragment ShippingQuoteFields on ShippingQuote {
    id
    provider
    providerQuoteId
    originPostalCode
    destinationPostalCode
    isCompleted
    expiresAt
    packageJson
    rates {
      ...ShippingRateFields
    }
    createdAt
    updatedAt
  }
  ${SHIPPING_RATE_FIELDS}
`

export const SHIPPING_QUOTE_PAYLOAD_FIELDS = /* GraphQL */ `
  fragment ShippingQuotePayloadFields on ShippingQuotePayload {
    quote {
      ...ShippingQuoteFields
    }
    recommendedRate {
      ...ShippingRateFields
    }
  }
  ${SHIPPING_QUOTE_FIELDS}
`
