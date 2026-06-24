'use client'

import {
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import { getLayerDescription, isEditableElement } from '../lib/customizer-utils'
import type { DesignTool, Layer, LayerType } from '../types/customizer.types'
import { TextPropertiesPanel } from './text-properties-panel'

const ELEMENT_ICON: Record<LayerType, LucideIcon> = {
  logo: Sticker,
  text: TypeIcon,
  patch: Sparkles,
  vivos: Sparkles,
  buttons: CircleDot,
  base: Shirt,
}

function SectionHeading({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="space-y-0.5">
      <h3 className="text-sm font-semibold text-foreground">{title}</h3>
      {subtitle ? <p className="text-xs text-muted-foreground">{subtitle}</p> : null}
    </div>
  )
}

function ElementRow({ layer }: { layer: Layer }) {
  const { selectedLayerId, selectLayer, toggleLayerVisibility, duplicateLayer, deleteLayer } =
    useCustomizerStore()
  const Icon = ELEMENT_ICON[layer.type] ?? Shirt
  const editable = isEditableElement(layer.type)
  const isSelected = selectedLayerId === layer.id
  const preview =
    layer.type === 'logo' && layer.assetUrl
      ? 'Logotipo cargado'
      : editable && layer.text?.trim()
        ? layer.text
        : editable
          ? 'Sin contenido'
          : getLayerDescription(layer.type)

  return (
    <div
      role="button"
      tabIndex={0}
      data-testid={isSelected ? 'customizer-selected-element' : 'customizer-design-element'}
      aria-label={`Elemento ${layer.name}`}
      onClick={() => selectLayer(layer.id)}
      onKeyDown={(event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault()
          selectLayer(layer.id)
        }
      }}
      className={cn(
        'flex items-center gap-2.5 rounded-xl border p-2.5 text-left transition',
        isSelected
          ? 'border-primary bg-primary/10 shadow-sm shadow-primary/5'
          : 'border-border/50 bg-card/80 hover:border-primary/30 hover:bg-card',
        !layer.visible && 'opacity-50',
        layer.locked && !editable && 'border-dashed',
      )}
    >
      <span
        className={cn(
          'flex size-9 shrink-0 items-center justify-center rounded-lg',
          isSelected ? 'bg-primary/15 text-primary' : 'bg-secondary text-foreground',
        )}
      >
        <Icon className="size-4" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="truncate text-sm font-medium text-foreground">{layer.name}</div>
        <div className="truncate text-[11px] text-muted-foreground">{preview}</div>
      </div>
      {editable ? (
        <div className="flex items-center gap-0.5">
          <button
            type="button"
            title={layer.visible ? 'Ocultar' : 'Mostrar'}
            aria-label={layer.visible ? 'Ocultar elemento' : 'Mostrar elemento'}
            onClick={(event) => {
              event.stopPropagation()
              toggleLayerVisibility(layer.id)
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
          </button>
          <button
            type="button"
            title="Duplicar"
            aria-label="Duplicar elemento"
            data-testid="customizer-duplicate-element-row"
            onClick={(event) => {
              event.stopPropagation()
              duplicateLayer(layer.id)
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-secondary hover:text-foreground"
          >
            <Copy className="size-4" />
          </button>
          <button
            type="button"
            title="Eliminar"
            aria-label="Eliminar elemento"
            data-testid="customizer-delete-element-row"
            onClick={(event) => {
              event.stopPropagation()
              deleteLayer(layer.id)
            }}
            className="rounded-md p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
          >
            <Trash2 className="size-4" />
          </button>
        </div>
      ) : (
        <span className="flex items-center gap-1 rounded-md bg-muted/50 px-1.5 py-0.5 text-[10px] text-muted-foreground">
          <Lock className="size-3" aria-hidden />
          Fijo
        </span>
      )}
    </div>
  )
}

const TOOLS: { id: DesignTool; label: string; icon: LucideIcon; testId: string }[] = [
  { id: 'select', label: 'Seleccionar', icon: MousePointer2, testId: 'customizer-tool-select' },
  { id: 'move', label: 'Mover', icon: Move, testId: 'customizer-tool-move' },
  { id: 'scale', label: 'Escalar', icon: Scaling, testId: 'customizer-tool-scale' },
  { id: 'rotate', label: 'Rotar', icon: RotateCw, testId: 'customizer-tool-rotate' },
]

function PropertyBlock({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-2.5 rounded-xl border border-border/40 bg-card/40 p-3">{children}</div>
  )
}

function ElementProperties({ layer, tool }: { layer: Layer; tool: DesignTool }) {
  const {
    updateLayerPosition,
    updateLayerSize,
    updateLayerRotation,
    updateLayerOpacity,
    updateLayer,
    duplicateLayer,
    deleteLayer,
  } = useCustomizerStore()

  const showAll = tool === 'select'
  const isTextLike = layer.type === 'text' || layer.type === 'patch'
  const isLogo = layer.type === 'logo'

  return (
    <div className="space-y-4">
      {isTextLike ? (
        <TextPropertiesPanel
          layer={layer}
          inputId="customizer-text-input-inline"
          inputTestId="customizer-text-input-inline"
        />
      ) : null}

      {isLogo ? (
        <PropertyBlock>
          <p className="text-xs text-muted-foreground">
            Logotipo cargado. Ajusta tamaño, posición y rotación abajo. Para reemplazarlo, usa el
            panel izquierdo de logotipos.
          </p>
        </PropertyBlock>
      ) : null}

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
            onValueChange={([value]) => updateLayerSize(layer.id, { width: value, height: value })}
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

      <PropertyBlock>
        <div className="text-xs text-muted-foreground">Zona</div>
        <Select
          value={layer.zone ?? 'pecho'}
          onValueChange={(value) =>
            updateLayer(layer.id, {
              zone: value as Layer['zone'],
            })
          }
        >
          <SelectTrigger>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="pecho">Pecho</SelectItem>
            <SelectItem value="espalda">Espalda</SelectItem>
            <SelectItem value="manga-izquierda">Manga izquierda</SelectItem>
            <SelectItem value="manga-derecha">Manga derecha</SelectItem>
            <SelectItem value="general">General</SelectItem>
          </SelectContent>
        </Select>
      </PropertyBlock>

      <div className="flex gap-2 pt-1">
        <button
          type="button"
          data-testid="customizer-duplicate-element"
          onClick={() => duplicateLayer(layer.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-border py-2.5 text-xs font-medium hover:border-primary/40 hover:bg-card"
        >
          <Copy className="size-3.5" />
          Duplicar
        </button>
        <button
          type="button"
          data-testid="customizer-delete-element"
          onClick={() => deleteLayer(layer.id)}
          className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-destructive/40 py-2.5 text-xs font-medium text-destructive hover:bg-destructive/10"
        >
          <Trash2 className="size-3.5" />
          Eliminar
        </button>
      </div>
    </div>
  )
}

export function RightSidebar() {
  const { layers, selectedLayerId, activeTool, setActiveTool, duplicateLayer, deleteLayer } =
    useCustomizerStore()

  const selectedLayer = layers.find((item) => item.id === selectedLayerId) ?? null
  const selectedEditable = selectedLayer && isEditableElement(selectedLayer.type)
  const editableCount = layers.filter((layer) => isEditableElement(layer.type)).length

  const handleDuplicateTool = () => {
    if (selectedLayerId && selectedEditable) duplicateLayer(selectedLayerId)
  }

  const handleDeleteTool = () => {
    if (selectedLayerId && selectedEditable) deleteLayer(selectedLayerId)
  }

  return (
    <aside
      data-testid="customizer-right-panel"
      className="flex h-full min-h-0 w-full flex-col border-l border-border/40 bg-card/40 xl:w-[380px] xl:max-w-[420px] xl:shrink-0"
    >
      <div className="shrink-0 border-b border-border/40 px-5 py-4">
        <h2 className="text-sm font-semibold text-foreground">Inspector del diseño</h2>
        <p className="mt-0.5 text-xs text-muted-foreground">
          Capas, herramientas y propiedades de tu prenda.
        </p>
      </div>

      <div
        data-testid="customizer-right-panel-scroll"
        className="customizer-panel-scroll min-h-0 flex-1 overflow-y-auto"
      >
        <div className="space-y-6 px-5 py-4 pb-28">
          <section data-testid="customizer-design-elements-section" className="space-y-3">
            <SectionHeading
              title="Elementos del diseño"
              subtitle="Organiza logos, nombres y detalles de tu prenda."
            />
            {editableCount === 0 ? (
              <p className="rounded-xl border border-dashed border-border/60 bg-card/50 p-4 text-center text-xs text-muted-foreground">
                Agrega un texto o logotipo desde el panel izquierdo para editarlo aquí.
              </p>
            ) : (
              <div className="space-y-2" data-testid="customizer-design-elements">
                {layers.map((layer) => (
                  <ElementRow key={layer.id} layer={layer} />
                ))}
              </div>
            )}
          </section>

          <section
            data-testid="customizer-tools-section"
            className="space-y-3 border-t border-border/30 pt-5"
          >
            <SectionHeading
              title="Herramientas"
              subtitle="Selecciona cómo quieres transformar el elemento."
            />
            <div className="grid grid-cols-4 gap-2">
              {TOOLS.map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    type="button"
                    title={item.label}
                    aria-label={item.label}
                    data-testid={item.testId}
                    onClick={() => setActiveTool(item.id)}
                    className={cn(
                      'flex flex-col items-center gap-1 rounded-lg border py-2.5 text-[10px] font-medium transition',
                      activeTool === item.id
                        ? 'border-primary bg-primary/10 text-primary shadow-sm shadow-primary/5'
                        : 'border-border/60 bg-card/60 text-muted-foreground hover:border-primary/30 hover:text-foreground',
                    )}
                  >
                    <Icon className="size-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                title={
                  selectedEditable
                    ? 'Duplicar elemento seleccionado'
                    : 'Selecciona un elemento editable para duplicar'
                }
                disabled={!selectedEditable}
                onClick={handleDuplicateTool}
                data-testid="customizer-duplicate-element-tool"
                className={cn(
                  'flex items-center justify-center gap-1 rounded-lg border py-2.5 text-[10px] font-medium transition',
                  selectedEditable
                    ? 'border-border/60 bg-card/60 hover:border-primary/40'
                    : 'cursor-not-allowed border-border/40 opacity-40',
                )}
              >
                <Copy className="size-3.5" />
                Duplicar
              </button>
              <button
                type="button"
                title={
                  selectedEditable
                    ? 'Eliminar elemento seleccionado'
                    : 'Selecciona un elemento editable para eliminar'
                }
                disabled={!selectedEditable}
                onClick={handleDeleteTool}
                data-testid="customizer-delete-element-tool"
                className={cn(
                  'flex items-center justify-center gap-1 rounded-lg border py-2.5 text-[10px] font-medium transition',
                  selectedEditable
                    ? 'border-destructive/40 text-destructive hover:bg-destructive/10'
                    : 'cursor-not-allowed border-border/40 opacity-40',
                )}
              >
                <Trash2 className="size-3.5" />
                Eliminar
              </button>
            </div>
          </section>

          <section
            data-testid="customizer-properties-section"
            className="space-y-3 border-t border-border/30 pt-5"
          >
            <SectionHeading
              title="Propiedades"
              subtitle={
                selectedLayer
                  ? `Editando: ${selectedLayer.name}`
                  : 'Selecciona un elemento para ajustar sus valores.'
              }
            />
            <div data-testid="customizer-properties-panel">
              {!selectedLayer ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-5 text-center">
                  <MousePointer2 className="mx-auto mb-2 size-5 text-muted-foreground/70" />
                  <p className="text-xs text-muted-foreground">
                    Selecciona un elemento para ajustar posición, tamaño y rotación.
                  </p>
                </div>
              ) : !selectedEditable ? (
                <div className="rounded-xl border border-dashed border-border/60 bg-card/50 p-5 text-center">
                  <Lock className="mx-auto mb-2 size-5 text-muted-foreground/70" />
                  <p className="text-xs text-muted-foreground">
                    Este elemento es parte de la prenda y no se puede mover ni eliminar.
                  </p>
                </div>
              ) : (
                <ElementProperties layer={selectedLayer} tool={activeTool} />
              )}
            </div>
          </section>
        </div>
      </div>
    </aside>
  )
}
