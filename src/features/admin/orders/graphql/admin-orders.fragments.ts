/**
 * Shared GraphQL selection sets for admin orders BFF.
 */

export const ADMIN_ORDER_ITEM_FIELDS = /* GraphQL */ `
  id
  productId
  productVariantId
  designId
  name
  sku
  quantity
  unitPriceCents
  customizationPriceCents
  optionPriceCents
  lineTotalCents
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
  productionNotes
  hasCustomDesign
`

export const ADMIN_ORDER_FIELDS = /* GraphQL */ `
  id
  orderNumber
  customer {
    userId
    name
    email
    phone
  }
  status
  paymentStatus
  fulfillmentStatus
  currency
  subtotalCents
  customizationTotalCents
  shippingCents
  discountCents
  taxCents
  totalCents
  notes
  placedAt
  createdAt
  updatedAt
  shippingAddress {
    id
    type
    firstName
    lastName
    phone
    line1
    line2
    label
    city
    state
    country
    postalCode
  }
  billingAddress {
    id
    type
    firstName
    lastName
    phone
    line1
    line2
    label
    city
    state
    country
    postalCode
  }
  items {
    ${ADMIN_ORDER_ITEM_FIELDS}
  }
  payments {
    id
    provider
    providerOrderId
    method
    status
    amountCents
    currency
    paidAt
    expiresAt
    createdAt
  }
  shipments {
    id
    carrier
    trackingNumber
    status
    shippedAt
    deliveredAt
    createdAt
  }
  events {
    id
    type
    message
    createdAt
    actorName
  }
  hasCustomDesign
`
