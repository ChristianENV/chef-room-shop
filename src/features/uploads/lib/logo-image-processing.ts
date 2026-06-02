import { ALLOWED_MIME_TYPES, canvasToBlob, createObjectUrl, loadImage } from './image-processing'

export const LOGO_MAX_SIDE = 800
export const LOGO_WEBP_QUALITY = 0.86
export const LOGO_MAX_INPUT_BYTES = 8 * 1024 * 1024

export type ProcessedLogoUpload = {
  webp: Blob
  png?: Blob
  width: number
  height: number
}

export function validateLogoFile(file: File): string | null {
  if (file.type === 'image/svg+xml') {
    return 'Los archivos SVG aún no son compatibles. Usa PNG, JPG o WebP.'
  }
  if (!ALLOWED_MIME_TYPES.has(file.type)) {
    return 'Formato no soportado. Usa PNG, JPG o WebP.'
  }
  if (file.size > LOGO_MAX_INPUT_BYTES) {
    return 'El archivo es demasiado grande. Máximo 8 MB.'
  }
  return null
}

export async function processLogoImage(file: File): Promise<ProcessedLogoUpload> {
  const validationError = validateLogoFile(file)
  if (validationError) {
    throw new Error(validationError)
  }

  const objectUrl = createObjectUrl(file)
  try {
    const image = await loadImage(objectUrl)
    const longest = Math.max(image.width, image.height)
    const scale = longest > LOGO_MAX_SIDE ? LOGO_MAX_SIDE / longest : 1
    const width = Math.max(1, Math.round(image.width * scale))
    const height = Math.max(1, Math.round(image.height * scale))

    const canvas = document.createElement('canvas')
    canvas.width = width
    canvas.height = height
    const context = canvas.getContext('2d')
    if (!context) {
      throw new Error('No pudimos preparar el logotipo en tu navegador.')
    }

    context.clearRect(0, 0, width, height)
    context.drawImage(image, 0, 0, width, height)

    const webp = await canvasToBlob(canvas, 'image/webp', LOGO_WEBP_QUALITY)
    return { webp, png: undefined, width, height }
  } finally {
    URL.revokeObjectURL(objectUrl)
  }
}
