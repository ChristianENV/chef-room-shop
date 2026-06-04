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
  materialHintsJson
  meshHintsJson
  anchorsJson
  createdAt
  updatedAt
`

export const CREATE_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateAdminProductModelUpload($input: CreateAdminProductModelUploadInput!) {
    createAdminProductModelUpload(input: $input) {
      uploadId
      modelAssetId
      publicId
      publicUrl
      presignedUrl
      expiresAt
    }
  }
`

export const CONFIRM_ADMIN_PRODUCT_MODEL_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmAdminProductModelUpload($input: ConfirmAdminProductModelUploadInput!) {
    confirmAdminProductModelUpload(input: $input) {
      ${ADMIN_PRODUCT_MODEL_3D_FIELDS}
    }
  }
`

export const DELETE_ADMIN_PRODUCT_MODEL_ASSET_MUTATION = /* GraphQL */ `
  mutation DeleteAdminProductModelAsset($modelAssetId: ID!) {
    deleteAdminProductModelAsset(modelAssetId: $modelAssetId)
  }
`
