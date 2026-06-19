/**
 * Product image processing for admin uploads.
 *
 * Produces WebP + JPG (max side 1600px) and a WebP thumbnail (max 400px).
 * EXIF orientation is not auto-applied in v1 — browsers usually respect it
 * when loading via createObjectURL; document as pending if issues arise.
 */

import {
  type CropArea,
  canvasToBlob,
  canvasToJpegBlob,
  getCroppedRectCanvas,
} from './image-processing'

export const PRODUCT_MAX_SIDE = 1600
export const PRODUCT_WEBP_QUALITY = 0.82
export const PRODUCT_JPG_QUALITY = 0.86
export const PRODUCT_THUMB_MAX_SIDE = 400
export const PRODUCT_THUMB_QUALITY = 0.78

export const MAX_PRODUCT_IMAGES = 10

export type ProcessedProductImageBlobs = {
  webp: Blob
  jpg: Blob
  thumb: Blob
}

export type ProcessedProductImageMeta = ProcessedProductImageBlobs & {
  estimatedBytes: number
}

/**
 * Crops, rotates and encodes a product image into WebP, JPG and thumbnail.
 */
export async function processProductImage(
  imageSrc: string,
  cropArea: CropArea,
  rotation: number,
): Promise<ProcessedProductImageMeta> {
  const mainCanvas = await getCroppedRectCanvas(imageSrc, cropArea, rotation, PRODUCT_MAX_SIDE)
  const thumbCanvas = await getCroppedRectCanvas(
    imageSrc,
    cropArea,
    rotation,
    PRODUCT_THUMB_MAX_SIDE,
  )

  const [webp, jpg, thumb] = await Promise.all([
    canvasToBlob(mainCanvas, 'image/webp', PRODUCT_WEBP_QUALITY),
    canvasToJpegBlob(mainCanvas, PRODUCT_JPG_QUALITY),
    canvasToBlob(thumbCanvas, 'image/webp', PRODUCT_THUMB_QUALITY),
  ])

  return {
    webp,
    jpg,
    thumb,
    estimatedBytes: webp.size + jpg.size + thumb.size,
  }
}
