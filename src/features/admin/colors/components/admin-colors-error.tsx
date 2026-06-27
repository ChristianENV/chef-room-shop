'use client'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

export function AdminColorsError({ onRetry }: { onRetry: () => void }) {
  return (
    <Alert variant="destructive">
      <AlertDescription className="flex items-center justify-between gap-4">
        <span>No pudimos cargar los colores.</span>
        <Button variant="outline" size="sm" onClick={onRetry}>
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
