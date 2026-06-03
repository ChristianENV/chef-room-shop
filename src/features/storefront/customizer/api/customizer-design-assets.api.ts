import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'
import {
  CONFIRM_DESIGN_ASSET_UPLOAD_MUTATION,
  CREATE_DESIGN_ASSET_UPLOAD_MUTATION,
} from './customizer-design-assets.graphql'

export type CreateDesignAssetUploadInput = {
  designId: string
  assetType: 'LOGO'
  webpSizeBytes: number
  pngSizeBytes?: number | null
  originalFileName?: string | null
  originalContentType?: string | null
}

export type DesignAssetUploadPayload = {
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

export type DesignAssetUploadResult = {
  id: string
  designId: string
  type: string
  url: string
  publicId: string | null
  sortOrder: number | null
}

export async function createDesignAssetUpload(
  input: CreateDesignAssetUploadInput,
): Promise<DesignAssetUploadPayload> {
  const data = await fetchGraphQL<
    { createDesignAssetUpload: DesignAssetUploadPayload },
    { input: CreateDesignAssetUploadInput }
  >({
    query: CREATE_DESIGN_ASSET_UPLOAD_MUTATION,
    variables: { input },
  })
  return data.createDesignAssetUpload
}

export async function confirmDesignAssetUpload(uploadId: string): Promise<DesignAssetUploadResult> {
  const data = await fetchGraphQL<
    { confirmDesignAssetUpload: DesignAssetUploadResult },
    { input: { uploadId: string } }
  >({
    query: CONFIRM_DESIGN_ASSET_UPLOAD_MUTATION,
    variables: { input: { uploadId } },
  })
  return data.confirmDesignAssetUpload
}
