'use client'

import Image from 'next/image'
import { useCallback, useRef, useState } from 'react'
import { ImagePlus, Loader2, Trash2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { ProductImageEditorDialog } from '@/src/features/admin/products/components/product-image-editor-dialog'
import { useProductTypeCardImageUploadMutation } from '@/src/features/uploads/api/use-product-type-card-image-upload-mutation'
import { createObjectUrl, validateImageFile } from '@/src/features/uploads/lib/image-processing'

import { useRemoveAdminProductTypeImageMutation } from '../api/use-remove-admin-product-type-image-mutation'

type CategoryCardImageUploaderProps = {
  productTypeId: string | null
  imageUrl: string | null
  imageAlt: string
  onAltChange: (alt: string) => void
  onImageUpdated?: (url: string | null, alt: string | null) => void
  disabled?: boolean
}

export function CategoryCardImageUploader({
  productTypeId,
  imageUrl,
  imageAlt,
  onAltChange,
  onImageUpdated,
  disabled = false,
}: CategoryCardImageUploaderProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const uploadMutation = useProductTypeCardImageUploadMutation()
  const removeMutation = useRemoveAdminProductTypeImageMutation()

  const [editorOpen, setEditorOpen] = useState(false)
  const [pendingSrc, setPendingSrc] = useState<string | null>(null)
  const [localPreview, setLocalPreview] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const isBusy = uploadMutation.isPending || removeMutation.isPending || disabled
  const previewUrl = localPreview ?? imageUrl

  const handlePickFile = useCallback(() => {
    if (!productTypeId) return
    inputRef.current?.click()
  }, [productTypeId])

  const handleFileChange = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''
    if (!file) return

    const validationError = validateImageFile(file)
    if (validationError) {
      setError(validationError)
      return
    }

    setError(null)
    setSuccess(null)
    setPendingSrc(createObjectUrl(file))
    setEditorOpen(true)
  }, [])

  const handleRemove = useCallback(async () => {
    if (!productTypeId) return
    setError(null)
    setSuccess(null)

    try {
      const updated = await removeMutation.mutateAsync(productTypeId)
      setLocalPreview(null)
      onImageUpdated?.(updated.cardImageUrl, updated.cardImageAlt)
      onAltChange(updated.cardImageAlt ?? '')
      setSuccess('Imagen eliminada.')
    } catch {
      setError('No pudimos eliminar la imagen.')
    }
  }, [onAltChange, onImageUpdated, productTypeId, removeMutation])

  if (!productTypeId) {
    return (
      <div className="rounded-lg border border-dashed border-border p-4">
        <p className="font-sans text-sm font-medium">Imagen de categoría</p>
        <p className="mt-1 font-serif text-xs text-muted-foreground">
          Guarda la categoría primero para subir la imagen de la tarjeta en la landing.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div>
        <p className="font-sans text-sm font-medium">Imagen de categoría</p>
        <p className="mt-1 font-serif text-xs text-muted-foreground">
          Esta imagen se usa en las tarjetas de la landing y navegación visual.
        </p>
      </div>

      <div className="relative aspect-[4/3] w-full overflow-hidden rounded-md border border-border bg-muted">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={imageAlt || 'Vista previa de categoría'}
            fill
            className="object-cover"
            sizes="320px"
            unoptimized={previewUrl.startsWith('blob:')}
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <ImagePlus className="h-8 w-8 text-muted-foreground/60" aria-hidden />
          </div>
        )}
      </div>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={isBusy}
          onClick={handlePickFile}
        >
          {uploadMutation.isPending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Subiendo...
            </>
          ) : previewUrl ? (
            'Cambiar imagen'
          ) : (
            'Subir imagen'
          )}
        </Button>

        {previewUrl ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isBusy}
            onClick={() => void handleRemove()}
          >
            {removeMutation.isPending ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="mr-2 h-4 w-4" />
            )}
            Eliminar imagen
          </Button>
        ) : null}
      </div>

      <div className="space-y-2">
        <Label htmlFor="category-card-image-alt" className="font-sans text-xs">
          Texto alternativo
        </Label>
        <Input
          id="category-card-image-alt"
          value={imageAlt}
          onChange={(event) => onAltChange(event.target.value)}
          placeholder="Ej. Filipina blanca premium Chef Room"
          disabled={isBusy}
        />
      </div>

      {error ? (
        <Alert variant="destructive">
          <AlertDescription className="font-serif">{error}</AlertDescription>
        </Alert>
      ) : null}

      {success ? (
        <Alert>
          <AlertDescription className="font-serif">{success}</AlertDescription>
        </Alert>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp"
        className="sr-only"
        onChange={handleFileChange}
        disabled={isBusy}
      />

      <ProductImageEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          setEditorOpen(open)
          if (!open && pendingSrc?.startsWith('blob:')) {
            URL.revokeObjectURL(pendingSrc)
            setPendingSrc(null)
          }
        }}
        imageSrc={pendingSrc}
        initialAlt={imageAlt}
        isApplying={uploadMutation.isPending}
        onApply={async ({ processed, alt, previewUrl: nextPreview }) => {
          if (!productTypeId) return

          setError(null)
          setSuccess(null)

          try {
            const result = await uploadMutation.mutateAsync({
              files: {
                productTypeId,
                webp: processed.webp,
                jpg: processed.jpg,
                thumb: processed.thumb,
                altText: alt.trim() || null,
              },
            })

            setLocalPreview(nextPreview)
            onAltChange(result.productType.cardImageAlt ?? alt)
            onImageUpdated?.(result.productType.cardImageUrl, result.productType.cardImageAlt)
            setSuccess('Imagen actualizada.')
            setEditorOpen(false)
          } catch {
            setError('No pudimos subir la imagen. Intenta de nuevo.')
          }
        }}
      />
    </div>
  )
}
