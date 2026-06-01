'use client'

import { useMutation, useQueryClient } from '@tanstack/react-query'
import { useRouter } from 'next/navigation'

import { useSession } from '@/src/lib/auth/auth-client'

import type { AvatarUploadVariables, UserAvatarPayload } from '../types'
import { refreshUserAvatarCaches } from '../lib/avatar-cache'
import {
  confirmAvatarUpload,
  createAvatarUpload,
  putFileToR2,
} from './uploads.api'
import { uploadsMutationKeys } from './uploads.query-keys'

export type AvatarUploadMutationOptions = {
  /** Called after caches and session are refreshed. */
  onAvatarUpdated?: (imageUrl: string | null) => void
}

/**
 * Avatar upload flow: request presigned URLs → PUT files directly to R2 →
 * confirm so the server stores the public URL on `User.image`.
 *
 * On success, synchronizes TanStack Query, Better Auth session and App Router
 * so navbar and account UI update without a manual reload.
 */
export function useAvatarUploadMutation(options?: AvatarUploadMutationOptions) {
  const queryClient = useQueryClient()
  const router = useRouter()
  const { refetch: refetchSession } = useSession()

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
    onSuccess: async (payload) => {
      await refreshUserAvatarCaches({
        queryClient,
        imageUrl: payload.image,
        refetchSession,
        routerRefresh: () => router.refresh(),
      })
      options?.onAvatarUpdated?.(payload.image)
    },
  })
}
