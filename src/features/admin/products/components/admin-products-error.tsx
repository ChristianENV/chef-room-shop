'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type AdminProductsErrorProps = {
  message?: string
  onRetry?: () => void
}

export function AdminProductsError({
  message = 'No pudimos cargar los productos. Intenta de nuevo.',
  onRetry,
}: AdminProductsErrorProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <AlertCircle className="mb-3 h-8 w-8 text-destructive" />
        <p className="max-w-sm font-serif text-sm text-muted-foreground">{message}</p>
        {onRetry ? (
          <Button variant="outline" size="sm" className="mt-4 gap-2" onClick={onRetry}>
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        ) : null}
      </CardContent>
    </Card>
  )
}
