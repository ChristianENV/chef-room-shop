'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import type { LayerType } from '../../types/customizer.types'

interface ElementAddSectionProps {
  title: string
  description: string
  ctaLabel: string
  elementType: 'logo' | 'text' | 'patch'
  elementName: string
  matchTypes: LayerType[]
  note?: string
}

export function ElementAddSection({
  title,
  description,
  ctaLabel,
  elementType,
  elementName,
  matchTypes,
  note,
}: ElementAddSectionProps) {
  const { layers, selectedLayerId, selectLayer, addElement } = useCustomizerStore()
  const items = layers.filter((layer) => matchTypes.includes(layer.type))

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Button className="w-full" onClick={() => addElement(elementType, elementName)}>
        <Plus className="mr-1 size-4" />
        {ctaLabel}
      </Button>

      {items.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            En tu diseño
          </p>
          {items.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => selectLayer(item.id)}
              className={cn(
                'flex w-full items-center justify-between rounded-lg border px-3 py-2 text-sm transition',
                selectedLayerId === item.id
                  ? 'border-primary bg-primary/10 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground',
              )}
            >
              <span className="truncate">{item.name}</span>
              <span className="text-[11px] text-muted-foreground">Editar</span>
            </button>
          ))}
        </div>
      ) : null}

      {note ? <p className="text-[11px] text-muted-foreground/70">{note}</p> : null}
    </div>
  )
}
