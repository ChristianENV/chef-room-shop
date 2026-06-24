/**
 * Avatar-specific image processing.
 *
 * Produces a 256×256 square crop as WebP (quality 0.82) and JPG (quality 0.86).
 * The circular appearance is achieved purely via CSS — the file stored in R2 is
 * a standard square, which avoids PNG transparency overhead and maximises
 * cross-browser codec support.
 */

import { type CropArea, canvasToBlob, getCroppedCanvas } from './image-processing'

export const AVATAR_SIZE = 256
export const AVATAR_WEBP_QUALITY = 0.82
export const AVATAR_JPG_QUALITY = 0.86

export type ProcessedAvatarBlobs = {
  webp: Blob
  jpg: Blob
}

/**
 * Crops, rotates and encodes the source image into avatar-sized WebP + JPG.
 *
 * @param imageSrc  Object URL or data URL of the source image.
 * @param cropArea  Pixel crop area from react-easy-crop.
 * @param rotation  Degrees to rotate.
 */
export async function processAvatarImage(
  imageSrc: string,
  cropArea: CropArea,
  rotation: number,
): Promise<ProcessedAvatarBlobs> {
  const canvas = await getCroppedCanvas(imageSrc, cropArea, rotation, AVATAR_SIZE)
  const [webp, jpg] = await Promise.all([
    canvasToBlob(canvas, 'image/webp', AVATAR_WEBP_QUALITY),
    canvasToBlob(canvas, 'image/jpeg', AVATAR_JPG_QUALITY),
  ])
  return { webp, jpg }
}
