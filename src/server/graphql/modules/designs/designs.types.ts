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

export type DeleteDesignDraftInput = {
  designId: string
}

export type DesignByIdInput = {
  designId: string
}

export type DesignMutationPayloadGql = {
  design: AccountDesignGql
}
