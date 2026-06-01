'use client'

import { useCallback, useMemo, useState } from 'react'
import Cropper from 'react-easy-crop'
import type { Area } from 'react-easy-crop'
import {
  Loader2,
  RotateCcw,
  RotateCw,
  ZoomIn,
  ZoomOut,
} from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { formatBytes, type CropArea } from '@/src/features/uploads/lib/image-processing'
import {
  processProductImage,
  type ProcessedProductImageMeta,
} from '@/src/features/uploads/lib/product-image-processing'

export type CropAspectPreset = 'original' | 'square' | 'portrait'

const PRESET_LABELS: Record<CropAspectPreset, string> = {
  original: 'Original',
  square: '1:1',
  portrait: '4:5',
}

const PRESET_ASPECT: Record<CropAspectPreset, number | undefined> = {
  original: undefined,
  square: 1,
  portrait: 4 / 5,
}

export type ProductImageEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  imageSrc: string | null
  initialAlt?: string
  isApplying?: boolean
  onApply: (result: {
    cropArea: CropArea
    rotation: number
    aspectPreset: CropAspectPreset
    alt: string
    processed: ProcessedProductImageMeta
    previewUrl: string
  }) => void | Promise<void>
}

type EditorBodyProps = {
  imageSrc: string
  initialAlt: string
  isApplying: boolean
  onApply: ProductImageEditorDialogProps['onApply']
  onCancel: () => void
}

function ProductImageEditorBody({
  imageSrc,
  initialAlt,
  isApplying,
  onApply,
  onCancel,
}: EditorBodyProps) {
  const [crop, setCrop] = useState({ x: 0, y: 0 })
  const [zoom, setZoom] = useState(1)
  const [rotation, setRotation] = useState(0)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 100, height: 100 })
  const [aspectPreset, setAspectPreset] = useState<CropAspectPreset>('original')
  const [alt, setAlt] = useState(initialAlt)
  const [estimatedBytes, setEstimatedBytes] = useState<number | null>(null)
  const [isEstimating, setIsEstimating] = useState(false)
  const [applyError, setApplyError] = useState<string | null>(null)

  const aspect = PRESET_ASPECT[aspectPreset]
  const isBusy = isApplying || isEstimating

  const handleCropComplete = useCallback((_area: Area, areaPixels: Area) => {
    setCropArea(areaPixels)
  }, [])

  const handleReset = useCallback(() => {
    setCrop({ x: 0, y: 0 })
    setZoom(1)
    setRotation(0)
    setAspectPreset('original')
    setEstimatedBytes(null)
    setApplyError(null)
  }, [])

  const handleApply = useCallback(async () => {
    setApplyError(null)
    setIsEstimating(true)
    try {
      const processed = await processProductImage(imageSrc, cropArea, rotation)
      setEstimatedBytes(processed.estimatedBytes)
      const previewUrl = URL.createObjectURL(processed.webp)
      await onApply({
        cropArea,
        rotation,
        aspectPreset,
        alt: alt.trim(),
        processed,
        previewUrl,
      })
    } catch (err) {
      setApplyError(
        err instanceof Error ? err.message : 'No pudimos procesar la imagen.',
      )
    } finally {
      setIsEstimating(false)
    }
  }, [alt, aspectPreset, cropArea, imageSrc, onApply, rotation])

  const presetButtons = useMemo(
    () =>
      (Object.keys(PRESET_LABELS) as CropAspectPreset[]).map((preset) => (
        <Button
          key={preset}
          type="button"
          size="sm"
          variant={aspectPreset === preset ? 'default' : 'outline'}
          className="h-8 text-xs"
          disabled={isBusy}
          onClick={() => setAspectPreset(preset)}
        >
          {PRESET_LABELS[preset]}
        </Button>
      )),
    [aspectPreset, isBusy],
  )

  return (
    <>
      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-4">
        <div
          className="relative mx-auto h-72 w-full overflow-hidden rounded-xl bg-black/90"
          aria-label="Área de recorte de imagen"
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            cropShape="rect"
            showGrid
            onCropChange={setCrop}
            onCropComplete={handleCropComplete}
            onZoomChange={setZoom}
          />
        </div>

        <div className="flex flex-wrap gap-2">{presetButtons}</div>

        <div className="flex items-center gap-3">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
            aria-label="Reducir zoom"
            disabled={isBusy}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Slider
            value={[zoom]}
            min={1}
            max={3}
            step={0.05}
            onValueChange={(v) => setZoom(v[0] ?? 1)}
            aria-label="Zoom"
            className="flex-1"
            disabled={isBusy}
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0"
            onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
            aria-label="Aumentar zoom"
            disabled={isBusy}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setRotation((r) => (r - 90 + 360) % 360)}
            disabled={isBusy}
            aria-label="Rotar 90 grados a la izquierda"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            −90°
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="gap-1.5"
            onClick={() => setRotation((r) => (r + 90) % 360)}
            disabled={isBusy}
            aria-label="Rotar 90 grados a la derecha"
          >
            <RotateCw className="h-3.5 w-3.5" />
            +90°
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleReset}
            disabled={isBusy}
          >
            Restablecer
          </Button>
        </div>

        <div className="space-y-2">
          <Label htmlFor="product-image-alt" className="font-sans text-sm">
            Texto alternativo (opcional)
          </Label>
          <Input
            id="product-image-alt"
            value={alt}
            onChange={(e) => setAlt(e.target.value)}
            placeholder="Ej. Filipina blanca vista frontal"
            className="font-serif text-sm"
            disabled={isBusy}
          />
        </div>

        {estimatedBytes != null && (
          <p className="font-serif text-xs text-muted-foreground">
            Peso estimado: {formatBytes(estimatedBytes)} (WebP + JPG + miniatura)
          </p>
        )}

        {applyError ? (
          <p className="font-serif text-sm text-destructive" role="alert">
            {applyError}
          </p>
        ) : null}
      </div>

      <DialogFooter className="gap-2 border-t border-border px-6 py-4">
        <Button type="button" variant="outline" onClick={onCancel} disabled={isBusy}>
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={() => void handleApply()}
          disabled={isBusy}
          className={cn('gap-2')}
        >
          {isBusy ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              Optimizando…
            </>
          ) : (
            'Aplicar y guardar'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

/**
 * Product image editor: free crop, aspect presets, zoom, rotation.
 * No camera — file picker only via parent.
 */
export function ProductImageEditorDialog({
  open,
  onOpenChange,
  imageSrc,
  initialAlt = '',
  isApplying = false,
  onApply,
}: ProductImageEditorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[92vh] max-w-lg flex-col gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-sans">Editar imagen de producto</DialogTitle>
          <DialogDescription className="font-serif text-sm">
            Recorta, rota y ajusta antes de optimizar y subir.
          </DialogDescription>
        </DialogHeader>

        {open && imageSrc ? (
          <ProductImageEditorBody
            key={imageSrc}
            imageSrc={imageSrc}
            initialAlt={initialAlt}
            isApplying={isApplying}
            onApply={onApply}
            onCancel={() => onOpenChange(false)}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
