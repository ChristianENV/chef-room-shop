import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'
import type { AccountDesign } from '@/src/features/storefront/account/types'

import {
  CONFIRM_DESIGN_PREVIEW_UPLOAD_MUTATION,
  CREATE_DESIGN_PREVIEW_UPLOAD_MUTATION,
} from './customizer-design-previews.graphql'

export type DesignPreviewViewUrls = {
  webp: string
  jpg: string
}

export type DesignPreviewUploadPayload = {
  uploadId: string
  expiresAt: string
  keys: {
    front: DesignPreviewViewUrls
    back: DesignPreviewViewUrls
  }
  publicUrls: {
    front: DesignPreviewViewUrls
    back: DesignPreviewViewUrls
  }
  presignedUrls: {
    front: DesignPreviewViewUrls
    back: DesignPreviewViewUrls
  }
}

export type CreateDesignPreviewUploadInput = {
  designId: string
  frontWebpSizeBytes: number
  backWebpSizeBytes: number
}

export async function createDesignPreviewUpload(
  input: CreateDesignPreviewUploadInput,
): Promise<DesignPreviewUploadPayload> {
  const data = await fetchGraphQL<
    { createDesignPreviewUpload: DesignPreviewUploadPayload },
    { input: CreateDesignPreviewUploadInput }
  >({
    query: CREATE_DESIGN_PREVIEW_UPLOAD_MUTATION,
    variables: { input },
  })
  return data.createDesignPreviewUpload
}

export async function confirmDesignPreviewUpload(uploadId: string): Promise<AccountDesign> {
  const data = await fetchGraphQL<
    { confirmDesignPreviewUpload: AccountDesign },
    { input: { uploadId: string } }
  >({
    query: CONFIRM_DESIGN_PREVIEW_UPLOAD_MUTATION,
    variables: { input: { uploadId } },
  })
  return data.confirmDesignPreviewUpload
}
