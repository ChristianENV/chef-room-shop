import type { AccountDesignGql } from '../account/account.types'

export type CreateDesignDraftInput = {
  productId: string
  productVariantId?: string | null
  configJson: unknown
}

export type UpdateDesignInput = {
  designId: string
  configJson: unknown
}

export type SaveDesignPreviewInput = {
  designId: string
  previewUrl: string
  previewPublicId?: string | null
}

export type CreateDesignPreviewUploadInput = {
  designId: string
  frontWebpSizeBytes: number
  backWebpSizeBytes: number
  frontJpgSizeBytes?: number | null
  backJpgSizeBytes?: number | null
}

export type ConfirmDesignPreviewUploadInput = {
  uploadId: string
}

export type DesignPreviewViewUrlsGql = {
  webp: string
  jpg: string
}

export type DesignPreviewUploadPayloadGql = {
  uploadId: string
  keys: {
    front: DesignPreviewViewUrlsGql
    back: DesignPreviewViewUrlsGql
  }
  publicUrls: {
    front: DesignPreviewViewUrlsGql
    back: DesignPreviewViewUrlsGql
  }
  presignedUrls: {
    front: DesignPreviewViewUrlsGql
    back: DesignPreviewViewUrlsGql
  }
  expiresAt: string
}

export type DeleteDesignDraftInput = {
  designId: string
}

export type DesignByIdInput = {
  designId: string
}

export type DesignMutationPayloadGql = {
  design: AccountDesignGql
}
