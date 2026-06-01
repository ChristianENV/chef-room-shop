'use client'

import { motion, AnimatePresence, Reorder } from 'framer-motion'
import { 
  MousePointer2,
  Move,
  Maximize2,
  RotateCw,
  Copy,
  Trash2,
  Eye,
  EyeOff,
  GripVertical,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignStartVertical,
  AlignCenterVertical,
  AlignEndVertical,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { useDesignerStore, type Layer } from '@/lib/store'
import { Slider } from '@/components/ui/slider'

const tools = [
  { id: 'select', icon: MousePointer2, label: 'Seleccionar' },
  { id: 'move', icon: Move, label: 'Mover' },
  { id: 'scale', icon: Maximize2, label: 'Escalar' },
  { id: 'rotate', icon: RotateCw, label: 'Rotar' },
  { id: 'duplicate', icon: Copy, label: 'Duplicar' },
  { id: 'delete', icon: Trash2, label: 'Eliminar' },
]

function ToolButton({ 
  icon: Icon, 
  label, 
  active, 
  onClick 
}: { 
  icon: typeof MousePointer2
  label: string
  active?: boolean
  onClick?: () => void 
}) {
  return (
    <motion.button
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      onClick={onClick}
      className={cn(
        "flex flex-col items-center gap-1 rounded-lg p-2 transition-all",
        active 
          ? "bg-primary/20 text-primary" 
          : "text-muted-foreground hover:bg-secondary/50 hover:text-foreground"
      )}
    >
      <Icon className="size-5" />
      <span className="text-[10px] font-medium">{label}</span>
    </motion.button>
  )
}

function LayerItem({ layer, isSelected }: { layer: Layer; isSelected: boolean }) {
  const { selectLayer, toggleLayerVisibility } = useDesignerStore()

  const getLayerIcon = (type: Layer['type']) => {
    switch (type) {
      case 'logo': return '🏷️'
      case 'text': return '📝'
      case 'patch': return '🎨'
      case 'vivos': return '✨'
      case 'buttons': return '⚫'
      case 'base': return '👕'
      default: return '📄'
    }
  }

  const getLayerDescription = (type: Layer['type']) => {
    switch (type) {
      case 'logo': return 'Frente - Pecho izquierdo'
      case 'text': return 'Frente - Pecho izquierdo'
      case 'vivos': return 'Cuello y punos'
      case 'buttons': return 'Frontales'
      case 'base': return 'Filipina'
      default: return ''
    }
  }

  return (
    <Reorder.Item
      value={layer}
      id={layer.id}
      className={cn(
        "flex items-center gap-3 rounded-lg border p-2 transition-all cursor-pointer",
        isSelected 
          ? "border-primary/50 bg-primary/10" 
          : "border-transparent bg-secondary/30 hover:bg-secondary/50"
      )}
      onClick={() => selectLayer(layer.id)}
    >
      <GripVertical className="size-4 cursor-grab text-muted-foreground" />
      
      <div className="flex size-10 items-center justify-center rounded-md bg-secondary/50 text-lg">
        {getLayerIcon(layer.type)}
      </div>
      
      <div className="flex-1 min-w-0">
        <div className="text-sm font-medium truncate">{layer.name}</div>
        <div className="text-xs text-muted-foreground truncate">
          {getLayerDescription(layer.type)}
        </div>
      </div>
      
      <motion.button
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        onClick={(e) => {
          e.stopPropagation()
          toggleLayerVisibility(layer.id)
        }}
        className="p-1 text-muted-foreground hover:text-foreground"
      >
        {layer.visible ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
      </motion.button>
    </Reorder.Item>
  )
}

function AlignmentButton({ icon: Icon, onClick }: { icon: typeof AlignLeft; onClick: () => void }) {
  return (
    <motion.button
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.9 }}
      onClick={onClick}
      className="flex size-9 items-center justify-center rounded-lg bg-secondary/50 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground"
    >
      <Icon className="size-4" />
    </motion.button>
  )
}

