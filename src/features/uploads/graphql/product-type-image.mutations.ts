import { ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS } from '@/src/features/admin/product-types/graphql/admin-product-types.fragments'

const UPLOAD_TARGETS_FIELDS = /* GraphQL */ `
  uploadId
  imageId
  keys {
    webp
    jpg
    thumb
  }
  publicUrls {
    webp
    jpg
    thumb
  }
  presignedUrls {
    webp
    jpg
    thumb
  }
  expiresAt
`

export const CREATE_ADMIN_PRODUCT_TYPE_IMAGE_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateAdminProductTypeImageUpload($input: CreateAdminProductTypeImageUploadInput!) {
    createAdminProductTypeImageUpload(input: $input) {
      ${UPLOAD_TARGETS_FIELDS}
    }
  }
`

export const CONFIRM_ADMIN_PRODUCT_TYPE_IMAGE_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmAdminProductTypeImageUpload($input: ConfirmAdminProductTypeImageUploadInput!) {
    confirmAdminProductTypeImageUpload(input: $input) {
      productType {
        ${ADMIN_PRODUCT_TYPE_CATEGORY_FIELDS}
      }
    }
  }
`
