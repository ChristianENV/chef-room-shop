'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductsQueryKeys } from '@/src/features/admin/products/api/admin-products.query-keys'

import type { ProductImage, ProductImageUploadVariables } from '../types'
import { confirmProductImageUpload, createProductImageUpload, putFileToR2 } from './uploads.api'
import { uploadsMutationKeys } from './uploads.query-keys'

/**
 * Product image upload flow: request presigned URLs (webp + jpg + thumb) →
 * PUT each processed file directly to R2 → confirm so the server creates the
 * `ProductImage` row.
 *
 * The UI is responsible for producing the WebP, JPG and thumbnail blobs.
 */
export function useProductImageUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation<ProductImage, Error, ProductImageUploadVariables>({
    mutationFn: async ({ files, onProgress }) => {
      const created = await createProductImageUpload({
        productId: files.productId,
        imageId: files.imageId ?? null,
        webpSizeBytes: files.webp.size,
        jpgSizeBytes: files.jpg?.size ?? null,
        thumbSizeBytes: files.thumb?.size ?? null,
        originalFileName: files.originalFileName ?? null,
        altText: files.altText ?? null,
      })

      await putFileToR2({
        url: created.presignedUrls.webp,
        file: files.webp,
        contentType: 'image/webp',
        onProgress: (progress) => onProgress?.({ slot: 'webp', progress }),
      })

      if (files.jpg && created.presignedUrls.jpg) {
        await putFileToR2({
          url: created.presignedUrls.jpg,
          file: files.jpg,
          contentType: 'image/jpeg',
          onProgress: (progress) => onProgress?.({ slot: 'jpg', progress }),
        })
      }

      if (files.thumb && created.presignedUrls.thumb) {
        await putFileToR2({
          url: created.presignedUrls.thumb,
          file: files.thumb,
          contentType: 'image/webp',
          onProgress: (progress) => onProgress?.({ slot: 'thumb', progress }),
        })
      }

      return confirmProductImageUpload({
        uploadId: created.uploadId,
        altText: files.altText ?? null,
        isPrimary: files.isPrimary ?? null,
        sortOrder: files.sortOrder ?? null,
      })
    },
    onSuccess: (_image, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminProductsQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: uploadsMutationKeys.productImage(variables.files.productId),
      })
    },
  })
}
