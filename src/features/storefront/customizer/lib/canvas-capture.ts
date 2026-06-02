/** Max dimension (longest side) for exported design previews. */
export const DESIGN_PREVIEW_MAX_DIMENSION = 1200

/** WebP quality for design preview exports (0–1). */
export const DESIGN_PREVIEW_WEBP_QUALITY = 0.82

/** Editor background painted behind the WebGL canvas when exporting. */
export const DESIGN_PREVIEW_BACKGROUND = '#0c0c18'

/**
 * Scales a source canvas/image to WebP blob with a max dimension cap.
 */
export async function canvasToWebpBlob(
  source: CanvasImageSource,
  sourceWidth: number,
  sourceHeight: number,
  maxDimension: number,
  quality: number,
): Promise<Blob> {
  const longest = Math.max(sourceWidth, sourceHeight)
  const scale = longest > maxDimension ? maxDimension / longest : 1
  const width = Math.max(1, Math.round(sourceWidth * scale))
  const height = Math.max(1, Math.round(sourceHeight * scale))

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) {
    throw new Error('No se pudo preparar el lienzo de exportación.')
  }

  ctx.fillStyle = DESIGN_PREVIEW_BACKGROUND
  ctx.fillRect(0, 0, width, height)
  ctx.drawImage(source, 0, 0, width, height)

  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (blob) => {
        if (blob) resolve(blob)
        else reject(new Error('No se pudo generar la imagen WebP.'))
      },
      'image/webp',
      quality,
    )
  })
}

/**
 * Captures the WebGL canvas after an explicit render pass.
 * Requires `preserveDrawingBuffer: true` on the R3F Canvas.
 */
export async function captureWebGLCanvasAsWebp(
  canvas: HTMLCanvasElement,
  maxDimension: number,
  quality: number,
): Promise<Blob> {
  return canvasToWebpBlob(canvas, canvas.width, canvas.height, maxDimension, quality)
}
