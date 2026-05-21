'use client'

import { Palette } from 'lucide-react'

import { Button } from '@/components/ui/button'

type AdminCustomizationEmptyProps = {
  title?: string
  description?: string
  actionLabel?: string
  onAction?: () => void
}

export function AdminCustomizationEmpty({
  title = 'Sin reglas configuradas',
  description = 'Agrega la primera regla para definir zonas, técnicas y precios.',
  actionLabel = 'Agregar regla',
  onAction,
}: AdminCustomizationEmptyProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border bg-card py-12 px-4 text-center">
      <div className="mb-4 rounded-full bg-secondary p-4">
        <Palette className="h-8 w-8 text-muted-foreground" />
      </div>
      <h3 className="font-sans text-lg font-semibold text-foreground">{title}</h3>
      <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">{description}</p>
      {onAction ? (
        <Button onClick={onAction} className="mt-4">
          {actionLabel}
        </Button>
      ) : null}
    </div>
  )
}
