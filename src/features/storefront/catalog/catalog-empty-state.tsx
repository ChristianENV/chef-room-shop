'use client'

import { Button } from '@/components/ui/button'
import { Search, RefreshCw, AlertCircle, WifiOff } from 'lucide-react'

interface CatalogEmptyStateProps {
  variant?: 'no-results' | 'error' | 'network'
  onClearFilters?: () => void
  onRetry?: () => void
}

export function CatalogEmptyState({
  variant = 'no-results',
  onClearFilters,
  onRetry,
}: CatalogEmptyStateProps) {
  if (variant === 'network') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <WifiOff className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-sans text-lg font-semibold text-foreground">
          Sin conexion
        </h3>
        <p className="mt-2 max-w-sm font-serif text-muted-foreground">
          Parece que no tienes conexion a internet. Verifica tu red e intenta de nuevo.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Reintentar
          </Button>
        )}
      </div>
    )
  }

  if (variant === 'error') {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="mb-4 rounded-full bg-destructive/10 p-4">
          <AlertCircle className="h-8 w-8 text-destructive" />
        </div>
        <h3 className="font-sans text-lg font-semibold text-foreground">
          Algo salio mal
        </h3>
        <p className="mt-2 max-w-sm font-serif text-muted-foreground">
          No pudimos cargar los productos. Por favor intenta de nuevo.
        </p>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" className="mt-4 gap-2">
            <RefreshCw className="h-4 w-4" />
            Intentar de nuevo
          </Button>
        )}
      </div>
    )
  }

  // Default: no-results
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Search className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">
        No encontramos productos
      </h3>
      <p className="mt-2 max-w-sm font-serif text-muted-foreground">
        No hay productos que coincidan con los filtros seleccionados. 
        Intenta con otros criterios de busqueda.
      </p>
      {onClearFilters && (
        <Button onClick={onClearFilters} className="mt-4">
          Limpiar filtros
        </Button>
      )}
    </div>
  )
}
