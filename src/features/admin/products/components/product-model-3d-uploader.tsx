'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
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

const DROPZONE_BASE = 'rounded-xl border-2 border-dashed border-border bg-muted/30 transition-all'
const DROPZONE_IDLE = 'hover:border-primary/40 hover:bg-muted/50'
const DROPZONE_DRAG = 'border-primary bg-primary/5'
const PANEL_CARD = 'border-border bg-card'
const BRAND_ICON_WRAP =
  'flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10'
const STAT_BOX = 'rounded-lg bg-muted p-3 text-center ring-1 ring-border'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / 1024 / 1024).toFixed(1)} MB`
}

function formatPercent(ratio: number): string {
  return `${Math.round((1 - ratio) * 100)}%`
}

const BUSY_STAGES: UploadProductModelStage[] = [
  'validating',
  'optimizing',
  'uploading',
  'confirming',
]

type Props = {
  productId: string | null
  initialModel3d?: AdminProductModel3dResult | null
  disabled?: boolean
  onBusyChange?: (busy: boolean) => void
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

export function ProductModel3DUploader({
  productId,
  initialModel3d,
  disabled = false,
  onBusyChange,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [state, setState] = useState<LocalState>({
    ...INITIAL_STATE,
    result: initialModel3d ?? null,
    stage: initialModel3d ? 'success' : 'idle',
  })
  const [isDragging, setIsDragging] = useState(false)

  const { uploadModel } = useAdminProductModelUploadMutation()
  const { mutate: deleteModel, isPending: isDeleting } = useDeleteAdminProductModelAssetMutation()

  const isBusy = BUSY_STAGES.includes(state.stage) || isDeleting

  useEffect(() => {
    onBusyChange?.(isBusy)
  }, [isBusy, onBusyChange])

  const handleFile = useCallback(
    async (file: File) => {
      if (!productId || disabled) return

      setState((s) => ({ ...s, file, stage: 'validating', error: null, warnings: [] }))

      const result = await uploadModel({
        productId,
        file,
        onStageChange: (stage) => setState((s) => ({ ...s, stage })),
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
    [disabled, productId, uploadModel],
  )

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) void handleFile(file)
    e.target.value = ''
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setIsDragging(false)
    if (disabled) return
    const file = e.dataTransfer.files?.[0]
    if (file) void handleFile(file)
  }

  const handleDelete = () => {
    if (!state.result || disabled) return
    deleteModel(state.result.id, {
      onSuccess: () => setState({ ...INITIAL_STATE }),
    })
  }

  const handleReplace = () => {
    if (disabled) return
    setState({ ...INITIAL_STATE })
  }

  const {
    stage,
    file,
    optimizationProgress,
    error,
    warnings,
    result,
    originalSizeBytes,
    optimizedSizeBytes,
    compressionRatio,
  } = state

  if (!productId) {
    return (
      <div
        data-testid="admin-product-model-uploader"
        data-state="no-product"
        className={`rounded-lg border border-dashed p-6 text-center ${PANEL_CARD}`}
      >
        <Box className="mx-auto mb-3 h-8 w-8 text-muted-foreground/50" />
        <p className="text-sm font-medium text-muted-foreground">
          Guarda el producto para subir un modelo 3D.
        </p>
      </div>
    )
  }

  if (stage === 'success' && result) {
    return (
      <div data-testid="admin-product-model-uploader" data-state="success" className="space-y-3">
        <Card data-testid="admin-product-model-success" className={PANEL_CARD}>
          <CardContent className="flex items-start gap-4 p-4">
            <div className={BRAND_ICON_WRAP}>
              <Box className="h-5 w-5 text-primary" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="mb-1 flex items-center gap-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                <span
                  className="truncate text-sm font-medium"
                  data-testid="admin-product-model-filename"
                >
                  {result.fileName}
                </span>
                <Badge variant="secondary" className="shrink-0 text-xs">
                  GLB
                </Badge>
                {result.isActive && (
                  <Badge className="shrink-0 bg-emerald-100 text-xs text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
                    Activo
                  </Badge>
                )}
              </div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span>Tamaño: {formatBytes(result.sizeBytes)}</span>
                {result.originalSizeBytes && result.originalSizeBytes > result.sizeBytes && (
                  <span className="text-emerald-600 dark:text-emerald-400">
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
                data-testid="admin-product-model-url"
                className="mt-1 block truncate text-xs text-primary underline underline-offset-2 hover:opacity-80"
              >
                Ver en R2
              </a>
            </div>
            <div className="flex shrink-0 gap-2">
              <Button
                size="sm"
                variant="outline"
                onClick={handleReplace}
                className="text-xs"
                disabled={disabled || isDeleting}
              >
                Reemplazar
              </Button>
              <Button
                size="sm"
                variant="ghost"
                data-testid="admin-product-model-delete"
                className="text-destructive hover:text-destructive"
                onClick={handleDelete}
                disabled={disabled || isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
        {warnings.length > 0 && (
          <Alert
            variant="default"
            className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
          >
            <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
            <AlertDescription className="text-xs text-amber-700 dark:text-amber-200">
              {warnings.map((w, i) => (
                <p key={i}>{w}</p>
              ))}
            </AlertDescription>
          </Alert>
        )}
      </div>
    )
  }

  if (stage === 'optimizing') {
    return (
      <Card data-testid="admin-product-model-optimizing" className={PANEL_CARD}>
        <CardContent className="space-y-4 p-6">
          <div className="flex items-center gap-3">
            <Loader2 className="h-5 w-5 animate-spin text-primary" />
            <span className="text-sm font-medium text-foreground">
              {optimizationProgress?.message ?? 'Optimizando modelo…'}
            </span>
          </div>
          <Progress value={optimizationProgress?.percent ?? 0} className="h-1.5" />
          {file && originalSizeBytes && (
            <div className="grid grid-cols-3 gap-3 pt-1">
              <div className={STAT_BOX}>
                <p className="text-xs text-muted-foreground">Original</p>
                <p className="mt-0.5 font-mono text-sm font-semibold">
                  {formatBytes(originalSizeBytes)}
                </p>
              </div>
              <div className={STAT_BOX}>
                <p className="text-xs text-muted-foreground">Optimizado</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-muted-foreground">
                  {optimizationProgress && optimizationProgress.percent > 80 && optimizedSizeBytes
                    ? formatBytes(optimizedSizeBytes)
                    : '—'}
                </p>
              </div>
              <div className={STAT_BOX}>
                <p className="text-xs text-muted-foreground">Ahorro est.</p>
                <p className="mt-0.5 font-mono text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                  {compressionRatio != null ? formatPercent(compressionRatio) : '—'}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  if (stage === 'uploading' || stage === 'confirming' || stage === 'validating') {
    const msg =
      stage === 'validating'
        ? 'Validando modelo…'
        : stage === 'uploading'
          ? 'Subiendo modelo 3D a R2…'
          : 'Confirmando archivo…'
    const testId =
      stage === 'validating'
        ? 'admin-product-model-validating'
        : stage === 'uploading'
          ? 'admin-product-model-uploading'
          : 'admin-product-model-confirming'
    return (
      <Card data-testid={testId} data-state={stage} className={PANEL_CARD}>
        <CardContent className="flex items-center gap-3 p-6">
          <Loader2 className="h-5 w-5 animate-spin text-primary" />
          <span className="text-sm font-medium text-foreground">{msg}</span>
        </CardContent>
      </Card>
    )
  }

  if (stage === 'error') {
    return (
      <div data-testid="admin-product-model-error" className="space-y-3">
        <Alert variant="destructive">
          <X className="h-4 w-4" />
          <AlertDescription className="text-xs" data-testid="admin-product-model-error-message">
            {error}
          </AlertDescription>
        </Alert>
        <Button
          size="sm"
          variant="outline"
          onClick={() => setState({ ...INITIAL_STATE })}
          className="text-xs"
          disabled={disabled}
        >
          Reintentar
        </Button>
      </div>
    )
  }

  return (
    <div data-testid="admin-product-model-uploader" data-state="idle" className="space-y-3">
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label="Subir modelo 3D GLB"
        aria-disabled={disabled}
        data-testid="admin-product-model-dropzone"
        className={`group relative p-8 text-center ${DROPZONE_BASE} ${
          disabled
            ? 'cursor-not-allowed opacity-60'
            : isDragging
              ? `${DROPZONE_DRAG} cursor-pointer`
              : `${DROPZONE_IDLE} cursor-pointer`
        }`}
        onClick={() => !disabled && inputRef.current?.click()}
        onKeyDown={(e) =>
          !disabled && (e.key === 'Enter' || e.key === ' ') && inputRef.current?.click()
        }
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        <input
          ref={inputRef}
          type="file"
          accept=".glb"
          className="hidden"
          data-testid="admin-product-model-file-input"
          onChange={handleInputChange}
          disabled={disabled}
        />
        <div className="flex flex-col items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10 transition-colors group-hover:bg-primary/15">
            {isDragging ? (
              <UploadCloud className="h-6 w-6 text-primary" />
            ) : (
              <Box className="h-6 w-6 text-primary" />
            )}
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">
              {isDragging ? 'Suelta el archivo aquí' : 'Arrastra tu archivo GLB aquí'}
            </p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              o{' '}
              <span className="font-medium text-primary underline underline-offset-2">
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
        <Alert
          variant="default"
          className="border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950/40"
        >
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertDescription className="text-xs text-amber-700 dark:text-amber-200">
            {warnings.map((w, i) => (
              <p key={i}>{w}</p>
            ))}
          </AlertDescription>
        </Alert>
      )}

      <p className="text-xs text-muted-foreground">
        El modelo se optimiza automáticamente antes de subirse.{' '}
        <a
          href="https://gltf.report"
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-primary underline underline-offset-2 hover:opacity-80"
        >
          Valida tu GLB aquí.
        </a>
      </p>
    </div>
  )
}
