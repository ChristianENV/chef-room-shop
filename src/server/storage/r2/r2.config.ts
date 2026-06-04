import 'server-only'

import { r2NotConfigured } from './r2.errors'
import type {
  AllowedImageContentType,
  R2Config,
  StoredImageContentType,
  UploadKind,
} from './r2.types'

/** Content types accepted as the *original* client file before processing. */
export const ALLOWED_INPUT_CONTENT_TYPES: readonly AllowedImageContentType[] = [
  'image/jpeg',
  'image/png',
  'image/webp',
] as const

/** Content types we store in R2 (presigned PUT targets). */
export const STORED_CONTENT_TYPES: Record<'webp' | 'jpg', StoredImageContentType> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
}

/** Maximum original file size per upload kind, in bytes. */
export const MAX_UPLOAD_BYTES: Record<UploadKind, number> = {
  avatar: 8 * 1024 * 1024,
  product: 15 * 1024 * 1024,
  /** WebP design previews from the 3D viewport (per view). */
  design: 3 * 1024 * 1024,
  /** Uploaded logo assets for customizer layers. */
  designAsset: 8 * 1024 * 1024,
  /** Optimized GLB product models (25 MB max after optimization). */
  productModel: 25 * 1024 * 1024,
}

/** Original GLB size limit accepted for optimization (120 MB). */
export const MAX_PRODUCT_MODEL_ORIGINAL_BYTES = 120 * 1024 * 1024

/** Recommended max size for a final product model (12 MB). */
export const RECOMMENDED_PRODUCT_MODEL_BYTES = 12 * 1024 * 1024

/** Maximum number of images allowed per product (v1). */
export const MAX_PRODUCT_IMAGES = 10

/** Default TTL for presigned PUT URLs, in seconds. */
export const PRESIGNED_PUT_TTL_SECONDS = 600

function readEnv(name: string): string | undefined {
  const value = process.env[name]
  if (value == null) return undefined
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : undefined
}

/**
 * Resolves R2 config from environment without throwing.
 *
 * @returns The config when every required variable is present, otherwise null.
 */
export function getR2ConfigOrNull(): R2Config | null {
  const accountId = readEnv('R2_ACCOUNT_ID')
  const accessKeyId = readEnv('R2_ACCESS_KEY_ID')
  const secretAccessKey = readEnv('R2_SECRET_ACCESS_KEY')
  const bucketName = readEnv('R2_BUCKET_NAME')
  const publicBaseUrl = readEnv('R2_PUBLIC_BASE_URL')

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicBaseUrl) {
    return null
  }

  return {
    accountId,
    accessKeyId,
    secretAccessKey,
    bucketName,
    publicBaseUrl: publicBaseUrl.replace(/\/+$/, ''),
    region: readEnv('R2_REGION') ?? 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
  }
}

/** True when all R2 environment variables are configured. */
export function isR2Configured(): boolean {
  return getR2ConfigOrNull() !== null
}

/**
 * Resolves R2 config or throws a domain error when not configured.
 *
 * @throws {R2StorageError} code `R2_NOT_CONFIGURED`.
 */
export function requireR2Config(): R2Config {
  const config = getR2ConfigOrNull()
  if (!config) {
    throw r2NotConfigured()
  }
  return config
}
