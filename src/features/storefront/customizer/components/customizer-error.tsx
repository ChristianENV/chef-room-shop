'use client'

import Link from 'next/link'
import { AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

interface CustomizerErrorProps {
  message?: string
  onRetry?: () => void
}

export function CustomizerError({
  message = 'No pudimos cargar las prendas personalizables.',
  onRetry,
}: CustomizerErrorProps) {
  return (
    <div
      className="flex h-dvh flex-col items-center justify-center px-6 text-center"
      data-testid="customizer-error"
    >
      <div className="mb-6 rounded-full bg-destructive/10 p-6">
        <AlertCircle className="size-12 text-destructive" />
      </div>
      <h1 className="font-sans text-xl font-bold text-foreground">{message}</h1>
      <p className="mt-2 max-w-md font-serif text-muted-foreground">
        Intenta de nuevo o vuelve a la tienda para elegir otra prenda.
      </p>
      <div className="mt-8 flex flex-wrap justify-center gap-3">
        {onRetry ? (
          <Button onClick={onRetry} className="font-sans">
            Intentar de nuevo
          </Button>
        ) : null}
        <Button variant="outline" asChild className="font-sans">
          <Link href={routes.shop}>Volver a tienda</Link>
        </Button>
      </div>
    </div>
  )
}
