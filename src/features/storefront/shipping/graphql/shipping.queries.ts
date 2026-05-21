import { SHIPPING_QUOTE_FIELDS } from './shipping.fragments'

export const SHIPPING_QUOTE_BY_ID_QUERY = /* GraphQL */ `
  query ShippingQuoteById($id: ID!) {
    shippingQuoteById(id: $id) {
      ...ShippingQuoteFields
    }
  }
  ${SHIPPING_QUOTE_FIELDS}
`
