'use client'

import { Package } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

interface ProductsEmptyStateProps {
  onCreateClick: () => void
}

export function ProductsEmptyState({ onCreateClick }: ProductsEmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">No hay productos</h3>
      <p className="mt-1 font-serif text-sm text-muted-foreground text-center max-w-sm">
        Comienza agregando tu primer producto al catalogo.
      </p>
      <Button onClick={onCreateClick} className="mt-4">
        Crear producto
      </Button>
    </div>
  )
}

interface ProductsErrorStateProps {
  onRetry: () => void
}

export function ProductsErrorState({ onRetry }: ProductsErrorStateProps) {
  return (
    <Alert variant="destructive">
      <AlertTitle className="font-sans">Error al cargar productos</AlertTitle>
      <AlertDescription className="font-serif">
        No pudimos cargar la lista de productos. Por favor intenta de nuevo.
        <Button variant="outline" size="sm" onClick={onRetry} className="mt-2 block">
          Reintentar
        </Button>
      </AlertDescription>
    </Alert>
  )
}
