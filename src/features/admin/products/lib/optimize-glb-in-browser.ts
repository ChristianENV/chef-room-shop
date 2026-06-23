/**
 * Client-side GLB optimization using @gltf-transform/core (WebIO path).
 *
 * Pipeline: dedup → prune → weld → reorder → quantize
 *
 * meshopt compression (EXT_meshopt_compression) is NOT applied here because
 * the MeshoptEncoder WASM bundle requires an async initialization step that
 * can fail in some browsers. The resulting GLB is already significantly
 * smaller through vertex deduplication and quantization.
 *
 * For maximum compression (Meshopt/Draco), use the Node.js script:
 *   pnpm glb:optimize input.glb output.glb
 */

import { WebIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import { dedup, prune, weld, reorder, quantize } from '@gltf-transform/functions'
import type { GlbOptimizationProgress, GlbOptimizationResult } from './glb-optimization.types'
import { MAX_GLB_OPTIMIZED_BYTES, RECOMMENDED_GLB_BYTES } from './glb-validation'

type ProgressCallback = (progress: GlbOptimizationProgress) => void

const STAGES: GlbOptimizationProgress[] = [
  { stage: 'preparing', percent: 5, message: 'Preparando optimizador 3D…' },
  { stage: 'reading', percent: 15, message: 'Leyendo modelo…' },
  { stage: 'dedup', percent: 30, message: 'Eliminando duplicados…' },
  { stage: 'prune', percent: 45, message: 'Limpiando nodos no referenciados…' },
  { stage: 'weld', percent: 58, message: 'Fusionando vértices…' },
  { stage: 'reorder', percent: 72, message: 'Optimizando caché de vértices…' },
  { stage: 'quantize', percent: 86, message: 'Comprimiendo atributos…' },
  { stage: 'writing', percent: 95, message: 'Generando archivo final…' },
  { stage: 'done', percent: 100, message: 'Optimización completada.' },
]

export async function optimizeGlbInBrowser(
  file: File,
  onProgress?: ProgressCallback,
): Promise<GlbOptimizationResult> {
  const startMs = Date.now()
  const originalSizeBytes = file.size
  const warnings: string[] = []

  const report = (stage: GlbOptimizationProgress['stage']) => {
    const s = STAGES.find((x) => x.stage === stage)
    if (s) onProgress?.(s)
  }

  try {
    report('preparing')
    const io = new WebIO().registerExtensions(KHRONOS_EXTENSIONS)

    report('reading')
    const buffer = await file.arrayBuffer()
    const document = await io.readBinary(new Uint8Array(buffer))

    report('dedup')
    await document.transform(dedup())

    report('prune')
    await document.transform(prune())

    report('weld')
    // tolerance is available in gltf-transform v4+ as WeldOptions.tolerance
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await document.transform(weld({ tolerance: 1e-4 } as any))

    report('reorder')
    try {
      // reorder requires MeshoptEncoder — skip gracefully if WASM unavailable
      const { MeshoptEncoder } = await import('meshoptimizer')
      await MeshoptEncoder.ready
      await document.transform(reorder({ encoder: MeshoptEncoder }))
    } catch {
      warnings.push('Reorder (meshopt) no disponible en este entorno; omitido.')
    }

    report('quantize')
    await document.transform(quantize())

    report('writing')
    const outputArray = await io.writeBinary(document)
    const blob = new Blob([outputArray], { type: 'model/gltf-binary' })
    const optimizedSizeBytes = blob.size

    report('done')

    if (optimizedSizeBytes > MAX_GLB_OPTIMIZED_BYTES) {
      const mb = Math.round(optimizedSizeBytes / 1024 / 1024)
      return {
        ok: false,
        error: `El modelo optimizado sigue pesando ${mb} MB (límite: ${MAX_GLB_OPTIMIZED_BYTES / 1024 / 1024} MB). Reduce texturas o polígonos offline con: pnpm glb:optimize`,
        originalSizeBytes,
        fallbackBlob:
          originalSizeBytes <= RECOMMENDED_GLB_BYTES
            ? new Blob([buffer], { type: 'model/gltf-binary' })
            : undefined,
      }
    }

    if (optimizedSizeBytes > RECOMMENDED_GLB_BYTES) {
      warnings.push(
        `El modelo optimizado pesa ${Math.round(optimizedSizeBytes / 1024 / 1024)} MB. Para mejor rendimiento, considera reducir texturas.`,
      )
    }

    const compressionRatio = originalSizeBytes > 0 ? optimizedSizeBytes / originalSizeBytes : 1

    return {
      ok: true,
      blob,
      originalSizeBytes,
      optimizedSizeBytes,
      compressionRatio,
      durationMs: Date.now() - startMs,
      warnings,
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err)

    // If optimization fails but file is small enough, offer it as fallback.
    if (originalSizeBytes <= RECOMMENDED_GLB_BYTES) {
      const fallbackBuf = await file.arrayBuffer()
      return {
        ok: false,
        error: `Optimización falló: ${message}. El archivo original se puede subir (${Math.round(originalSizeBytes / 1024 / 1024)} MB).`,
        fallbackBlob: new Blob([fallbackBuf], { type: 'model/gltf-binary' }),
        originalSizeBytes,
      }
    }

    return {
      ok: false,
      error: `Optimización falló: ${message}. Optimiza el archivo offline con: pnpm glb:optimize`,
      originalSizeBytes,
    }
  }
}
