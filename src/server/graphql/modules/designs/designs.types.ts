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

export type CreateDesignAssetUploadInput = {
  designId: string
  assetType: 'LOGO'
  webpSizeBytes: number
  pngSizeBytes?: number | null
  originalFileName?: string | null
  originalContentType?: string | null
}

export type ConfirmDesignAssetUploadInput = {
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

export type DesignAssetUploadPayloadGql = {
  uploadId: string
  assetId: string
  expiresAt: string
  keys: {
    webp: string
    png: string
  }
  publicUrls: {
    webp: string
    png: string
  }
  presignedUrls: {
    webp: string
    png: string
  }
}

export type DesignAssetGql = {
  id: string
  designId: string
  type: string
  url: string
  publicId: string | null
  sortOrder: number | null
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
