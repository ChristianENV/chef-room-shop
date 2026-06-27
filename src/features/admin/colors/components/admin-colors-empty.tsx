'use client'

import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminColorsEmptyProps = {
  onCreateClick: () => void
}

export function AdminColorsEmpty({ onCreateClick }: AdminColorsEmptyProps) {
  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/20 px-6 py-12 text-center">
      <p className="font-sans text-lg font-medium">Sin colores</p>
      <p className="mt-2 font-serif text-sm text-muted-foreground">
        Crea colores para telas, variantes comerciales o productos generales.
      </p>
      <Button className="mt-6" onClick={onCreateClick}>
        <Plus className="mr-2 h-4 w-4" />
        Nuevo color
      </Button>
    </div>
  )
}
