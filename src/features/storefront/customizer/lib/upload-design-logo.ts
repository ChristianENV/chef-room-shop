import { putFileToR2 } from '@/src/features/uploads/api/uploads.api'
import { processLogoImage } from '@/src/features/uploads/lib/logo-image-processing'
import {
  confirmDesignAssetUpload,
  createDesignAssetUpload,
} from '../api/customizer-design-assets.api'

export async function uploadDesignLogo(params: {
  file: File
  designId: string
}): Promise<{ assetUrl: string; assetPublicId: string; assetId: string }> {
  const processed = await processLogoImage(params.file)
  const upload = await createDesignAssetUpload({
    designId: params.designId,
    assetType: 'LOGO',
    webpSizeBytes: processed.webp.size,
    pngSizeBytes: processed.png?.size ?? null,
    originalFileName: params.file.name,
    originalContentType: params.file.type,
  })

  await putFileToR2({
    url: upload.presignedUrls.webp,
    file: processed.webp,
    contentType: 'image/webp',
  })

  if (processed.png) {
    await putFileToR2({
      url: upload.presignedUrls.png,
      file: processed.png,
      contentType: 'image/jpeg',
    })
  }

  const confirmed = await confirmDesignAssetUpload(upload.uploadId)
  return {
    assetId: confirmed.id,
    assetUrl: confirmed.url,
    assetPublicId: confirmed.publicId ?? confirmed.id,
  }
}
