import 'server-only'

import { PutObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

import { getR2Client } from './r2.client'
import { PRESIGNED_PUT_TTL_SECONDS, STORED_CONTENT_TYPES, requireR2Config } from './r2.config'
import { R2StorageError } from './r2.errors'
import type {
  CreatePresignedPutInput,
  PresignedPutUrl,
  R2ObjectKeys,
} from './r2.types'

/**
 * Creates a presigned PUT URL for a single object.
 *
 * The URL is signed with a fixed `Content-Type`, so the client MUST send the
 * exact same `Content-Type` header on the PUT or R2 rejects the request.
 *
 * @throws {R2StorageError} code `R2_PRESIGN_FAILED` on signing errors.
 */
export async function createR2PresignedPutUrl(
  input: CreatePresignedPutInput,
): Promise<PresignedPutUrl> {
  const { bucketName } = requireR2Config()
  const expiresIn = input.expiresInSeconds ?? PRESIGNED_PUT_TTL_SECONDS

  try {
    const url = await getSignedUrl(
      getR2Client(),
      new PutObjectCommand({
        Bucket: bucketName,
        Key: input.key,
        ContentType: input.contentType,
      }),
      { expiresIn },
    )

    return { key: input.key, url, contentType: input.contentType }
  } catch (error) {
    throw new R2StorageError(
      'R2_PRESIGN_FAILED',
      `No se pudo generar la URL de subida: ${
        error instanceof Error ? error.message : 'error desconocido'
      }`,
    )
  }
}

/**
 * Creates presigned PUT URLs for a full set of object keys (webp + jpg + thumb).
 */
export async function createPresignedPutUrlsForKeys(
  keys: R2ObjectKeys,
  expiresInSeconds = PRESIGNED_PUT_TTL_SECONDS,
): Promise<{ webp: PresignedPutUrl; jpg: PresignedPutUrl; thumb?: PresignedPutUrl }> {
  const [webp, jpg, thumb] = await Promise.all([
    createR2PresignedPutUrl({
      key: keys.webp,
      contentType: STORED_CONTENT_TYPES.webp,
      expiresInSeconds,
    }),
    createR2PresignedPutUrl({
      key: keys.jpg,
      contentType: STORED_CONTENT_TYPES.jpg,
      expiresInSeconds,
    }),
    keys.thumb
      ? createR2PresignedPutUrl({
          key: keys.thumb,
          contentType: STORED_CONTENT_TYPES.webp,
          expiresInSeconds,
        })
      : Promise.resolve(undefined),
  ])

  return { webp, jpg, ...(thumb ? { thumb } : {}) }
}
