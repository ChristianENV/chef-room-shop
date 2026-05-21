'use client'

import { AlertCircle } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'

type ShippingQuoteErrorProps = {
  message: string
  onRetry?: () => void
}

export function ShippingQuoteError({ message, onRetry }: ShippingQuoteErrorProps) {
  return (
    <Alert variant="destructive">
      <AlertCircle className="h-4 w-4" />
      <AlertDescription className="font-serif">
        <p>{message}</p>
        {onRetry && (
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="mt-3 font-sans"
            onClick={onRetry}
          >
            Intentar de nuevo
          </Button>
        )}
      </AlertDescription>
    </Alert>
  )
}
