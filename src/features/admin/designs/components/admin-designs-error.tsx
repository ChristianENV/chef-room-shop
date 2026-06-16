'use client'

import { AlertCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminDesignsErrorProps = {
  onRetry?: () => void
}

export function AdminDesignsError({ onRetry }: AdminDesignsErrorProps) {
  return (
    <div
      className="flex flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 py-12 px-4 text-center"
      data-testid="admin-designs-error"
    >
      <AlertCircle className="mb-3 h-10 w-10 text-destructive" />
      <h3 className="font-sans text-lg font-semibold text-foreground">
        No se pudieron cargar los diseños
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
