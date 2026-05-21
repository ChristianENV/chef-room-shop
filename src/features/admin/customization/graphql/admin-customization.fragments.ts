export const ADMIN_CUSTOMIZATION_AREA_FIELDS = /* GraphQL */ `
  id
  slug
  name
  description
  sortOrder
  isActive
`

export const ADMIN_CUSTOMIZATION_OPTION_FIELDS = /* GraphQL */ `
  id
  slug
  name
  basePriceCents
  pricePerCmCents
  isActive
`

export const ADMIN_CUSTOMIZATION_PRODUCT_FIELDS = /* GraphQL */ `
  id
  slug
  name
  productTypeName
  status
  customizable
`

export const ADMIN_CUSTOMIZATION_RULE_FIELDS = /* GraphQL */ `
  id
  productId
  areaId
  optionId
  enabled
  maxWidthCm
  maxHeightCm
  minQuantity
  basePriceCents
  pricePerCmCents
  extraProductionDays
  allowedFileTypes
  validationMessage
  notes
  metadataJson
  createdAt
  updatedAt
  product {
    ${ADMIN_CUSTOMIZATION_PRODUCT_FIELDS}
  }
  area {
    ${ADMIN_CUSTOMIZATION_AREA_FIELDS}
  }
  option {
    ${ADMIN_CUSTOMIZATION_OPTION_FIELDS}
  }
`

export const ADMIN_CUSTOMIZATION_PRICING_PREVIEW_FIELDS = /* GraphQL */ `
  basePriceCents
  areaPriceCents
  sizeFactorCents
  extraProductionDays
  totalExtraCents
  formulaLabel
`
