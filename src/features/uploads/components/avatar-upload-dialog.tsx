'use client'

import { useCallback, useRef, useState } from 'react'
import { AlertCircle, Camera, CheckCircle2, ImagePlus, Upload } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'
import { useAvatarUploadMutation } from '../api/use-avatar-upload-mutation'
import type { UploadProgressEvent } from '../types'
import { AvatarCropper } from './avatar-cropper'
import { processAvatarImage } from '../lib/avatar-image-processing'
import { createObjectUrl, validateImageFile, type CropArea } from '../lib/image-processing'

type DialogState = 'empty' | 'editing' | 'uploading' | 'success' | 'error'

export type AvatarUploadDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Called once the server confirms the upload and returns the new image URL. */
  onSuccess?: (imageUrl: string | null) => void
}

/**
 * Full-featured avatar upload modal.
 *
 * States: empty → editing → uploading → success | error
 *
 * The user's file never leaves the browser as-is — it is cropped, resized to
 * 256×256 and encoded to WebP + JPG on the client before the upload mutation.
 */
export function AvatarUploadDialog({ open, onOpenChange, onSuccess }: AvatarUploadDialogProps) {
  const [state, setState] = useState<DialogState>('empty')
  const [imageSrc, setImageSrc] = useState<string | null>(null)
  const [cropArea, setCropArea] = useState<CropArea>({ x: 0, y: 0, width: 256, height: 256 })
  const [rotation, setRotation] = useState(0)
  const [progress, setProgress] = useState(0)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [successImageUrl, setSuccessImageUrl] = useState<string | null>(null)
  const [isDraggingOver, setIsDraggingOver] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const cameraInputRef = useRef<HTMLInputElement>(null)
  const objectUrlRef = useRef<string | null>(null)

  const uploadMutation = useAvatarUploadMutation()

  const resetState = useCallback(() => {
    setState('empty')
    setImageSrc(null)
    setCropArea({ x: 0, y: 0, width: 256, height: 256 })
    setRotation(0)
    setProgress(0)
    setErrorMessage(null)
    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
      objectUrlRef.current = null
    }
  }, [])

  const handleOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (!nextOpen) {
        if (state !== 'uploading') {
          resetState()
          onOpenChange(false)
        }
      } else {
        onOpenChange(true)
      }
    },
    [state, resetState, onOpenChange],
  )

  const handleFile = useCallback((file: File) => {
    const validationError = validateImageFile(file)
    if (validationError) {
      setErrorMessage(validationError)
      setState('error')
      return
    }

    if (objectUrlRef.current) {
      URL.revokeObjectURL(objectUrlRef.current)
    }
    const url = createObjectUrl(file)
    objectUrlRef.current = url
    setImageSrc(url)
    setState('editing')
  }, [])

  const handleFileInputChange = useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0]
      if (file) handleFile(file)
      event.target.value = ''
    },
    [handleFile],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDraggingOver(false)
      const file = event.dataTransfer.files[0]
      if (file) handleFile(file)
    },
    [handleFile],
  )

  const handleDragOver = useCallback((event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault()
    setIsDraggingOver(true)
  }, [])

  const handleDragLeave = useCallback(() => {
    setIsDraggingOver(false)
  }, [])

  const handleSave = useCallback(async () => {
    if (!imageSrc) return

    setState('uploading')
    setProgress(0)

    let lastProgress = 0
    const handleProgress = (event: UploadProgressEvent) => {
      const weight = event.slot === 'webp' ? 0.6 : 0.4
      lastProgress = Math.round(lastProgress + event.progress * weight * 100)
      setProgress(Math.min(lastProgress, 99))
    }

    try {
      const { webp, jpg } = await processAvatarImage(imageSrc, cropArea, rotation)
      setProgress(15)

      const result = await uploadMutation.mutateAsync({
        files: { webp, jpg, originalContentType: 'image/jpeg' },
        onProgress: handleProgress,
      })

      setProgress(100)
      setSuccessImageUrl(result.image)
      setState('success')
      onSuccess?.(result.image)
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'No pudimos guardar tu foto. Intenta de nuevo.'
      setErrorMessage(message)
      setState('error')
    }
  }, [imageSrc, cropArea, rotation, uploadMutation, onSuccess])

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {state === 'success' ? '¡Foto actualizada!' : 'Actualizar foto de perfil'}
          </DialogTitle>
          <DialogDescription className="font-serif text-sm">
            {state === 'empty' && 'Sube una foto clara de tu perfil.'}
            {state === 'editing' && 'Ajusta el encuadre y confirma cuando estés listo.'}
            {state === 'uploading' && 'Optimizando y guardando tu foto…'}
            {state === 'success' && 'Tu avatar se actualizó correctamente.'}
            {state === 'error' && 'Algo salió mal. Puedes reintentar.'}
          </DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {/* ── EMPTY STATE ── */}
          {state === 'empty' && (
            <EmptyState
              isDraggingOver={isDraggingOver}
              fileInputRef={fileInputRef}
              cameraInputRef={cameraInputRef}
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onFileChange={handleFileInputChange}
              onBrowseClick={() => fileInputRef.current?.click()}
              onCameraClick={() => cameraInputRef.current?.click()}
            />
          )}

          {/* ── EDITING STATE ── */}
          {state === 'editing' && imageSrc && (
            <div className="space-y-4">
              <AvatarCropper
                imageSrc={imageSrc}
                onCropChange={setCropArea}
                onRotationChange={setRotation}
                onChangeImage={resetState}
              />
              <div className="flex justify-end gap-2 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={resetState}
                  disabled={uploadMutation.isPending}
                >
                  Cancelar
                </Button>
                <Button
                  type="button"
                  onClick={() => void handleSave()}
                  disabled={uploadMutation.isPending}
                  className="gap-2"
                >
                  <Upload className="h-4 w-4" />
                  Guardar foto
                </Button>
              </div>
            </div>
          )}

          {/* ── UPLOADING STATE ── */}
          {state === 'uploading' && <UploadingState progress={progress} />}

          {/* ── SUCCESS STATE ── */}
          {state === 'success' && (
            <SuccessState
              imageUrl={successImageUrl}
              onClose={() => {
                resetState()
                onOpenChange(false)
              }}
            />
          )}

          {/* ── ERROR STATE ── */}
          {state === 'error' && (
            <ErrorState
              message={errorMessage}
              onRetry={resetState}
              onClose={() => {
                resetState()
                onOpenChange(false)
              }}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

// ── Sub-components ────────────────────────────────────────────────────────────

type EmptyStateProps = {
  isDraggingOver: boolean
  fileInputRef: React.RefObject<HTMLInputElement | null>
  cameraInputRef: React.RefObject<HTMLInputElement | null>
  onDrop: (e: React.DragEvent<HTMLDivElement>) => void
  onDragOver: (e: React.DragEvent<HTMLDivElement>) => void
  onDragLeave: () => void
  onFileChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  onBrowseClick: () => void
  onCameraClick: () => void
}

function EmptyState({
  isDraggingOver,
  fileInputRef,
  cameraInputRef,
  onDrop,
  onDragOver,
  onDragLeave,
  onFileChange,
  onBrowseClick,
  onCameraClick,
}: EmptyStateProps) {
  return (
    <div className="space-y-3">
      {/* Hidden file inputs */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        aria-label="Seleccionar imagen del dispositivo"
        onChange={onFileChange}
        tabIndex={-1}
      />
      <input
        ref={cameraInputRef}
        type="file"
        accept="image/*"
        capture="user"
        className="sr-only"
        aria-label="Tomar foto con cámara"
        onChange={onFileChange}
        tabIndex={-1}
      />

      {/* Drop zone */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Zona de arrastre de imagen. Presiona Enter para seleccionar un archivo."
        className={cn(
          'flex cursor-pointer flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed px-6 py-10 text-center transition-colors outline-none',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          isDraggingOver
            ? 'border-primary bg-primary/5'
            : 'border-border hover:border-primary/50 hover:bg-accent/40',
        )}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onClick={onBrowseClick}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            onBrowseClick()
          }
        }}
      >
        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
          <ImagePlus className="h-7 w-7 text-primary" aria-hidden />
        </div>
        <div>
          <p className="font-sans text-sm font-medium text-foreground">Arrastra tu foto aquí</p>
          <p className="mt-0.5 font-serif text-xs text-muted-foreground">
            JPG, PNG o WebP · Máx. 16 MB
          </p>
        </div>
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={onBrowseClick}
          aria-label="Buscar imagen en el dispositivo"
        >
          <ImagePlus className="h-4 w-4" aria-hidden />
          Buscar imagen
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 gap-2"
          onClick={onCameraClick}
          aria-label="Tomar foto con la cámara"
        >
          <Camera className="h-4 w-4" aria-hidden />
          Tomar foto
        </Button>
      </div>
    </div>
  )
}

function UploadingState({ progress }: { progress: number }) {
  return (
    <div className="flex flex-col items-center gap-4 py-8" role="status" aria-live="polite">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
        <Upload className="h-7 w-7 animate-pulse text-primary" aria-hidden />
      </div>
      <div className="w-full space-y-2">
        <Progress value={progress} className="h-2" />
        <p className="text-center font-serif text-xs text-muted-foreground">
          Optimizando y guardando tu foto… {progress}%
        </p>
      </div>
    </div>
  )
}

function SuccessState({ imageUrl, onClose }: { imageUrl: string | null; onClose: () => void }) {
  return (
    <div
      className="flex flex-col items-center gap-4 py-6"
      role="status"
      aria-live="polite"
      aria-label="Foto actualizada correctamente"
    >
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/30">
        <CheckCircle2 className="h-8 w-8 text-emerald-600 dark:text-emerald-400" aria-hidden />
      </div>
      {imageUrl && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={imageUrl}
          alt="Tu nueva foto de perfil"
          className="h-20 w-20 rounded-full object-cover ring-2 ring-primary/20"
        />
      )}
      <p className="font-sans text-sm font-medium text-foreground">
        Foto actualizada correctamente.
      </p>
      <Button type="button" onClick={onClose} className="mt-1">
        Cerrar
      </Button>
    </div>
  )
}

function ErrorState({
  message,
  onRetry,
  onClose,
}: {
  message: string | null
  onRetry: () => void
  onClose: () => void
}) {
  return (
    <div className="flex flex-col items-center gap-4 py-6" role="alert" aria-live="assertive">
      <div className="flex h-14 w-14 items-center justify-center rounded-full bg-destructive/10">
        <AlertCircle className="h-7 w-7 text-destructive" aria-hidden />
      </div>
      <p className="text-center font-serif text-sm text-muted-foreground">
        {message ?? 'No pudimos guardar tu foto. Intenta de nuevo.'}
      </p>
      <div className="flex gap-2">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancelar
        </Button>
        <Button type="button" onClick={onRetry}>
          Reintentar
        </Button>
      </div>
    </div>
  )
}
