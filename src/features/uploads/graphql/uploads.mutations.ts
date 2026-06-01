const UPLOAD_TARGETS_FIELDS = /* GraphQL */ `
  uploadId
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

export const CREATE_AVATAR_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateAvatarUpload($input: CreateAvatarUploadInput!) {
    createAvatarUpload(input: $input) {
      ${UPLOAD_TARGETS_FIELDS}
    }
  }
`

export const CONFIRM_AVATAR_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmAvatarUpload($input: ConfirmAvatarUploadInput!) {
    confirmAvatarUpload(input: $input) {
      image
      user {
        id
        email
        name
        image
      }
    }
  }
`

export const CREATE_PRODUCT_IMAGE_UPLOAD_MUTATION = /* GraphQL */ `
  mutation CreateProductImageUpload($input: CreateProductImageUploadInput!) {
    createProductImageUpload(input: $input) {
      imageId
      ${UPLOAD_TARGETS_FIELDS}
    }
  }
`

export const CONFIRM_PRODUCT_IMAGE_UPLOAD_MUTATION = /* GraphQL */ `
  mutation ConfirmProductImageUpload($input: ConfirmProductImageUploadInput!) {
    confirmProductImageUpload(input: $input) {
      id
      url
      publicId
      alt
      sortOrder
      isPrimary
    }
  }
`
