'use client'

import { AlignCenter, AlignLeft, AlignRight } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import type { Layer, TextAlign } from '../types/customizer.types'

interface TextPropertiesPanelProps {
  layer: Layer
  autoFocus?: boolean
  /** Override input ids/test ids to avoid duplicates when rendered alongside the modal. */
  inputId?: string
  inputTestId?: string
}

export function TextPropertiesPanel({
  layer,
  autoFocus = false,
  inputId = 'customizer-text-input',
  inputTestId = 'customizer-text-input',
}: TextPropertiesPanelProps) {
  const { updateTextElement } = useCustomizerStore()
  const textValue = layer.text ?? ''
  const colorId = `${inputId}-color`

  const setAlign = (textAlign: TextAlign) => {
    updateTextElement(layer.id, { textAlign })
  }

  return (
    <div className="space-y-4 border-b border-border/40 pb-4">
      <div className="space-y-1.5">
        <Label htmlFor={inputId} className="text-xs text-muted-foreground">
          Contenido
        </Label>
        <Input
          id={inputId}
          data-testid={inputTestId}
          autoFocus={autoFocus}
          value={textValue}
          placeholder="Escribe el texto aquí"
          onChange={(event) => updateTextElement(layer.id, { text: event.target.value })}
        />
      </div>

      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Tamaño de fuente</span>
          <span>{layer.fontSize ?? 16}px</span>
        </div>
        <Slider
          value={[layer.fontSize ?? 16]}
          min={10}
          max={72}
          step={1}
          onValueChange={([value]) => updateTextElement(layer.id, { fontSize: value })}
        />
      </div>

      <div className="space-y-1.5">
        <Label htmlFor={colorId} className="text-xs text-muted-foreground">
          Color
        </Label>
        <div className="flex items-center gap-2">
          <input
            id={colorId}
            type="color"
            value={layer.textColor ?? '#FFFFFF'}
            onChange={(event) => updateTextElement(layer.id, { textColor: event.target.value })}
            className="size-9 cursor-pointer rounded border border-border bg-transparent"
            aria-label="Color del texto"
          />
          <span className="text-xs text-muted-foreground">{layer.textColor ?? '#FFFFFF'}</span>
        </div>
      </div>

      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">Alineación del texto</div>
        <div className="flex gap-1.5">
          {(
            [
              { align: 'left' as const, icon: AlignLeft, title: 'Izquierda' },
              { align: 'center' as const, icon: AlignCenter, title: 'Centro' },
              { align: 'right' as const, icon: AlignRight, title: 'Derecha' },
            ] as const
          ).map(({ align, icon: Icon, title }) => (
            <button
              key={align}
              type="button"
              title={title}
              onClick={() => setAlign(align)}
              className={cn(
                'flex-1 rounded-md border border-border py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground',
                layer.textAlign === align && 'border-primary bg-primary/10 text-primary',
              )}
            >
              <Icon className="mx-auto size-4" />
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
