import { SHIPPING_QUOTE_PAYLOAD_FIELDS } from './shipping.fragments'

export const CREATE_SHIPPING_QUOTE_MUTATION = /* GraphQL */ `
  mutation CreateShippingQuote($input: CreateShippingQuoteInput!) {
    createShippingQuote(input: $input) {
      ...ShippingQuotePayloadFields
    }
  }
  ${SHIPPING_QUOTE_PAYLOAD_FIELDS}
`

export const REFRESH_SHIPPING_QUOTE_MUTATION = /* GraphQL */ `
  mutation RefreshShippingQuote($id: ID!) {
    refreshShippingQuote(id: $id) {
      ...ShippingQuotePayloadFields
    }
  }
  ${SHIPPING_QUOTE_PAYLOAD_FIELDS}
`

export const SELECT_SHIPPING_RATE_MUTATION = /* GraphQL */ `
  mutation SelectShippingRate($rateId: ID!) {
    selectShippingRate(rateId: $rateId) {
      ...ShippingQuotePayloadFields
    }
  }
  ${SHIPPING_QUOTE_PAYLOAD_FIELDS}
`
