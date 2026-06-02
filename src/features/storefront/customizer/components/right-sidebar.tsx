'use client'

import { useState } from 'react'
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  CircleDot,
  Copy,
  Eye,
  EyeOff,
  Lock,
  Move,
  MousePointer2,
  RotateCw,
  Scaling,
  Shirt,
  Sparkles,
  Sticker,
  Trash2,
  Type as TypeIcon,
} from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import { getLayerDescription, isEditableElement } from '../lib/customizer-utils'
import type { Layer, LayerType } from '../types/customizer.types'

type Tool = 'select' | 'move' | 'scale' | 'rotate'

const ELEMENT_ICON: Record<LayerType, LucideIcon> = {
  logo: Sticker,
  text: TypeIcon,
  patch: Sparkles,
  vivos: Sparkles,
  buttons: CircleDot,
  base: Shirt,
}

function ElementRow({ layer }: { layer: Layer }) {
  const { selectedLayerId, selectLayer, toggleLayerVisibility, duplicateLayer, deleteLayer } =
    useCustomizerStore()
  const Icon = ELEMENT_ICON[layer.type] ?? Shirt
  const editable = isEditableElement(layer.type)
  const isSelected = selectedLayerId === layer.id

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => selectLayer(layer.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          selectLayer(layer.id)
        }
      }}
      className={cn(
        'flex items-center gap-2 rounded-lg border p-2 text-left transition',
        isSelected
          ? 'border-primary bg-primary/10'
          : 'border-border/50 bg-card hover:border-primary/30',
        !layer.visible && 'opacity-50',
      )}
    >
      <span className="flex size-8 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{layer.name}</div>
        <div className="truncate text-[11px] text-muted-foreground">
          {getLayerDescription(layer.type)}
        </div>
      </div>
      {editable ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={layer.visible ? 'Ocultar' : 'Mostrar'}
            onClick={(event) => {
              event.stopPropagation()
              toggleLayerVisibility(layer.id)
            }}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button
            type="button"
            title="Duplicar"
            onClick={(event) => {
              event.stopPropagation()
              duplicateLayer(layer.id)
            }}
            className="rounded p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            title="Eliminar"
            onClick={(event) => {
              event.stopPropagation()
              deleteLayer(layer.id)
            }}
            className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <Lock className="size-3.5 text-muted-foreground/60" />
      )}
    </div>
  )
}

const TOOLS: { id: Tool; label: string; icon: LucideIcon }[] = [
  { id: 'select', label: 'Seleccionar', icon: MousePointer2 },
  { id: 'move', label: 'Mover', icon: Move },
  { id: 'scale', label: 'Escalar', icon: Scaling },
  { id: 'rotate', label: 'Rotar', icon: RotateCw },
]

function PropertyBlock({ children }: { children: React.ReactNode }) {
  return <div className="space-y-2">{children}</div>
}