export default function RightSidebar() {
  const { 
    layers, 
    selectedLayerId, 
    duplicateLayer, 
    deleteLayer,
    updateLayerPosition,
    updateLayerRotation,
    updateLayerSize,
    updateLayerOpacity,
  } = useDesignerStore()

  const selectedLayer = layers.find(l => l.id === selectedLayerId)

  return (
    <div className="flex h-full w-80 flex-col border-l border-border/30 bg-card/30">
      {/* Tools header */}
      <div className="border-b border-border/30 p-4">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-3">
          Herramientas
        </div>
        <div className="grid grid-cols-6 gap-1">
          {tools.map((tool, index) => (
            <ToolButton
              key={tool.id}
              icon={tool.icon}
              label={tool.label}
              active={index === 0}
              onClick={() => {
                if (tool.id === 'duplicate' && selectedLayerId) {
                  duplicateLayer(selectedLayerId)
                } else if (tool.id === 'delete' && selectedLayerId) {
                  deleteLayer(selectedLayerId)
                }
              }}
            />
          ))}
        </div>
      </div>

      {/* Layers section */}
      <div className="flex-1 overflow-hidden flex flex-col">
        <div className="p-4 pb-2">
          <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Capas
          </div>
        </div>
        
        <div className="flex-1 overflow-y-auto px-4 pb-4">
          <Reorder.Group axis="y" values={layers} onReorder={() => {}} className="space-y-2">
            {layers.map((layer) => (
              <LayerItem 
                key={layer.id} 
                layer={layer} 
                isSelected={selectedLayerId === layer.id}
              />
            ))}
          </Reorder.Group>
        </div>
      </div>

      {/* Properties panel */}
      <AnimatePresence>
        {selectedLayer && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="border-t border-border/30 overflow-hidden"
          >
            <div className="p-4 space-y-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Propiedades
              </div>

              {/* Position */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Posicion</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">X</label>
                    <div className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                      <input
                        type="number"
                        value={selectedLayer.position.x}
                        onChange={(e) => updateLayerPosition(selectedLayer.id, { 
                          ...selectedLayer.position, 
                          x: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Y</label>
                    <div className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                      <input
                        type="number"
                        value={selectedLayer.position.y}
                        onChange={(e) => updateLayerPosition(selectedLayer.id, { 
                          ...selectedLayer.position, 
                          y: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Size */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Tamano</div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Ancho</label>
                    <div className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                      <input
                        type="number"
                        value={selectedLayer.size.width}
                        onChange={(e) => updateLayerSize(selectedLayer.id, { 
                          ...selectedLayer.size, 
                          width: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                  <div className="flex-1">
                    <label className="text-xs text-muted-foreground">Alto</label>
                    <div className="flex items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                      <input
                        type="number"
                        value={selectedLayer.size.height}
                        onChange={(e) => updateLayerSize(selectedLayer.id, { 
                          ...selectedLayer.size, 
                          height: parseFloat(e.target.value) || 0 
                        })}
                        className="w-full bg-transparent text-sm outline-none"
                      />
                      <span className="text-xs text-muted-foreground">cm</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Rotation */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Rotacion</div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[selectedLayer.rotation]}
                    onValueChange={([value]) => updateLayerRotation(selectedLayer.id, value)}
                    min={0}
                    max={360}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex w-16 items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                    <input
                      type="number"
                      value={selectedLayer.rotation}
                      onChange={(e) => updateLayerRotation(selectedLayer.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="text-xs text-muted-foreground">°</span>
                  </div>
                </div>
              </div>

              {/* Alignment */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Alineacion</div>
                <div className="flex gap-2">
                  <AlignmentButton icon={AlignLeft} onClick={() => {}} />
                  <AlignmentButton icon={AlignStartVertical} onClick={() => {}} />
                  <AlignmentButton icon={AlignCenter} onClick={() => {}} />
                  <AlignmentButton icon={AlignCenterVertical} onClick={() => {}} />
                  <AlignmentButton icon={AlignEndVertical} onClick={() => {}} />
                  <AlignmentButton icon={AlignRight} onClick={() => {}} />
                </div>
              </div>

              {/* Opacity */}
              <div className="space-y-2">
                <div className="text-xs text-muted-foreground">Opacidad</div>
                <div className="flex items-center gap-3">
                  <Slider
                    value={[selectedLayer.opacity]}
                    onValueChange={([value]) => updateLayerOpacity(selectedLayer.id, value)}
                    min={0}
                    max={100}
                    step={1}
                    className="flex-1"
                  />
                  <div className="flex w-16 items-center gap-1 rounded-md bg-secondary/50 px-2 py-1.5">
                    <input
                      type="number"
                      value={selectedLayer.opacity}
                      onChange={(e) => updateLayerOpacity(selectedLayer.id, parseFloat(e.target.value) || 0)}
                      className="w-full bg-transparent text-sm outline-none"
                    />
                    <span className="text-xs text-muted-foreground">%</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
