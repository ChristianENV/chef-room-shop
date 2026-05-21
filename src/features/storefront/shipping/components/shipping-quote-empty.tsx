'use client'

import { PackageX } from 'lucide-react'

export function ShippingQuoteEmpty() {
  return (
    <div className="rounded-lg border border-dashed border-border bg-secondary/30 p-6 text-center">
      <PackageX className="mx-auto h-8 w-8 text-muted-foreground" />
      <p className="mt-3 font-sans text-sm font-medium text-foreground">
        No hay tarifas disponibles para este destino.
      </p>
      <p className="mt-1 font-serif text-xs text-muted-foreground">
        Verifica el código postal o intenta con otra dirección.
      </p>
    </div>
  )
}
