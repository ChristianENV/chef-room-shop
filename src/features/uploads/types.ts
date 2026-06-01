/** Content type the client must send on each presigned PUT. */
export type StoredUploadContentType = 'image/webp' | 'image/jpeg'

export type UploadKeys = {
  webp: string
  jpg: string
  thumb: string | null
}

export type UploadPublicUrls = {
  webp: string
  jpg: string
  thumb: string | null
}

export type UploadPresignedUrls = {
  webp: string
  jpg: string
  thumb: string | null
}

export type AvatarUploadPayload = {
  uploadId: string
  keys: UploadKeys
  publicUrls: UploadPublicUrls
  presignedUrls: UploadPresignedUrls
  expiresAt: string
}

export type ProductImageUploadPayload = {
  uploadId: string
  imageId: string
  keys: UploadKeys
  publicUrls: UploadPublicUrls
  presignedUrls: UploadPresignedUrls
  expiresAt: string
}

export type AccountUserSummary = {
  id: string
  email: string
  name: string | null
  image: string | null
}

export type UserAvatarPayload = {
  user: AccountUserSummary
  image: string | null
}

export type ProductImage = {
  id: string
  url: string
  publicId: string | null
  alt: string | null
  sortOrder: number | null
  isPrimary: boolean
}

export type CreateAvatarUploadInput = {
  webpSizeBytes: number
  jpgSizeBytes?: number | null
  originalFileName?: string | null
  originalContentType?: string | null
}

export type CreateProductImageUploadInput = {
  productId: string
  imageId?: string | null
  webpSizeBytes: number
  jpgSizeBytes?: number | null
  thumbSizeBytes?: number | null
  originalFileName?: string | null
  altText?: string | null
}

export type ConfirmProductImageUploadInput = {
  uploadId: string
  altText?: string | null
  isPrimary?: boolean | null
  sortOrder?: number | null
}

/** Which logical file an upload-progress event refers to. */
export type UploadFileSlot = 'webp' | 'jpg' | 'thumb'

export type UploadProgressEvent = {
  slot: UploadFileSlot
  /** 0..1 fraction of bytes uploaded. */
  progress: number
}

/** Processed avatar files ready to upload (conversion happens in the UI layer). */
export type AvatarUploadFiles = {
  webp: Blob
  jpg?: Blob | null
  originalFileName?: string | null
  originalContentType?: string | null
}

/** Processed product image files ready to upload. */
export type ProductImageUploadFiles = {
  productId: string
  imageId?: string | null
  webp: Blob
  jpg?: Blob | null
  thumb?: Blob | null
  originalFileName?: string | null
  originalContentType?: string | null
  altText?: string | null
  isPrimary?: boolean | null
  sortOrder?: number | null
}

export type AvatarUploadVariables = {
  files: AvatarUploadFiles
  onProgress?: (event: UploadProgressEvent) => void
}

export type ProductImageUploadVariables = {
  files: ProductImageUploadFiles
  onProgress?: (event: UploadProgressEvent) => void
}
