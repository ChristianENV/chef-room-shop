'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'

import { accountQueryKeys } from '@/src/features/storefront/account/api/account.query-keys'

import type { AvatarUploadVariables, UserAvatarPayload } from '../types'
import {
  confirmAvatarUpload,
  createAvatarUpload,
  putFileToR2,
} from './uploads.api'
import { uploadsMutationKeys } from './uploads.query-keys'

/**
 * Avatar upload flow: request presigned URLs → PUT files directly to R2 →
 * confirm so the server stores the public URL on `User.image`.
 *
 * The UI is responsible for converting the source image to WebP (and an
 * optional JPG fallback) before calling this hook.
 */
export function useAvatarUploadMutation() {
  const queryClient = useQueryClient()

  return useMutation<UserAvatarPayload, Error, AvatarUploadVariables>({
    mutationKey: uploadsMutationKeys.avatar(),
    mutationFn: async ({ files, onProgress }) => {
      const created = await createAvatarUpload({
        webpSizeBytes: files.webp.size,
        jpgSizeBytes: files.jpg?.size ?? null,
        originalFileName: files.originalFileName ?? null,
        originalContentType: files.originalContentType ?? null,
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

      return confirmAvatarUpload(created.uploadId)
    },
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.profile() })
      void queryClient.invalidateQueries({ queryKey: accountQueryKeys.summary() })
    },
  })
}
