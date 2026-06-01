import type { ProductImage } from '@prisma/client'
import { GraphQLError } from 'graphql'

import { R2StorageError } from '@/src/server/storage/r2'
import type {
  PresignedPutUrl,
  R2ObjectKeys,
  R2PublicUrls,
} from '@/src/server/storage/r2'

import type {
  ProductImageGql,
  UploadKeysGql,
  UploadPresignedUrlsGql,
  UploadPublicUrlsGql,
} from './uploads.types'

/** Maps R2 object keys to the GraphQL keys shape (thumb optional → nullable). */
export function mapKeysToGql(keys: R2ObjectKeys): UploadKeysGql {
  return {
    webp: keys.webp,
    jpg: keys.jpg,
    thumb: keys.thumb ?? null,
  }
}

/** Maps R2 public URLs to the GraphQL shape. */
export function mapPublicUrlsToGql(urls: R2PublicUrls): UploadPublicUrlsGql {
  return {
    webp: urls.webp,
    jpg: urls.jpg,
    thumb: urls.thumb ?? null,
  }
}

/** Maps presigned PUT URLs to the GraphQL shape (only the URLs are exposed). */
export function mapPresignedUrlsToGql(presigned: {
  webp: PresignedPutUrl
  jpg: PresignedPutUrl
  thumb?: PresignedPutUrl
}): UploadPresignedUrlsGql {
  return {
    webp: presigned.webp.url,
    jpg: presigned.jpg.url,
    thumb: presigned.thumb?.url ?? null,
  }
}

/** Maps a Prisma ProductImage to the public GraphQL ProductImage type. */
export function mapProductImageToGql(image: ProductImage): ProductImageGql {
  return {
    id: image.id,
    url: image.url,
    publicId: image.publicId,
    alt: image.alt,
    sortOrder: image.sortOrder,
    isPrimary: image.isPrimary,
  }
}

/**
 * Converts an {@link R2StorageError} into a GraphQLError with a stable code so
 * the client can show a friendly message. Re-throws unknown errors untouched.
 */
export function toUploadGraphQLError(error: unknown): never {
  if (error instanceof R2StorageError) {
    const code = error.code === 'R2_NOT_CONFIGURED' ? 'SERVICE_UNAVAILABLE' : 'BAD_USER_INPUT'
    throw new GraphQLError(error.message, {
      extensions: { code, reason: error.code },
    })
  }
  throw error
}
