'use client'

import { AlertCircle, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'

type AdminDashboardSectionErrorProps = {
  message?: string
  onRetry?: () => void
  compact?: boolean
}

/**
 * Local error state for a single admin dashboard section.
 */
export function AdminDashboardSectionError({
  message = 'No pudimos cargar esta sección. Intenta de nuevo.',
  onRetry,
  compact = false,
}: AdminDashboardSectionErrorProps) {
  return (
    <Card className="border-border bg-card">
      <CardContent
        className={
          compact
            ? 'flex flex-col items-center justify-center py-8 text-center'
            : 'flex flex-col items-center justify-center py-12 text-center'
        }
      >
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
