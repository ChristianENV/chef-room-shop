export type GlbOptimizationResult =
  | {
      ok: true
      blob: Blob
      originalSizeBytes: number
      optimizedSizeBytes: number
      compressionRatio: number
      durationMs: number
      warnings: string[]
    }
  | {
      ok: false
      error: string
      /** Original file returned as fallback when optimization failed but file is small enough. */
      fallbackBlob?: Blob
      originalSizeBytes: number
    }

export type GlbOptimizationProgress = {
  stage:
    | 'preparing'
    | 'reading'
    | 'dedup'
    | 'prune'
    | 'weld'
    | 'reorder'
    | 'quantize'
    | 'writing'
    | 'done'
  percent: number
  message: string
}
