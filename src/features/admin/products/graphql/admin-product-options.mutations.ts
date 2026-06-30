import { ADMIN_PRODUCT_OPTION_GROUP_FIELDS, ADMIN_PRODUCT_OPTION_VALUE_FIELDS } from './admin-product-options.queries'

export const CREATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION = /* GraphQL */ `
  mutation CreateAdminProductOptionGroup($input: CreateAdminProductOptionGroupInput!) {
    createAdminProductOptionGroup(input: $input) {
      group {
        ${ADMIN_PRODUCT_OPTION_GROUP_FIELDS}
      }
    }
  }
`

export const UPDATE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION = /* GraphQL */ `
  mutation UpdateAdminProductOptionGroup($input: UpdateAdminProductOptionGroupInput!) {
    updateAdminProductOptionGroup(input: $input) {
      group {
        ${ADMIN_PRODUCT_OPTION_GROUP_FIELDS}
      }
    }
  }
`

export const ARCHIVE_ADMIN_PRODUCT_OPTION_GROUP_MUTATION = /* GraphQL */ `
  mutation ArchiveAdminProductOptionGroup($input: ArchiveAdminProductOptionGroupInput!) {
    archiveAdminProductOptionGroup(input: $input) {
      success
      message
    }
  }
`

export const CREATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION = /* GraphQL */ `
  mutation CreateAdminProductOptionValue($input: CreateAdminProductOptionValueInput!) {
    createAdminProductOptionValue(input: $input) {
      value {
        ${ADMIN_PRODUCT_OPTION_VALUE_FIELDS}
      }
    }
  }
`

export const UPDATE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION = /* GraphQL */ `
  mutation UpdateAdminProductOptionValue($input: UpdateAdminProductOptionValueInput!) {
    updateAdminProductOptionValue(input: $input) {
      value {
        ${ADMIN_PRODUCT_OPTION_VALUE_FIELDS}
      }
    }
  }
`

export const ARCHIVE_ADMIN_PRODUCT_OPTION_VALUE_MUTATION = /* GraphQL */ `
  mutation ArchiveAdminProductOptionValue($input: ArchiveAdminProductOptionValueInput!) {
    archiveAdminProductOptionValue(input: $input) {
      success
      message
    }
  }
`
