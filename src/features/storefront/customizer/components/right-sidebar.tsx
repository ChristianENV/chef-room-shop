'use client'

import { Reorder } from 'framer-motion'
import { Eye, EyeOff } from 'lucide-react'
import { Slider } from '@/components/ui/slider'
import { useCustomizerStore } from '../store/customizer.store'
import { getLayerDescription, getLayerIcon } from '../lib/customizer-utils'

export function RightSidebar() {
  const {
    layers,
    selectedLayerId,
    selectLayer,
    toggleLayerVisibility,
    updateLayerOpacity,
    duplicateLayer,
    deleteLayer,
  } = useCustomizerStore()

  const selectedLayer = layers.find((item) => item.id === selectedLayerId) ?? null

  return (
    <aside className="flex h-full w-80 flex-col border-l border-border/30 bg-card/30">
      <div className="border-b border-border/30 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Capas</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <Reorder.Group axis="y" values={layers} onReorder={() => {}} className="space-y-2">
          {layers.map((layer) => (
            <Reorder.Item
              key={layer.id}
              value={layer}
              className="flex items-center gap-3 rounded-lg border border-border/40 bg-secondary/30 p-2"
              onClick={() => selectLayer(layer.id)}
            >
              <span>{getLayerIcon(layer.type)}</span>
              <div className="min-w-0 flex-1">
                <div className="truncate text-sm">{layer.name}</div>
                <div className="truncate text-xs text-muted-foreground">{getLayerDescription(layer.type)}</div>
              </div>
              <button
                type="button"
                onClick={(event) => {
                  event.stopPropagation()
                  toggleLayerVisibility(layer.id)
                }}
              >
                {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
              </button>
            </Reorder.Item>
          ))}
        </Reorder.Group>
      </div>
      {selectedLayer ? (
        <div className="space-y-3 border-t border-border/30 p-4">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">Propiedades</div>
          <div>
            <div className="mb-1 text-xs text-muted-foreground">Opacidad</div>
            <Slider
              value={[selectedLayer.opacity]}
              onValueChange={([value]) => updateLayerOpacity(selectedLayer.id, value)}
              min={0}
              max={100}
              step={1}
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => duplicateLayer(selectedLayer.id)}
              className="rounded-md border border-border px-2 py-1 text-xs"
            >
              Duplicar
            </button>
            <button
              type="button"
              onClick={() => deleteLayer(selectedLayer.id)}
              className="rounded-md border border-border px-2 py-1 text-xs"
            >
              Eliminar
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  )
}
