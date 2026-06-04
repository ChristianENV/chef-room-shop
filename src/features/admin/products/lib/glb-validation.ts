/** Maximum original GLB size accepted for upload/optimization: 120 MB. */
export const MAX_GLB_ORIGINAL_BYTES = 120 * 1024 * 1024

/** Max final (optimized) size allowed for upload: 25 MB. */
export const MAX_GLB_OPTIMIZED_BYTES = 25 * 1024 * 1024

/** Threshold above which we show a "heavy model" warning: 12 MB. */
export const RECOMMENDED_GLB_BYTES = 12 * 1024 * 1024

/** GLB magic bytes: 0x46546C67 ("glTF" in little-endian). */
const GLB_MAGIC = new Uint8Array([0x67, 0x6c, 0x54, 0x46])

export type GlbValidationResult =
  | { ok: true; sizeBytes: number; sizeWarning: string | null }
  | { ok: false; error: string }

/**
 * Validates a file as a GLB 3D model:
 * - Extension must be .glb.
 * - Magic bytes must match glTF binary spec.
 * - Size must be within accepted range.
 */
export async function validateGlbFile(file: File): Promise<GlbValidationResult> {
  if (!file.name.toLowerCase().endsWith('.glb')) {
    return {
      ok: false,
      error:
        'Solo se aceptan archivos .glb para modelos 3D. No se permiten .max, .blend, .fbx, .obj ni .zip.',
    }
  }

  if (file.size > MAX_GLB_ORIGINAL_BYTES) {
    const mb = Math.round(file.size / 1024 / 1024)
    return {
      ok: false,
      error: `El archivo pesa ${mb} MB y excede el límite de ${MAX_GLB_ORIGINAL_BYTES / 1024 / 1024} MB. Optimízalo antes de subirlo con: pnpm glb:optimize`,
    }
  }

  // Check GLB magic bytes (first 4 bytes = 0x46546C67 "glTF").
  const header = await file.slice(0, 4).arrayBuffer()
  const magic = new Uint8Array(header)
  for (let i = 0; i < GLB_MAGIC.length; i++) {
    if (magic[i] !== GLB_MAGIC[i]) {
      return {
        ok: false,
        error:
          'El archivo no parece ser un GLB válido (magic bytes incorrectos). Verifica que el archivo no esté corrupto.',
      }
    }
  }

  const sizeWarning =
    file.size > RECOMMENDED_GLB_BYTES
      ? `El modelo pesa ${Math.round(file.size / 1024 / 1024)} MB. Recomendamos menos de ${RECOMMENDED_GLB_BYTES / 1024 / 1024} MB para carga rápida. Se intentará optimizar antes de subir.`
      : null

  return { ok: true, sizeBytes: file.size, sizeWarning }
}
