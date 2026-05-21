'use client'

import { Skeleton } from '@/components/ui/skeleton'

export function ShippingQuoteLoading() {
  return (
    <div className="space-y-3" aria-busy="true" aria-label="Cargando tarifas de envío">
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
      <Skeleton className="h-24 w-full rounded-lg" />
    </div>
  )
}
