import { ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS } from './admin-product-types.fragments'

export const CREATE_ADMIN_PRODUCT_TYPE_MUTATION = /* GraphQL */ `
  mutation CreateAdminProductType($input: CreateAdminProductTypeInput!) {
    createAdminProductType(input: $input) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`

export const UPDATE_ADMIN_PRODUCT_TYPE_MUTATION = /* GraphQL */ `
  mutation UpdateAdminProductType($id: ID!, $input: UpdateAdminProductTypeInput!) {
    updateAdminProductType(id: $id, input: $input) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`

export const REMOVE_ADMIN_PRODUCT_TYPE_IMAGE_MUTATION = /* GraphQL */ `
  mutation RemoveAdminProductTypeImage($id: ID!) {
    removeAdminProductTypeImage(id: $id) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`

export const ARCHIVE_ADMIN_PRODUCT_TYPE_MUTATION = /* GraphQL */ `
  mutation ArchiveAdminProductType($id: ID!) {
    archiveAdminProductType(id: $id) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`
