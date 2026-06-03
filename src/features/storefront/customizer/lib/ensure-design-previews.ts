import type { RefObject } from 'react'
import type { ViewportCaptureHandle } from '../components/viewport-capture-bridge'
import { hasCompleteDesignPreviews } from './design-preview-config'
import { uploadDesignPreviewBlobs, type DesignPreviewUploadPhase } from './upload-design-previews'

export type EnsureDesignPreviewsParams = {
  designId: string
  previewUrl: string | null | undefined
  configJson: unknown
  viewMode: '2D' | '3D'
  captureRef: RefObject<ViewportCaptureHandle | null>
  onPhase?: (phase: 'capturing' | DesignPreviewUploadPhase) => void
}

export type EnsureDesignPreviewsResult =
  | { ok: true; previewUrl: string | null; configJson: unknown }
  | { ok: false; reason: 'no_3d' | 'capture_failed' | 'upload_failed' }

/**
 * Ensures front/back preview URLs exist before cart/checkout snapshots.
 * Captures from the 3D viewport when previews are missing.
 */
export async function ensureDesignPreviews(
  params: EnsureDesignPreviewsParams,
): Promise<EnsureDesignPreviewsResult> {
  if (hasCompleteDesignPreviews(params.previewUrl, params.configJson)) {
    return { ok: true, previewUrl: params.previewUrl ?? null, configJson: params.configJson }
  }

  if (params.viewMode !== '3D') {
    return { ok: false, reason: 'no_3d' }
  }

  const capture = params.captureRef.current
  if (!capture) {
    return { ok: false, reason: 'capture_failed' }
  }

  try {
    params.onPhase?.('capturing')
    const blobs = await capture.captureDesignPreviews()
    if (!blobs) {
      return { ok: false, reason: 'capture_failed' }
    }

    const uploaded = await uploadDesignPreviewBlobs(params.designId, blobs, (phase) => {
      params.onPhase?.(phase)
    })
    return {
      ok: true,
      previewUrl: uploaded.previewUrl,
      configJson: uploaded.configJson,
    }
  } catch {
    return { ok: false, reason: 'upload_failed' }
  }
}
