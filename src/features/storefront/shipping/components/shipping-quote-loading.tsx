'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ShippingQuoteLoading() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Cargando tarifas de envío">
      <p className="font-serif text-sm text-muted-foreground">
        Buscando tarifas disponibles…
      </p>
      <div className="space-y-3">
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
        <Skeleton className="h-28 w-full rounded-lg" />
      </div>
    </div>
  )
}
