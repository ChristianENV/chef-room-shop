export const ADMIN_PRODUCT_OPTION_VALUE_FIELDS = /* GraphQL */ `
  id
  optionGroupId
  slug
  label
  description
  priceDeltaCents
  isDefault
  isActive
  sortOrder
  createdAt
  updatedAt
`

export const ADMIN_PRODUCT_OPTION_GROUP_FIELDS = /* GraphQL */ `
  id
  productId
  productTypeId
  slug
  name
  description
  inputType
  isRequired
  isActive
  sortOrder
  createdAt
  updatedAt
  values {
    ${ADMIN_PRODUCT_OPTION_VALUE_FIELDS}
  }
`

export const ADMIN_PRODUCT_OPTION_GROUPS_QUERY = /* GraphQL */ `
  query AdminProductOptionGroups($input: GetAdminProductOptionGroupsInput!) {
    adminProductOptionGroups(input: $input) {
      total
      groups {
        ${ADMIN_PRODUCT_OPTION_GROUP_FIELDS}
      }
    }
  }
`
