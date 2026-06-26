'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { adminProductTypesQueryKeys } from '@/src/features/admin/product-types/api/admin-product-types.query-keys'
import { catalogQueryKeys } from '@/src/features/storefront/catalog/api/catalog.query-keys'

import type { ProductTypeCardImageUploadVariables } from '../types'
import {
  confirmAdminProductTypeImageUpload,
  createAdminProductTypeImageUpload,
  putFileToR2,
} from './uploads.api'
import { uploadsMutationKeys } from './uploads.query-keys'

/**
 * Category card image upload: presigned URLs → R2 PUT → confirm on ProductType.
 */
export function useProductTypeCardImageUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async ({ files, onProgress }: ProductTypeCardImageUploadVariables) => {
      const created = await createAdminProductTypeImageUpload({
        productTypeId: files.productTypeId,
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

      return confirmAdminProductTypeImageUpload({
        uploadId: created.uploadId,
        altText: files.altText ?? null,
      })
    },
    onSuccess: (_payload, variables) => {
      void queryClient.invalidateQueries({ queryKey: adminProductTypesQueryKeys.all })
      void queryClient.invalidateQueries({ queryKey: catalogQueryKeys.all })
      void queryClient.invalidateQueries({
        queryKey: uploadsMutationKeys.productTypeCardImage(variables.files.productTypeId),
      })
    },
  })
}
