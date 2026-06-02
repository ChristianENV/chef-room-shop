import 'server-only'

import { ALLOWED_INPUT_CONTENT_TYPES, MAX_UPLOAD_BYTES, requireR2Config } from './r2.config'
import { r2FileTooLarge, r2InvalidContentType, r2InvalidSize } from './r2.errors'
import type {
  AllowedImageContentType,
  DesignPreviewView,
  R2ObjectKeys,
  R2PublicUrls,
  UploadKind,
} from './r2.types'

/**
 * Object keys for a user's avatar. Keys are deterministic so a re-upload
 * overwrites the previous file (no orphan objects). Cache busting is handled
 * via a version query param on the public URL, not the key.
 */
export function buildAvatarObjectKeys(userId: string): Required<Pick<R2ObjectKeys, 'webp' | 'jpg'>> {
  const base = `users/${userId}/avatar`
  return {
    webp: `${base}/avatar.webp`,
    jpg: `${base}/avatar.jpg`,
  }
}

/**
 * Object keys for a single product image (webp + jpg + webp thumbnail).
 * `imageId` is a server-generated UUID, never a client filename.
 */
export function buildProductImageObjectKeys(
  productId: string,
  imageId: string,
): Required<R2ObjectKeys> {
  const base = `products/${productId}/images/${imageId}`
  return {
    webp: `${base}/image.webp`,
    jpg: `${base}/image.jpg`,
    thumb: `${base}/thumb.webp`,
  }
}

/** Object keys for a single design preview view (front or back). */
export function buildDesignPreviewObjectKeys(
  designId: string,
  view: DesignPreviewView,
): Required<Pick<R2ObjectKeys, 'webp' | 'jpg'>> {
  const base = `designs/${designId}/previews/${view}`
  return {
    webp: `${base}.webp`,
    jpg: `${base}.jpg`,
  }
}

export type DesignPreviewUploadKeys = {
  front: Required<Pick<R2ObjectKeys, 'webp' | 'jpg'>>
  back: Required<Pick<R2ObjectKeys, 'webp' | 'jpg'>>
}

/** Presigned PUT targets for front + back design previews. */
export function buildDesignPreviewUploadKeys(designId: string): DesignPreviewUploadKeys {
  return {
    front: buildDesignPreviewObjectKeys(designId, 'front'),
    back: buildDesignPreviewObjectKeys(designId, 'back'),
  }
}

/** Builds the public CDN URL for a single object key. */
export function buildPublicR2Url(key: string): string {
  const { publicBaseUrl } = requireR2Config()
  const normalizedKey = key.replace(/^\/+/, '')
  return `${publicBaseUrl}/${normalizedKey}`
}

/** Builds public URLs for every key in an {@link R2ObjectKeys} set. */
export function buildPublicUrlsForKeys(keys: R2ObjectKeys): R2PublicUrls {
  return {
    webp: buildPublicR2Url(keys.webp),
    jpg: buildPublicR2Url(keys.jpg),
    ...(keys.thumb ? { thumb: buildPublicR2Url(keys.thumb) } : {}),
  }
}

/**
 * Validates an original (client) content type against the allowed set.
 *
 * @throws {R2StorageError} code `R2_INVALID_CONTENT_TYPE`.
 */
export function validateUploadContentType(contentType: string): AllowedImageContentType {
  const normalized = contentType.trim().toLowerCase()
  const match = ALLOWED_INPUT_CONTENT_TYPES.find((allowed) => allowed === normalized)
  if (!match) {
    throw r2InvalidContentType(contentType)
  }
  return match
}

/**
 * Validates a declared upload size against the limit for its kind.
 *
 * @throws {R2StorageError} codes `R2_INVALID_SIZE` or `R2_FILE_TOO_LARGE`.
 */
export function validateUploadSize(bytes: number, kind: UploadKind): number {
  if (!Number.isInteger(bytes) || bytes <= 0) {
    throw r2InvalidSize()
  }
  const maxBytes = MAX_UPLOAD_BYTES[kind]
  if (bytes > maxBytes) {
    throw r2FileTooLarge(bytes, maxBytes)
  }
  return bytes
}
