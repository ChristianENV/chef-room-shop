'use client'

import { Loader2 } from 'lucide-react'

import { Skeleton } from '@/components/ui/skeleton'

/**
 * Inline loading state for admin shipment section.
 */
export function AdminShippingLoading() {
  return (
    <div className="space-y-3 rounded-lg border border-border p-4">
      <div className="flex items-center gap-2">
        <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
        <span className="font-serif text-sm text-muted-foreground">Cargando guía de envío…</span>
      </div>
      <Skeleton className="h-4 w-3/4" />
      <Skeleton className="h-4 w-1/2" />
    </div>
  )
}
