export const ADMIN_PRODUCT_TYPE_FIELDS = /* GraphQL */ `
  id
  slug
  name
  nameEs
  description
  sortOrder
  isActive
`

export const ADMIN_COLOR_FIELDS = /* GraphQL */ `
  id
  name
  slug
  hexCode
  isFabricColor
  isProductColor
  isGeneralColor
  isActive
  sortOrder
`

export const ADMIN_SIZE_FIELDS = /* GraphQL */ `
  id
  name
  slug
  sortOrder
  isActive
`

export const ADMIN_PRODUCT_IMAGE_FIELDS = /* GraphQL */ `
  id
  url
  publicId
  alt
  sortOrder
  isPrimary
`

export const ADMIN_PRODUCT_VARIANT_FIELDS = /* GraphQL */ `
  id
  sku
  variantName
  priceCents
  stockQty
  isActive
  createdAt
  updatedAt
  color {
    ${ADMIN_COLOR_FIELDS}
  }
  size {
    ${ADMIN_SIZE_FIELDS}
  }
`

export const ADMIN_PRODUCT_MODEL_3D_FIELDS = /* GraphQL */ `
  id
  productId
  url
  publicId
  fileName
  originalFileName
  format
  contentType
  sizeBytes
  originalSizeBytes
  compressionRatio
  isActive
  status
  createdAt
  updatedAt
`

export const ADMIN_PRODUCT_FIELDS = /* GraphQL */ `
  id
  slug
  name
  shortDescription
  description
  basePriceCents
  currency
  customizable
  status
  seoTitle
  seoDescription
  seoImageId
  deletedAt
  createdAt
  updatedAt
  productType {
    ${ADMIN_PRODUCT_TYPE_FIELDS}
  }
  images {
    ${ADMIN_PRODUCT_IMAGE_FIELDS}
  }
  variants {
    ${ADMIN_PRODUCT_VARIANT_FIELDS}
  }
  model3d {
    ${ADMIN_PRODUCT_MODEL_3D_FIELDS}
  }
`
