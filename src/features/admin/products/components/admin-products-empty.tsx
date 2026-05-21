'use client'

import { Package } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminProductsEmptyProps = {
  title?: string
  description?: string
  onCreateClick?: () => void
}

export function AdminProductsEmpty({
  title = 'Sin productos',
  description = 'No encontramos productos con estos filtros.',
  onCreateClick,
}: AdminProductsEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-16 px-4 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Package className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">{description}</p>
      {onCreateClick ? (
        <Button onClick={onCreateClick} className="mt-4">
          Nuevo producto
        </Button>
      ) : null}
    </div>
  )
}
