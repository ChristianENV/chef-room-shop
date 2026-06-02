import { putFileToR2 } from '@/src/features/uploads/api/uploads.api'
import {
  confirmDesignPreviewUpload,
  createDesignPreviewUpload,
} from '../api/customizer-design-previews.api'
import type { DesignPreviewBlobs } from '../components/viewport-capture-bridge'

export type DesignPreviewUploadPhase = 'uploading' | 'confirming'

/**
 * Uploads front/back WebP blobs to R2 via presigned PUT and confirms on the server.
 */
export async function uploadDesignPreviewBlobs(
  designId: string,
  blobs: DesignPreviewBlobs,
  onPhase?: (phase: DesignPreviewUploadPhase) => void,
): Promise<{ previewUrl: string | null; configJson: unknown; warning?: string | null }> {
  onPhase?.('uploading')
  const payload = await createDesignPreviewUpload({
    designId,
    frontWebpSizeBytes: blobs.front.size,
    backWebpSizeBytes: blobs.back.size,
  })

  await Promise.all([
    putFileToR2({
      url: payload.presignedUrls.front.webp,
      file: blobs.front,
      contentType: 'image/webp',
    }),
    putFileToR2({
      url: payload.presignedUrls.back.webp,
      file: blobs.back,
      contentType: 'image/webp',
    }),
  ])

  onPhase?.('confirming')
  const design = await confirmDesignPreviewUpload(payload.uploadId)
  return {
    previewUrl: design.previewUrl,
    configJson: design.configJson,
    warning: blobs.warning ?? null,
  }
}
