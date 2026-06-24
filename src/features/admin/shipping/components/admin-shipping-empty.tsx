'use client'

import { Package } from 'lucide-react'

type AdminShippingEmptyProps = {
  blockedReason?: string | null
}

/**
 * Empty state when no Skydropx label exists yet.
 */
export function AdminShippingEmpty({ blockedReason }: AdminShippingEmptyProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 p-4 text-center">
      <Package className="mx-auto mb-2 h-8 w-8 text-muted-foreground" />
      <p className="font-sans text-sm font-medium">Sin guía generada</p>
      <p className="mt-1 font-serif text-sm text-muted-foreground">
        {blockedReason ?? 'Genera la guía con Skydropx cuando el pedido esté listo para envío.'}
      </p>
    </div>
  )
}
