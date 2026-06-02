export * from './r2.types'
export * from './r2.errors'
export {
  ALLOWED_INPUT_CONTENT_TYPES,
  MAX_PRODUCT_IMAGES,
  MAX_UPLOAD_BYTES,
  PRESIGNED_PUT_TTL_SECONDS,
  STORED_CONTENT_TYPES,
  getR2ConfigOrNull,
  isR2Configured,
  requireR2Config,
} from './r2.config'
export {
  buildAvatarObjectKeys,
  buildDesignPreviewObjectKeys,
  buildDesignPreviewUploadKeys,
  buildProductImageObjectKeys,
  buildPublicR2Url,
  buildPublicUrlsForKeys,
  validateUploadContentType,
  validateUploadSize,
} from './r2.keys'
export type { DesignPreviewUploadKeys } from './r2.keys'
export { getR2Client, r2DeleteObject, r2HeadObject } from './r2.client'
export {
  createPresignedPutUrlsForKeys,
  createR2PresignedPutUrl,
} from './r2.presigned'
