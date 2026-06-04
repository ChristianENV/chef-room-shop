'use client'

import { useCallback, useRef, useState } from 'react'
import { AlertTriangle, Box, CheckCircle2, Loader2, Trash2, UploadCloud, X } from 'lucide-react'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Progress } from '@/components/ui/progress'
import {
  useAdminProductModelUploadMutation,
  useDeleteAdminProductModelAssetMutation,
  type AdminProductModel3dResult,
  type UploadProductModelStage,
} from '../api/use-admin-product-model-upload-mutation'
import type { GlbOptimizationProgress } from '../lib/glb-optimization.types'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatPercent(ratio: number): string {
  return `${Math.round((1 - ratio) * 100)}%`
}

type Props = {
  productId: string | null
  initialModel3d?: AdminProductModel3dResult | null
}

type LocalState = {
  stage: UploadProductModelStage
  file: File | null
  originalSizeBytes: number | null
  optimizedSizeBytes: number | null
  compressionRatio: number | null
  optimizationProgress: GlbOptimizationProgress | null
  uploadPercent: number
  error: string | null
  warnings: string[]
  result: AdminProductModel3dResult | null
}

const INITIAL_STATE: LocalState = {
  stage: 'idle',
  file: null,
  originalSizeBytes: null,
  optimizedSizeBytes: null,
  compressionRatio: null,
  optimizationProgress: null,
  uploadPercent: 0,
  error: null,
  warnings: [],
  result: null,
}

