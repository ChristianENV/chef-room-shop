'use client'

import { useCallback, useRef, useState } from 'react'
import { ImagePlus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { validateImageFile } from '@/src/features/uploads/lib/image-processing'

export type ProductImageDropzoneProps = {
  onFilesSelected: (files: File[]) => void
  disabled?: boolean
  maxFiles?: number
  currentCount?: number
  compact?: boolean
}

/**
 * Drag-and-drop zone for product images. Keyboard accessible; no camera input.
 */
export function ProductImageDropzone({
  onFilesSelected,
  disabled = false,
  maxFiles = 10,
  currentCount = 0,
  compact = false,
}: ProductImageDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const remaining = Math.max(0, maxFiles - currentCount)

  const processFiles = useCallback(
    (fileList: FileList | File[]) => {
      setError(null)
      const files = Array.from(fileList)
      if (files.length === 0) return

      if (files.length > remaining) {
        setError(`Solo puedes agregar ${remaining} imagen${remaining === 1 ? '' : 'es'} más.`)
        return
      }

      const valid: File[] = []
      for (const file of files) {
        const validationError = validateImageFile(file)
        if (validationError) {
          setError(validationError)
          return
        }
        valid.push(file)
      }

      onFilesSelected(valid)
    },
    [onFilesSelected, remaining],
  )

  const handleDrop = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault()
      setIsDragging(false)
      if (disabled || remaining === 0) return
      processFiles(event.dataTransfer.files)
    },
    [disabled, processFiles, remaining],
  )

  return (
    <div className="space-y-2">
      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        multiple
        className="sr-only"
        aria-label="Seleccionar imágenes de producto"
        disabled={disabled || remaining === 0}
        onChange={(e) => {
          if (e.target.files) processFiles(e.target.files)
          e.target.value = ''
        }}
      />

      <div
        role="button"
        tabIndex={disabled || remaining === 0 ? -1 : 0}
        aria-label="Zona para arrastrar imágenes de producto. Presiona Enter para seleccionar archivos."
        aria-disabled={disabled || remaining === 0}
        className={cn(
          'flex flex-col items-center justify-center rounded-xl border-2 border-dashed text-center transition-colors outline-none',
          compact ? 'gap-2 px-4 py-6' : 'gap-3 px-6 py-10',
          'focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2',
          disabled || remaining === 0
            ? 'cursor-not-allowed border-border/60 bg-muted/30 opacity-60'
            : isDragging
              ? 'cursor-copy border-primary bg-primary/5'
              : 'cursor-pointer border-border hover:border-primary/50 hover:bg-accent/30',
        )}
        onDragOver={(e) => {
          e.preventDefault()
          if (!disabled && remaining > 0) setIsDragging(true)
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
        onClick={() => {
          if (!disabled && remaining > 0) inputRef.current?.click()
        }}
        onKeyDown={(e) => {
          if ((e.key === 'Enter' || e.key === ' ') && !disabled && remaining > 0) {
            e.preventDefault()
            inputRef.current?.click()
          }
        }}
      >
        <div
          className={cn(
            'flex items-center justify-center rounded-full bg-primary/10',
            compact ? 'h-10 w-10' : 'h-14 w-14',
          )}
        >
          <ImagePlus className={cn('text-primary', compact ? 'h-5 w-5' : 'h-7 w-7')} aria-hidden />
        </div>
        <div>
          <p className="font-sans text-sm font-medium text-foreground">
            {compact
              ? 'Agregar más imágenes'
              : 'Arrastra imágenes de producto aquí'}
          </p>
          <p className="mt-0.5 font-serif text-xs text-muted-foreground">
            {compact
              ? 'JPG, PNG o WebP'
              : 'o busca archivos en tu dispositivo · JPG, PNG o WebP'}
          </p>
          {!compact && remaining < maxFiles && (
            <p className="mt-1 font-serif text-xs text-muted-foreground">
              {remaining} de {maxFiles} disponibles
            </p>
          )}
        </div>
        {!compact && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-1 gap-2"
            disabled={disabled || remaining === 0}
            onClick={(e) => {
              e.stopPropagation()
              inputRef.current?.click()
            }}
          >
            Seleccionar imágenes
          </Button>
        )}
      </div>

      {error ? (
        <p className="font-serif text-xs text-destructive" role="alert">
          {error}
        </p>
      ) : null}
    </div>
  )
}
