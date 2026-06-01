/**
 * Core canvas utilities for client-side image processing.
 *
 * All functions run in the browser — nothing goes to the server before the
 * user confirms. The output is a plain 1:1 square (circular masking is handled
 * by CSS), so the stored file is a standard rectangular image.
 */

/** Pixel area produced by react-easy-crop's `onCropComplete` callback. */
export type CropArea = {
  x: number
  y: number
  width: number
  height: number
}

/**
 * Loads an image URL into an HTMLImageElement, resolving when ready.
 */
export function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.addEventListener('load', () => resolve(img))
    img.addEventListener('error', (event) => reject(event))
    img.setAttribute('crossOrigin', 'anonymous')
    img.src = src
  })
}

/**
 * Creates a canvas with the cropped and rotated image region.
 *
 * @param imageSrc   Object URL or data URL of the source image.
 * @param cropArea   Pixel coordinates from react-easy-crop.
 * @param rotation   Degrees (0–360) to rotate before cropping.
 * @param targetSize Output canvas side length in pixels (square).
 */
export async function getCroppedCanvas(
  imageSrc: string,
  cropArea: CropArea,
  rotation: number,
  targetSize: number,
): Promise<HTMLCanvasElement> {
  const image = await loadImage(imageSrc)

  // Intermediate canvas large enough to hold the rotated source without clipping.
  const diagonal = Math.ceil(
    Math.sqrt(image.width * image.width + image.height * image.height),
  )

  const rotationCanvas = document.createElement('canvas')
  rotationCanvas.width = diagonal
  rotationCanvas.height = diagonal

  const rotCtx = rotationCanvas.getContext('2d')
  if (!rotCtx) throw new Error('No se pudo crear el contexto 2D del canvas.')

  rotCtx.save()
  rotCtx.translate(diagonal / 2, diagonal / 2)
  rotCtx.rotate((rotation * Math.PI) / 180)
  rotCtx.drawImage(image, -image.width / 2, -image.height / 2)
  rotCtx.restore()

  // The crop area is defined in the coordinate space of the *original* image.
  // After rotation the image is centred in a larger canvas, so we shift it.
  const offsetX = (diagonal - image.width) / 2
  const offsetY = (diagonal - image.height) / 2

  const outputCanvas = document.createElement('canvas')
  outputCanvas.width = targetSize
  outputCanvas.height = targetSize

  const ctx = outputCanvas.getContext('2d')
  if (!ctx) throw new Error('No se pudo crear el contexto 2D de salida.')

  ctx.drawImage(
    rotationCanvas,
    cropArea.x + offsetX,
    cropArea.y + offsetY,
    cropArea.width,
    cropArea.height,
    0,
    0,
    targetSize,
    targetSize,
  )

  return outputCanvas
}

/**
 * Exports an HTMLCanvasElement to a Blob with the specified MIME type and
 * quality. Throws when the browser cannot produce the requested format.
 */
export function canvasToBlob(
  canvas: HTMLCanvasElement,
  type: 'image/webp' | 'image/jpeg',
  quality: number,
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (!blob) {
          reject(new Error(`No se pudo exportar la imagen como ${type}.`))
          return
        }
        resolve(blob)
      },
      type,
      quality,
    )
  })
}

/**
 * Converts a File or Blob to an object URL that can be passed to
 * {@link getCroppedCanvas}. Always call URL.revokeObjectURL when done.
 */
export function createObjectUrl(file: File | Blob): string {
  return URL.createObjectURL(file)
}

/** Maximum bytes accepted as an input image (16 MB safety cap). */
export const MAX_INPUT_BYTES = 16 * 1024 * 1024

/** Allowed original MIME types from the file picker. */
export const ALLOWED_MIME_TYPES: ReadonlySet<string> = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
])

/**
 * Validates an input file. Returns an error message or `null` when valid.
 */
export function validateImageFile(file: File): string | null {
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Usa un archivo JPG, PNG o WebP.'
  }
  if (file.size > MAX_INPUT_BYTES) {
    return 'El archivo es demasiado grande. Máximo 16 MB.'
  }
  return null
}
