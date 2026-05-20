'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type AccountQueryErrorProps = {
  message?: string
  onRetry?: () => void
}

/**
 * Generic error state for account pages loading BFF data.
 */
export function AccountQueryError({
  message = 'No pudimos cargar la información. Intenta de nuevo.',
  onRetry,
}: AccountQueryErrorProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-4 h-10 w-10 text-destructive" />
        <h3 className="font-sans text-lg font-semibold text-foreground">
          Algo salió mal
        </h3>
        <p className="mt-2 max-w-sm font-serif text-sm text-muted-foreground">
          {message}
        </p>
        {onRetry ? (
          <Button variant="outline" className="mt-6 gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
