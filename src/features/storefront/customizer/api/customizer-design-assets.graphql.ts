export const CREATE_DESIGN_ASSET_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateDesignAssetUpload($input: CreateDesignAssetUploadInput!) {
    createDesignAssetUpload(input: $input) {
      uploadId
      assetId
      expiresAt
      keys {
        webp
        png
      }
      publicUrls {
        webp
        png
      }
      presignedUrls {
        webp
        png
      }
    }
  }
`

export const CONFIRM_DESIGN_ASSET_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmDesignAssetUpload($input: ConfirmDesignAssetUploadInput!) {
    confirmDesignAssetUpload(input: $input) {
      id
      designId
      type
      url
      publicId
      sortOrder
    }
  }
`
