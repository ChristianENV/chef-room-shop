'use client'

import { cn } from '@/lib/utils'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'
import { useCustomizerStore } from '../store/customizer.store'
import { isEditableElement } from '../lib/customizer-utils'
import type { Layer } from '../types/customizer.types'

function layerDisplayText(layer: Layer): string {
  if (layer.type === 'logo') {
    return layer.text?.trim() ? layer.text : 'Logotipo'
  }
  if (layer.type === 'text' || layer.type === 'patch') {
    return layer.text?.trim() ? layer.text : 'Escribe el texto aquí'
  }
  return layer.name
}

function DesignElementChip({
  layer,
  isSelected,
  onSelect,
}: {
  layer: Layer
  isSelected: boolean
  onSelect: () => void
}) {
  const fontSize = layer.fontSize ?? 16
  const color = layer.textColor ?? '#FFFFFF'
  const align = layer.textAlign ?? 'center'

  return (
    <button
      type="button"
      data-testid={isSelected ? 'customizer-selected-element' : 'customizer-design-element'}
      aria-label={`Seleccionar ${layer.name}`}
      onClick={(event) => {
        event.stopPropagation()
        onSelect()
      }}
      className={cn(
        'absolute max-w-[45%] cursor-pointer rounded border px-2 py-1 transition',
        isSelected
          ? 'border-primary ring-2 ring-primary/40'
          : 'border-white/30 hover:border-primary/60',
      )}
      style={{
        left: `${layer.position.x}%`,
        top: `${layer.position.y}%`,
        width: `${Math.max(6, layer.size.width)}%`,
        transform: `translate(-50%, -50%) rotate(${layer.rotation}deg)`,
        opacity: layer.opacity / 100,
        fontSize: `${Math.max(10, fontSize * 0.55)}px`,
        color,
        textAlign: align,
        fontFamily: layer.fontFamily ?? 'sans-serif',
        pointerEvents: 'auto',
      }}
    >
      {layer.type === 'logo' && layer.assetUrl ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={toSameOriginR2Url(layer.assetUrl) ?? layer.assetUrl}
          alt={layer.name}
          crossOrigin="anonymous"
          className="max-h-24 w-full object-contain"
          draggable={false}
        />
      ) : (
        <span className="block whitespace-pre-wrap break-words leading-tight">
          {layerDisplayText(layer)}
        </span>
      )}
    </button>
  )
}

/**
 * Overlay 2D sobre el viewport hasta que el texto se proyecte en el modelo 3D.
 */
export function ViewportElementOverlay() {
  const { layers, selectedLayerId, selectLayer } = useCustomizerStore()

  const editableLayers = layers.filter((layer) => isEditableElement(layer.type) && layer.visible)

  if (editableLayers.length === 0) return null

  return (
    <div
      className="pointer-events-none absolute inset-0 z-[15]"
      aria-hidden={false}
      onClick={() => selectLayer(null)}
    >
      {editableLayers.map((layer) => (
        <DesignElementChip
          key={layer.id}
          layer={layer}
          isSelected={selectedLayerId === layer.id}
          onSelect={() => selectLayer(layer.id)}
        />
      ))}
    </div>
  )
}
