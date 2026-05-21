'use client'

import { FileText } from 'lucide-react'

type AdminOrdersEmptyProps = {
  title?: string
  description?: string
}

/**
 * Empty state when no orders match filters.
 */
export function AdminOrdersEmpty({
  title = 'Sin órdenes',
  description = 'No encontramos órdenes con estos filtros.',
}: AdminOrdersEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-4 text-center">
      <FileText className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">{description}</p>
    </div>
  )
}