function ElementProperties({ layer, tool }: { layer: Layer; tool: Tool }) {
  const {
    updateLayerPosition,
    updateLayerSize,
    updateLayerRotation,
    updateLayerOpacity,
    duplicateLayer,
    deleteLayer,
  } = useCustomizerStore()

  const showAll = tool === 'select'

  return (
    <div className="space-y-5">
      {(showAll || tool === 'move') && (
        <PropertyBlock>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Posición X</span>
            <span>{Math.round(layer.position.x)}%</span>
          </div>
          <Slider
            value={[layer.position.x]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) =>
              updateLayerPosition(layer.id, { x: value, y: layer.position.y })
            }
          />
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Posición Y</span>
            <span>{Math.round(layer.position.y)}%</span>
          </div>
          <Slider
            value={[layer.position.y]}
            min={0}
            max={100}
            step={1}
            onValueChange={([value]) =>
              updateLayerPosition(layer.id, { x: layer.position.x, y: value })
            }
          />
        </PropertyBlock>
      )}

      {(showAll || tool === 'scale') && (
        <PropertyBlock>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Tamaño</span>
            <span>{Math.round(layer.size.width)}%</span>
          </div>
          <Slider
            value={[layer.size.width]}
            min={2}
            max={60}
            step={1}
            onValueChange={([value]) =>
              updateLayerSize(layer.id, { width: value, height: value })
            }
          />
        </PropertyBlock>
      )}

      {(showAll || tool === 'rotate') && (
        <PropertyBlock>
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Rotación</span>
            <span>{Math.round(layer.rotation)}°</span>
          </div>
          <Slider
            value={[layer.rotation]}
            min={-180}
            max={180}
            step={1}
            onValueChange={([value]) => updateLayerRotation(layer.id, value)}
          />
        </PropertyBlock>
      )}

      <PropertyBlock>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Opacidad</span>
          <span>{Math.round(layer.opacity)}%</span>
        </div>
        <Slider
          value={[layer.opacity]}
          min={0}
          max={100}
          step={1}
          onValueChange={([value]) => updateLayerOpacity(layer.id, value)}
        />
      </PropertyBlock>

      <div>
        <div className="mb-1.5 text-xs text-muted-foreground">Alineación</div>
        <div className="flex gap-1.5">
          <button
            type="button"
            title="Izquierda"
            onClick={() => updateLayerPosition(layer.id, { x: 8, y: layer.position.y })}
            className="flex-1 rounded-md border border-border py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <AlignLeft className="mx-auto size-4" />
          </button>
          <button
            type="button"
            title="Centro"
            onClick={() => updateLayerPosition(layer.id, { x: 50, y: layer.position.y })}
            className="flex-1 rounded-md border border-border py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <AlignCenter className="mx-auto size-4" />
          </button>
          <button
            type="button"
            title="Derecha"
            onClick={() => updateLayerPosition(layer.id, { x: 92, y: layer.position.y })}
            className="flex-1 rounded-md border border-border py-1.5 text-muted-foreground hover:border-primary/40 hover:text-foreground"
          >
            <AlignRight className="mx-auto size-4" />
          </button>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => duplicateLayer(layer.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-border py-2 text-xs font-medium hover:border-primary/40"
        >
          <Copy className="size-3.5" />
          Duplicar
        </button>
        <button
          type="button"
          onClick={() => deleteLayer(layer.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded-md border border-destructive/40 py-2 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  )
}

export function RightSidebar() {
  const { layers, selectedLayerId } = useCustomizerStore()
  const [tool, setTool] = useState<Tool>('select')

  const selectedLayer = layers.find((item) => item.id === selectedLayerId) ?? null
  const selectedEditable = selectedLayer && isEditableElement(selectedLayer.type)

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border/40 bg-card/30">
      <div className="border-b border-border/40 p-4" data-testid="customizer-design-elements">
        <h2 className="text-sm font-semibold text-foreground">Elementos del diseño</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Organiza logos, nombres y detalles de tu prenda.
        </p>
        <div className="mt-3 space-y-2">
          {layers.map((layer) => (
            <ElementRow key={layer.id} layer={layer} />
          ))}
        </div>
      </div>

      <div className="border-b border-border/40 p-4">
        <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Herramientas
        </div>
        <div className="grid grid-cols-4 gap-1.5">
          {TOOLS.map((item) => {
            const Icon = item.icon
            return (
              <button
                key={item.id}
                type="button"
                title={item.label}
                disabled={!selectedEditable}
                onClick={() => setTool(item.id)}
                className={cn(
                  'flex flex-col items-center gap-1 rounded-md border py-2 text-[10px] transition',
                  tool === item.id && selectedEditable
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border text-muted-foreground hover:text-foreground',
                  !selectedEditable && 'cursor-not-allowed opacity-40',
                )}
              >
                <Icon className="size-4" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="min-h-0 flex-1 overflow-y-auto p-4" data-testid="customizer-properties-panel">
        <div className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          Propiedades
        </div>
        {!selectedLayer ? (
          <p className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-center text-xs text-muted-foreground">
            Selecciona un elemento para ajustar posición, tamaño y rotación.
          </p>
        ) : !selectedEditable ? (
          <p className="rounded-lg border border-dashed border-border/60 bg-card/40 p-4 text-center text-xs text-muted-foreground">
            Este elemento es parte de la prenda y no se puede mover ni eliminar.
          </p>
        ) : (
          <ElementProperties layer={selectedLayer} tool={tool} />
        )}
      </div>
    </aside>
  )
}
