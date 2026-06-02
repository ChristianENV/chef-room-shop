/** Allowed original content types accepted from the client before processing. */
export type AllowedImageContentType = 'image/jpeg' | 'image/png' | 'image/webp'

/** Content types we actually store in R2 (after client-side processing). */
export type StoredImageContentType = 'image/webp' | 'image/jpeg'

/** Logical kind of an upload, used for size limits and key building. */
export type UploadKind = 'avatar' | 'product' | 'design'

/** Front or back design preview captured from the customizer viewport. */
export type DesignPreviewView = 'front' | 'back'

/** Resolved R2 configuration (all values present and validated). */
export type R2Config = {
  accountId: string
  accessKeyId: string
  secretAccessKey: string
  bucketName: string
  publicBaseUrl: string
  region: string
  endpoint: string
}

/** Object keys for the variants of a single logical image. */
export type R2ObjectKeys = {
  webp: string
  jpg: string
  /** Thumbnail (products only). */
  thumb?: string
}

/** Public CDN URLs matching {@link R2ObjectKeys}. */
export type R2PublicUrls = {
  webp: string
  jpg: string
  thumb?: string
}

/** Input for creating a single presigned PUT URL. */
export type CreatePresignedPutInput = {
  key: string
  contentType: StoredImageContentType
  /** TTL in seconds for the presigned URL. */
  expiresInSeconds?: number
}

/** A presigned PUT URL plus the key it targets. */
export type PresignedPutUrl = {
  key: string
  url: string
  contentType: StoredImageContentType
}