export function ProductModel3DUploader({ productId, initialModel3d }: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<LocalState>({
    ...INITIAL_STATE,
    result: initialModel3d ?? null,
    stage: initialModel3d ? 'success' : 'idle',
  })
  const [isDragging, setIsDragging] = useState(false)

  const { uploadModel } = useAdminProductModelUploadMutation()
  const { mutate: deleteModel, isPending: isDeleting } = useDeleteAdminProductModelAssetMutation()

  const handleFile = useCallback(
    async (file: File) => {
      if (!productId) return

      setState((s) => ({ ...s, file, stage: 'validating', error: null, warnings: [] }))

      const result = await uploadModel({
        productId,
        file,
        onStageChange: (stage) =>
          setState((s) => ({ ...s, stage })),
        onOptimizationProgress: (progress) =>
          setState((s) => ({ ...s, optimizationProgress: progress })),
      })

      setState((s) => ({
        ...s,
        stage: result.stage,
        originalSizeBytes: result.originalSizeBytes,
        optimizedSizeBytes: result.optimizedSizeBytes,
        compressionRatio: result.compressionRatio,
        error: result.error,
        warnings: result.warnings,
        result: result.result,
      }))
    },
    [productId, uploadModel],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const handleDelete = () => {
    if (!state.result) return
    deleteModel(state.result.id, {
      onSuccess: () => setState({ ...INITIAL_STATE }),
    })
  }

  const handleReplace = () => {
    setState({ ...INITIAL_STATE })
  }

  const { stage, file, optimizationProgress, error, warnings, result, originalSizeBytes, optimizedSizeBytes, compressionRatio } = state

  // ── No product saved yet ────────────────────────────────────────────────────
  if (!productId) {
    return (
      <div className="rounded-lg border border-dashed border-[#E2E0DB] bg-[#fafaf8] p-6 text-center">
        <Box className="mx-auto mb-3 h-8 w-8 text-[#2B3280]/30" />
        <p className="text-sm font-medium text-muted-foreground">
          Guarda el producto para subir un modelo 3D.
        </p>
      </div>
    )
  }

  // ── Success ─────────────────────────────────────────────────────────────────
  if (stage === 'success' && result) {
    return (
      <div className="space-y-3">
        <Card className="border-[#E2E0DB] bg-[#fafaf8]">
          <CardContent className="flex items-start gap-4 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-[#2B3280]/10">
              <Box className="h-5 w-5 text-[#2B3280]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span className="truncate text-sm font-medium">{result.fileName}</span>
                <Badge variant="secondary" className="shrink-0 text-xs">GLB</Badge>
                {result.isActive && (
                  <Badge className="shrink-0 bg-emerald-100 text-xs text-emerald-700">Activo</Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Tamaño: {formatBytes(result.sizeBytes)}</span>
                {result.originalSizeBytes && result.originalSizeBytes > result.sizeBytes && (
                  <span className="text-emerald-600">
                    Original: {formatBytes(result.originalSizeBytes)} → optimizado{' '}
                    {result.compressionRatio
                      ? `(ahorro ${formatPercent(result.compressionRatio)})`
                      : ''}
                  </span>
                )}
              </div>
              <a
                href={result.url}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 block truncate text-xs text-[#2B3280] underline underline-offset-2 hover:opacity-80"
              >
                Ver en R2
              </a>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button size="sm" variant="outline" onClick={handleReplace} className="text-xs">
                Reemplazar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={isDeleting}
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
              </Button>
            </div>
          </CardContent>
        </Card>
        {warnings.length > 0 && (
          <Alert variant="default" className="border-amber-200 bg-amber-50">
            <AlertTriangle className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-xs text-amber-700">
              {warnings.map((w, i) => <p key={i}>{w}</p>)}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  // ── Optimizing ──────────────────────────────────────────────────────────────
  if (stage === 'optimizing') {
    return (
      <Card className="border-[#E2E0DB] bg-[#fafaf8]">
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-[#2B3280]" />
            <span className="text-sm font-medium text-[#2B3280]">
              {optimizationProgress?.message ?? 'Optimizando modelo…'}
            </span>
          </div>
          <Progress
            value={optimizationProgress?.percent ?? 0}
            className="h-1.5 bg-[#E2E0DB] [&>div]:bg-[#2B3280]"
          />
          {file && originalSizeBytes && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className="rounded-lg bg-white p-3 text-center shadow-sm ring-1 ring-[#E2E0DB]">
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="mt-0.5 font-mono text-sm font-semibold">{formatBytes(originalSizeBytes)}</p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm ring-1 ring-[#E2E0DB]">
                <p className="text-xs text-muted-foreground">Optimizado</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-muted-foreground">
                  {optimizationProgress && optimizationProgress.percent > 80 && optimizedSizeBytes
                    ? formatBytes(optimizedSizeBytes)
                    : '—'}
                </p>
              </div>
              <div className="rounded-lg bg-white p-3 text-center shadow-sm ring-1 ring-[#E2E0DB]">
                <p className="text-xs text-muted-foreground">Ahorro est.</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-600">
                  {compressionRatio != null ? formatPercent(compressionRatio) : '—'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  // ── Uploading / Confirming ──────────────────────────────────────────────────
  if (stage === 'uploading' || stage === 'confirming' || stage === 'validating') {
    const msg =
      stage === 'validating'
        ? 'Validando modelo…'
        : stage === 'uploading'
          ? 'Subiendo modelo 3D a R2…'
          : 'Confirmando archivo…'
    return (
      <Card className="border-[#E2E0DB] bg-[#fafaf8]">
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-[#2B3280]" />
          <span className="text-sm font-medium text-[#2B3280]">{msg}</span>
        </CardContent>
      </Card>
    )
  }

  // ── Error ───────────────────────────────────────────────────────────────────
  if (stage === 'error') {
    return (
      <div className="space-y-3">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription className="text-xs">{error}</AlertDescription>
        </Alert>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setState({ ...INITIAL_STATE })}
          className="text-xs"
        >
          Reintentar
        </Button>
      </div>
    )
  }

  // ── Idle / Dropzone ─────────────────────────────────────────────────────────
  return (
    <div className="space-y-3">
      <div
        role="button"
        tabIndex={0}
        aria-label="Subir modelo 3D GLB"
        className={`group relative cursor-pointer rounded-xl border-2 border-dashed p-8 text-center transition-all ${
          isDragging
            ? 'border-[#2B3280] bg-[#2B3280]/5'
            : 'border-[#E2E0DB] bg-[#fafaf8] hover:border-[#2B3280]/40 hover:bg-[#2B3280]/[0.02]'
        }`}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(e) => (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true) }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".glb"
          className="hidden"
          onChange={handleInputChange}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#2B3280]/10 transition-colors group-hover:bg-[#2B3280]/15">
            {isDragging ? (
              <UploadCloud className="h-6 w-6 text-[#2B3280]" />
            ) : (
              <Box className="h-6 w-6 text-[#2B3280]" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo GLB aquí'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">o{' '}
              <span className="font-medium text-[#2B3280] underline underline-offset-2">
                selecciona un archivo
              </span>
            </p>
          </div>
          <p className="text-xs text-muted-foreground/70">
            Solo .glb · Recomendado {'<'} 12 MB · Máx 25 MB optimizado
          </p>
        </div>
      </div>

      {warnings.length > 0 && (
        <Alert variant="default" className="border-amber-200 bg-amber-50">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertDescription className="text-xs text-amber-700">
            {warnings.map((w, i) => <p key={i}>{w}</p>)}
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        El modelo se optimiza automáticamente antes de subirse.{' '}
        <a
          href="https://gltf.report"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-[#2B3280] underline underline-offset-2 hover:opacity-80"
        >
          Valida tu GLB aquí.
        </a>
      </p>
    </div>
  )
}
