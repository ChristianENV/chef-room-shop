'use client'

import { useRef, useState } from 'react'
import { ImagePlus, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import { validateLogoFile } from '@/src/features/uploads/lib/logo-image-processing'

type UploadState = 'idle' | 'optimizing' | 'uploading' | 'ready' | 'error'

interface LogoUploadSectionProps {
  onUploadLogo: (file: File) => Promise<void>
}

function stateLabel(state: UploadState): string {
  switch (state) {
    case 'optimizing':
      return 'Optimizando logotipo...'
    case 'uploading':
      return 'Subiendo logotipo...'
    case 'ready':
      return 'Logotipo listo'
    case 'error':
      return 'Error al subir'
    case 'idle':
    default:
      return 'Selecciona PNG, JPG o WebP'
  }
}

export function LogoUploadSection({ onUploadLogo }: LogoUploadSectionProps) {
  const { layers, selectedLayerId, selectLayer } = useCustomizerStore()
  const logos = layers.filter((layer) => layer.type === 'logo')
  const inputRef = useRef<HTMLInputElement>(null)
  const [uploadState, setUploadState] = useState<UploadState>('idle')
  const [error, setError] = useState<string | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)

  const handleFile = async (file: File) => {
    const validation = validateLogoFile(file)
    if (validation) {
      setUploadState('error')
      setError(validation)
      return
    }

    setError(null)
    if (previewUrl) URL.revokeObjectURL(previewUrl)
    setPreviewUrl(URL.createObjectURL(file))
    setUploadState('optimizing')

    try {
      setUploadState('uploading')
      await onUploadLogo(file)
      setUploadState('ready')
    } catch (uploadError) {
      const message =
        uploadError instanceof Error ? uploadError.message : 'No pudimos subir el logotipo.'
      setUploadState('error')
      setError(message)
    }
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Logotipos</h3>
        <p className="text-xs text-muted-foreground">
          Sube un logo en PNG, JPG o WebP para colocarlo sobre tu prenda.
        </p>
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp"
        className="sr-only"
        onChange={(event) => {
          const file = event.target.files?.[0]
          if (file) {
            void handleFile(file)
          }
          event.target.value = ''
        }}
      />

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault()
            inputRef.current?.click()
          }
        }}
        className={cn(
          'rounded-lg border border-dashed border-border/70 p-4 text-center transition',
          'hover:border-primary/40 hover:bg-accent/30',
        )}
      >
        <div className="mx-auto mb-2 flex size-10 items-center justify-center rounded-full bg-primary/10 text-primary">
          {uploadState === 'optimizing' || uploadState === 'uploading' ? (
            <Loader2 className="size-5 animate-spin" />
          ) : (
            <ImagePlus className="size-5" />
          )}
        </div>
        <p className="text-sm font-medium text-foreground">Subir logotipo</p>
        <p className="mt-1 text-xs text-muted-foreground">{stateLabel(uploadState)}</p>
      </div>

      {previewUrl ? (
        <div className="rounded-lg border border-border/60 bg-card p-3">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={previewUrl}
            alt="Vista previa del logotipo"
            className="mx-auto max-h-24 w-auto rounded object-contain"
          />
        </div>
      ) : null}

      {error ? <p className="text-xs text-destructive">{error}</p> : null}

      {logos.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Logotipos en tu diseño
          </p>
          {logos.map((logo) => (
            <button
              key={logo.id}
              type="button"
              onClick={() => selectLayer(logo.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition',
                selectedLayerId === logo.id
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span className="truncate">{logo.name}</span>
              <span className="text-[11px] text-muted-foreground">Editar</span>
            </button>
          ))}
        </div>
      ) : null}

      <Button
        variant="outline"
        size="sm"
        className="w-full"
        onClick={() => inputRef.current?.click()}
      >
        Seleccionar archivo
      </Button>
    </div>
  )
}
