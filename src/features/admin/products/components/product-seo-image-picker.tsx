'use client'

import Image from 'next/image'
import { Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import type { AdminProductImageUi } from '../types/admin-products-ui.types'
import { mapSeoImagePickerOptions } from '../mappers/admin-products-seo-image.mapper'

type ProductSeoImagePickerProps = {
  images: AdminProductImageUi[]
  seoImageId: string | null
  onChange: (seoImageId: string | null) => void
  disabled?: boolean
}

export function ProductSeoImagePicker({
  images,
  seoImageId,
  onChange,
  disabled = false,
}: ProductSeoImagePickerProps) {
  const options = mapSeoImagePickerOptions(images, seoImageId)

  if (images.length === 0) {
    return (
      <p className="font-serif text-sm text-muted-foreground">
        Sube fotos en la pestaña Imágenes para poder seleccionar una imagen SEO.
      </p>
    )
  }

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-3 gap-3 sm:grid-cols-4">
        {options.map((option) => (
          <button
            key={option.id}
            type="button"
            disabled={disabled}
            onClick={() => onChange(option.isSelected ? null : option.id)}
            className={cn(
              'group relative aspect-square overflow-hidden rounded-lg border-2 transition-colors',
              option.isSelected
                ? 'border-primary ring-2 ring-primary/20'
                : 'border-border hover:border-primary/50',
              disabled && 'pointer-events-none opacity-60',
            )}
            aria-pressed={option.isSelected}
            aria-label={option.isSelected ? 'Quitar imagen SEO' : 'Usar como imagen SEO'}
          >
            <Image
              src={option.url}
              alt={option.alt || 'Foto del producto'}
              fill
              className="object-cover"
              sizes="120px"
              unoptimized={option.url.startsWith('blob:')}
            />
            {option.isSelected ? (
              <span className="absolute right-1.5 top-1.5 inline-flex rounded-full bg-primary p-1 text-primary-foreground">
                <Check className="h-3 w-3" aria-hidden />
              </span>
            ) : null}
            {option.isPrimary ? (
              <span className="absolute bottom-1 left-1 rounded bg-black/60 px-1.5 py-0.5 font-sans text-[10px] text-white">
                Principal
              </span>
            ) : null}
          </button>
        ))}
      </div>

      {seoImageId ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          disabled={disabled}
          onClick={() => onChange(null)}
          className="font-sans"
        >
          Quitar selección SEO
        </Button>
      ) : (
        <p className="font-serif text-xs text-muted-foreground">
          Si no seleccionas una imagen, se usará la imagen principal del producto.
        </p>
      )}
    </div>
  )
}
