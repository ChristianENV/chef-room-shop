'use client'

import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminSettingsErrorProps = {
  onRetry?: () => void
}

export function AdminSettingsError({ onRetry }: AdminSettingsErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 py-12 px-4 text-center"
      data-testid="admin-settings-error"
    >
      <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
      <h3 className="font-sans text-lg font-semibold text-foreground">
        No se pudo cargar la configuración
      </h3>
      <p className="mt-1 font-serif text-sm text-muted-foreground">
        Intenta de nuevo en unos momentos.
      </p>
      {onRetry ? (
        <Button variant="outline" className="mt-4 font-sans" onClick={onRetry}>
          Reintentar
        </Button>
      ) : null}
    </div>
  )
}
