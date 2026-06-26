import { ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS } from './admin-product-types.fragments'

export const ADMIN_PRODUCT_TYPES_QUERY = /* GraphQL */ `
  query AdminProductTypes($includeInactive: Boolean) {
    adminProductTypes(includeInactive: $includeInactive) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`

export const ADMIN_PRODUCT_TYPE_BY_ID_QUERY = /* GraphQL */ `
  query AdminProductTypeById($id: ID!) {
    adminProductTypeById(id: $id) {
      ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
    }
  }
`
