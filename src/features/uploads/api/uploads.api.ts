import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  CONFIRM_AVATAR_UPLOAD_MUTATION,
  CONFIRM_PRODUCT_IMAGE_UPLOAD_MUTATION,
  CREATE_AVATAR_UPLOAD_MUTATION,
  CREATE_PRODUCT_IMAGE_UPLOAD_MUTATION,
} from '../graphql/uploads.mutations'
import type {
  AvatarUploadPayload,
  ConfirmProductImageUploadInput,
  CreateAvatarUploadInput,
  CreateProductImageUploadInput,
  ProductImage,
  ProductImageUploadPayload,
  StoredUploadContentType,
  UserAvatarPayload,
} from '../types'

export async function createAvatarUpload(
  input: CreateAvatarUploadInput,
): Promise<AvatarUploadPayload> {
  const data = await fetchGraphQL<
    { createAvatarUpload: AvatarUploadPayload },
    { input: CreateAvatarUploadInput }
  >({ query: CREATE_AVATAR_UPLOAD_MUTATION, variables: { input } })
  return data.createAvatarUpload
}

export async function confirmAvatarUpload(uploadId: string): Promise<UserAvatarPayload> {
  const data = await fetchGraphQL<
    { confirmAvatarUpload: UserAvatarPayload },
    { input: { uploadId: string } }
  >({ query: CONFIRM_AVATAR_UPLOAD_MUTATION, variables: { input: { uploadId } } })
  return data.confirmAvatarUpload
}

export async function createProductImageUpload(
  input: CreateProductImageUploadInput,
): Promise<ProductImageUploadPayload> {
  const data = await fetchGraphQL<
    { createProductImageUpload: ProductImageUploadPayload },
    { input: CreateProductImageUploadInput }
  >({ query: CREATE_PRODUCT_IMAGE_UPLOAD_MUTATION, variables: { input } })
  return data.createProductImageUpload
}

export async function confirmProductImageUpload(
  input: ConfirmProductImageUploadInput,
): Promise<ProductImage> {
  const data = await fetchGraphQL<
    { confirmProductImageUpload: ProductImage },
    { input: ConfirmProductImageUploadInput }
  >({ query: CONFIRM_PRODUCT_IMAGE_UPLOAD_MUTATION, variables: { input } })
  return data.confirmProductImageUpload
}

/**
 * Uploads a single file to R2 via a presigned PUT URL.
 *
 * Uses XHR (not fetch) to report upload progress. The `contentType` MUST match
 * the type the server signed the URL with, or R2 rejects the request.
 */
export function putFileToR2(params: {
  url: string
  file: Blob
  contentType: StoredUploadContentType
  onProgress?: (progress: number) => void
  signal?: AbortSignal
}): Promise<void> {
  const { url, file, contentType, onProgress, signal } = params

  return new Promise<void>((resolve, reject) => {
    const xhr = new XMLHttpRequest()
    xhr.open('PUT', url, true)
    xhr.setRequestHeader('Content-Type', contentType)

    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(event.loaded / event.total)
      }
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        onProgress?.(1)
        resolve()
      } else {
        reject(new Error(`R2 PUT falló (HTTP ${xhr.status}).`))
      }
    }

    xhr.onerror = () => reject(new Error('No se pudo conectar con el almacenamiento.'))
    xhr.onabort = () => reject(new Error('Subida cancelada.'))

    if (signal) {
      signal.addEventListener('abort', () => xhr.abort(), { once: true })
    }

    xhr.send(file)
  })
}
