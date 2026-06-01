import { create } from 'zustand'
import { DEFAULT_LAYERS } from '../lib/customizer-defaults'
import type {
  ButtonStyle,
  CollarStyle,
  Layer,
  Size,
  SleeveStyle,
  ViewAngle,
  ViewMode,
} from '../types/customizer.types'

type CustomizerState = {
  baseColor: string
  detailColor: string
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  buttonStyle: ButtonStyle
  size: Size
  viewMode: ViewMode
  viewAngle: ViewAngle
  layers: Layer[]
  selectedLayerId: string | null
  setBaseColor: (color: string) => void
  setDetailColor: (color: string) => void
  setCollarStyle: (style: CollarStyle) => void
  setSleeveStyle: (style: SleeveStyle) => void
  setButtonStyle: (style: ButtonStyle) => void
  setSize: (size: Size) => void
  setViewMode: (mode: ViewMode) => void
  setViewAngle: (angle: ViewAngle) => void
  selectLayer: (id: string | null) => void
  toggleLayerVisibility: (id: string) => void
  updateLayerPosition: (id: string, position: { x: number; y: number }) => void
  updateLayerSize: (id: string, size: { width: number; height: number }) => void
  updateLayerRotation: (id: string, rotation: number) => void
  updateLayerOpacity: (id: string, opacity: number) => void
  duplicateLayer: (id: string) => void
  deleteLayer: (id: string) => void
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  baseColor: '#FFFFFF',
  detailColor: '#1a1a1a',
  collarStyle: 'mao',
  sleeveStyle: '3/4',
  buttonStyle: 'tradicional',
  size: 'M',
  viewMode: '3D',
  viewAngle: 'front',
  layers: DEFAULT_LAYERS,
  selectedLayerId: 'logo',

  setBaseColor: (color) => set({ baseColor: color }),
  setDetailColor: (color) => set({ detailColor: color }),
  setCollarStyle: (style) => set({ collarStyle: style }),
  setSleeveStyle: (style) => set({ sleeveStyle: style }),
  setButtonStyle: (style) => set({ buttonStyle: style }),
  setSize: (size) => set({ size }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  selectLayer: (id) => set({ selectedLayerId: id }),
  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
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
      const layer = state.layers.find((item) => item.id === id)
      if (!layer || layer.type === 'base') return state
      const duplicate: Layer = {
        ...layer,
        id: `${layer.id}-${Date.now()}`,
        name: `${layer.name} (copia)`,
        position: { x: layer.position.x + 2, y: layer.position.y + 2 },
      }
      return { layers: [duplicate, ...state.layers], selectedLayerId: duplicate.id }
    }),
  deleteLayer: (id) =>
    set((state) => {
      const layer = state.layers.find((item) => item.id === id)
      if (!layer || layer.type === 'base') return state
      return {
        layers: state.layers.filter((item) => item.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
      }
    }),
}))
