'use client'

import { Layers } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminCategoriesEmptyProps = {
  onCreateClick?: () => void
}

export function AdminCategoriesEmpty({ onCreateClick }: AdminCategoriesEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card px-4 py-16 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Layers className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">Sin categorías</h3>
      <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">
        Crea la primera familia de productos para organizar el catálogo y los formularios de
        producto.
      </p>
      {onCreateClick ? (
        <Button onClick={onCreateClick} className="mt-4">
          Nueva categoría
        </Button>
      ) : null}
    </div>
  )
}
