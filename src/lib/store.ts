import { create } from 'zustand'

export type CollarStyle = 'mao' | 'granjero' | 'clasico'
export type SleeveStyle = 'corta' | '3/4' | 'larga'
export type ButtonStyle = 'tradicional' | 'ocultos' | 'automaticos'
export type Size = 'XS' | 'S' | 'M' | 'L' | 'XL' | 'XXL'

export interface Layer {
  id: string
  name: string
  type: 'logo' | 'text' | 'patch' | 'vivos' | 'buttons' | 'base'
  visible: boolean
  locked: boolean
  position: { x: number; y: number }
  size: { width: number; height: number }
  rotation: number
  opacity: number
}

interface DesignerState {
  // Colors
  baseColor: string
  detailColor: string

  // Style options
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  buttonStyle: ButtonStyle
  size: Size

  // View
  viewMode: '2D' | '3D'
  viewAngle: 'front' | 'back'

  // Layers
  layers: Layer[]
  selectedLayerId: string | null

  // Actions
  setBaseColor: (color: string) => void
  setDetailColor: (color: string) => void
  setCollarStyle: (style: CollarStyle) => void
  setSleeveStyle: (style: SleeveStyle) => void
  setButtonStyle: (style: ButtonStyle) => void
  setSize: (size: Size) => void
  setViewMode: (mode: '2D' | '3D') => void
  setViewAngle: (angle: 'front' | 'back') => void
  selectLayer: (id: string | null) => void
  toggleLayerVisibility: (id: string) => void
  updateLayerPosition: (id: string, position: { x: number; y: number }) => void
  updateLayerSize: (id: string, size: { width: number; height: number }) => void
  updateLayerRotation: (id: string, rotation: number) => void
  updateLayerOpacity: (id: string, opacity: number) => void
  duplicateLayer: (id: string) => void
  deleteLayer: (id: string) => void
}

const defaultLayers: Layer[] = [
  {
    id: 'logo',
    name: 'Logotipo',
    type: 'logo',
    visible: true,
    locked: false,
    position: { x: 12.5, y: 8.3 },
    size: { width: 8.6, height: 8.6 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'name',
    name: 'Nombre',
    type: 'text',
    visible: true,
    locked: false,
    position: { x: 12.5, y: 18 },
    size: { width: 10, height: 2 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'vivos',
    name: 'Vivos',
    type: 'vivos',
    visible: true,
    locked: false,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'buttons',
    name: 'Botones',
    type: 'buttons',
    visible: true,
    locked: false,
    position: { x: 50, y: 50 },
    size: { width: 5, height: 30 },
    rotation: 0,
    opacity: 100,
  },
  {
    id: 'base',
    name: 'Base',
    type: 'base',
    visible: true,
    locked: true,
    position: { x: 0, y: 0 },
    size: { width: 100, height: 100 },
    rotation: 0,
    opacity: 100,
  },
]

export const useDesignerStore = create<DesignerState>((set) => ({
  // Initial state
  baseColor: '#FFFFFF',
  detailColor: '#1a1a1a',
  collarStyle: 'mao',
  sleeveStyle: '3/4',
  buttonStyle: 'tradicional',
  size: 'M',
  viewMode: '3D',
  viewAngle: 'front',
  layers: defaultLayers,
  selectedLayerId: 'logo',

  // Actions
  setBaseColor: (color) => set({ baseColor: color }),
  setDetailColor: (color) => set({ detailColor: color }),
  setCollarStyle: (style) => set({ collarStyle: style }),
  setSleeveStyle: (style) => set({ sleeveStyle: style }),
  setButtonStyle: (style) => set({ buttonStyle: style }),
  setSize: (size) => set({ size: size }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  selectLayer: (id) => set({ selectedLayerId: id }),
  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer,
      ),
    })),
  updateLayerPosition: (id, position) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, position } : layer)),
    })),
  updateLayerSize: (id, size) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, size } : layer)),
    })),
  updateLayerRotation: (id, rotation) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, rotation } : layer)),
    })),
  updateLayerOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, opacity } : layer)),
    })),
  duplicateLayer: (id) =>
    set((state) => {
      const layerToDuplicate = state.layers.find((l) => l.id === id)
      if (!layerToDuplicate || layerToDuplicate.type === 'base') return state
      const newLayer: Layer = {
        ...layerToDuplicate,
        id: `${layerToDuplicate.id}-${Date.now()}`,
        name: `${layerToDuplicate.name} (copia)`,
        position: {
          x: layerToDuplicate.position.x + 2,
          y: layerToDuplicate.position.y + 2,
        },
      }
      return {
        layers: [newLayer, ...state.layers],
        selectedLayerId: newLayer.id,
      }
    }),
  deleteLayer: (id) =>
    set((state) => {
      const layer = state.layers.find((l) => l.id === id)
      if (!layer || layer.type === 'base') return state
      return {
        layers: state.layers.filter((l) => l.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      }
    }),
}))
