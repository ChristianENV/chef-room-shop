import { ADMIN_PRODUCT_FIELDS } from './admin-products.fragments'
import {
  ADMIN_COLOR_FIELDS,
  ADMIN_PRODUCT_TYPE_FIELDS,
  ADMIN_SIZE_FIELDS,
} from './admin-products.fragments'

export const ADMIN_PRODUCTS_QUERY = /* GraphQL */ `
  query AdminProducts(
    $filter: AdminProductsFilterInput
    $sort: AdminProductsSortInput
    $limit: Int
    $offset: Int
  ) {
    adminProducts(filter: $filter, sort: $sort, limit: $limit, offset: $offset) {
      total
      items {
        ${ADMIN_PRODUCT_FIELDS}
      }
    }
  }
`

export const ADMIN_PRODUCT_BY_ID_QUERY = /* GraphQL */ `
  query AdminProductById($id: ID!) {
    adminProductById(id: $id) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const ADMIN_PRODUCT_BY_SLUG_QUERY = /* GraphQL */ `
  query AdminProductBySlug($slug: String!) {
    adminProductBySlug(slug: $slug) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const ADMIN_PRODUCT_FORM_OPTIONS_QUERY = /* GraphQL */ `
  query AdminProductFormOptions {
    adminProductFormOptions {
      productTypes {
        ${ADMIN_PRODUCT_TYPE_FIELDS}
      }
      colors {
        ${ADMIN_COLOR_FIELDS}
      }
      sizes {
        ${ADMIN_SIZE_FIELDS}
      }
    }
  }
`
