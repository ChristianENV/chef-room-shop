export const CREATE_DESIGN_PREVIEW_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateDesignPreviewUpload($input: CreateDesignPreviewUploadInput!) {
    createDesignPreviewUpload(input: $input) {
      uploadId
      expiresAt
      keys {
        front {
          webp
          jpg
        }
        back {
          webp
          jpg
        }
      }
      publicUrls {
        front {
          webp
          jpg
        }
        back {
          webp
          jpg
        }
      }
      presignedUrls {
        front {
          webp
          jpg
        }
        back {
          webp
          jpg
        }
      }
    }
  }
`

export const CONFIRM_DESIGN_PREVIEW_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmDesignPreviewUpload($input: ConfirmDesignPreviewUploadInput!) {
    confirmDesignPreviewUpload(input: $input) {
      id
      previewUrl
      previewPublicId
      configJson
      status
      updatedAt
    }
  }
`
