'use client'

import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../../store/customizer.store'
import { getEstimatedElementPrice } from '../../pricing/get-estimated-element-price'
import type { LayerType } from '../../types/customizer.types'

interface ElementAddSectionProps {
  title: string
  description: string
  ctaLabel: string
  elementType: 'logo' | 'text' | 'patch'
  elementName: string
  matchTypes: LayerType[]
  note?: string
  /** Usa flujo de nombre con placeholder predeterminado. */
  variant?: 'text' | 'name' | 'default'
}

export function ElementAddSection({
  title,
  description,
  ctaLabel,
  elementType,
  elementName,
  matchTypes,
  note,
  variant = 'default',
}: ElementAddSectionProps) {
  const { layers, selectedLayerId, selectLayer, addElement, addTextElement, addNameElement } =
    useCustomizerStore()
  const items = layers.filter((layer) => matchTypes.includes(layer.type))
  const estimatedPrice = getEstimatedElementPrice({
    type: elementType === 'logo' ? 'logo' : 'text',
    zone: 'pecho',
    layers,
  })

  const handleAdd = () => {
    if (variant === 'name') {
      addNameElement()
      return
    }
    if (elementType === 'text') {
      addTextElement({ name: elementName })
      return
    }
    addElement(elementType, elementName)
  }

  const testId =
    variant === 'name'
      ? 'customizer-add-name-button'
      : elementType === 'text'
      ? 'customizer-add-text-button'
      : undefined

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">{title}</h3>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>

      <Button className="w-full" onClick={handleAdd} data-testid={testId}>
        <Plus className="mr-1 size-4" />
        {ctaLabel}
        <span className="ml-auto text-xs font-medium opacity-90">{estimatedPrice.formatted}</span>
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
              <span className="truncate">{item.text?.trim() || item.name}</span>
              <span className="text-[11px] text-muted-foreground">Editar</span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground/70">
        Solo bordado. {estimatedPrice.hint ?? 'Cada elemento bordado se suma al total en tiempo real.'}
      </p>
      {note ? <p className="text-[11px] text-muted-foreground/70">{note}</p> : null}
    </div>
  )
}
