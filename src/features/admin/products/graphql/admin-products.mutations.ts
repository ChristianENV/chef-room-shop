import {
  ADMIN_PRODUCT_FIELDS,
  ADMIN_PRODUCT_IMAGE_FIELDS,
  ADMIN_PRODUCT_VARIANT_FIELDS,
} from './admin-products.fragments'

export const CREATE_ADMIN_PRODUCT_MUTATION = /* GraphQL */ `
  mutation CreateAdminProduct($input: AdminProductInput!) {
    createAdminProduct(input: $input) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const UPDATE_ADMIN_PRODUCT_MUTATION = /* GraphQL */ `
  mutation UpdateAdminProduct($id: ID!, $input: AdminProductInput!) {
    updateAdminProduct(id: $id, input: $input) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const ARCHIVE_ADMIN_PRODUCT_MUTATION = /* GraphQL */ `
  mutation ArchiveAdminProduct($id: ID!) {
    archiveAdminProduct(id: $id) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const DUPLICATE_ADMIN_PRODUCT_MUTATION = /* GraphQL */ `
  mutation DuplicateAdminProduct($id: ID!) {
    duplicateAdminProduct(id: $id) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const UPDATE_ADMIN_PRODUCT_STATUS_MUTATION = /* GraphQL */ `
  mutation UpdateAdminProductStatus($id: ID!, $status: String!) {
    updateAdminProductStatus(id: $id, status: $status) {
      ${ADMIN_PRODUCT_FIELDS}
    }
  }
`

export const UPSERT_ADMIN_PRODUCT_VARIANT_MUTATION = /* GraphQL */ `
  mutation UpsertAdminProductVariant($input: AdminProductVariantInput!) {
    upsertAdminProductVariant(input: $input) {
      ${ADMIN_PRODUCT_VARIANT_FIELDS}
    }
  }
`

export const DELETE_ADMIN_PRODUCT_VARIANT_MUTATION = /* GraphQL */ `
  mutation DeleteAdminProductVariant($id: ID!) {
    deleteAdminProductVariant(id: $id)
  }
`

export const UPSERT_ADMIN_PRODUCT_IMAGE_MUTATION = /* GraphQL */ `
  mutation UpsertAdminProductImage($input: AdminProductImageInput!) {
    upsertAdminProductImage(input: $input) {
      ${ADMIN_PRODUCT_IMAGE_FIELDS}
    }
  }
`

export const DELETE_ADMIN_PRODUCT_IMAGE_MUTATION = /* GraphQL */ `
  mutation DeleteAdminProductImage($id: ID!) {
    deleteAdminProductImage(id: $id)
  }
`

export const REORDER_ADMIN_PRODUCT_IMAGES_MUTATION = /* GraphQL */ `
  mutation ReorderAdminProductImages($productId: ID!, $imageIds: [ID!]!) {
    reorderAdminProductImages(productId: $productId, imageIds: $imageIds) {
      ${ADMIN_PRODUCT_IMAGE_FIELDS}
    }
  }
`
