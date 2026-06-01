import { create } from 'zustand'
import { DEFAULT_LAYERS } from '../lib/customizer-defaults'
import type { CustomizerProductData } from '../types/customizer-product.types'
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
  product: CustomizerProductData | null
  selectedVariantId: string | null
  baseColor: string
  detailColor: string
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  sleeveOption: string | null
  buttonStyle: ButtonStyle
  size: Size
  viewMode: ViewMode
  viewAngle: ViewAngle
  layers: Layer[]
  selectedLayerId: string | null
  customizationRuleAvailability: Record<string, boolean>
  initFromProduct: (product: CustomizerProductData) => void
  resetCustomizer: () => void
  setSelectedVariant: (variantId: string | null) => void
  setBaseColor: (color: string) => void
  setDetailColor: (color: string) => void
  setCollarStyle: (style: CollarStyle) => void
  setSleeveStyle: (style: SleeveStyle) => void
  setSleeveOption: (option: string | null) => void
  setButtonStyle: (style: ButtonStyle) => void
  setSize: (size: Size) => void
  setCustomizationRuleAvailability: (key: string, enabled: boolean) => void
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

const INITIAL_STATE = {
  product: null,
  selectedVariantId: null,
  baseColor: '#FFFFFF',
  detailColor: '#1a1a1a',
  collarStyle: 'mao' as CollarStyle,
  sleeveStyle: '3/4' as SleeveStyle,
  sleeveOption: null,
  buttonStyle: 'tradicional' as ButtonStyle,
  size: 'M' as Size,
  viewMode: '3D' as ViewMode,
  viewAngle: 'front' as ViewAngle,
  layers: DEFAULT_LAYERS,
  selectedLayerId: 'logo',
  customizationRuleAvailability: {},
}

function computeFirstVariant(product: CustomizerProductData) {
  return (
    product.variants.find((variant) => variant.isActive && variant.stockQty > 0) ??
    product.variants.find((variant) => variant.isActive) ??
    product.variants[0] ??
    null
  )
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  ...INITIAL_STATE,

  initFromProduct: (product) =>
    set(() => {
      const firstVariant = computeFirstVariant(product)
      const firstColor =
        product.colors.find((color) => color.id === firstVariant?.colorId)?.hex ??
        product.colors[0]?.hex ??
        INITIAL_STATE.baseColor
      const firstSize =
        product.sizes.find((size) => size.id === firstVariant?.sizeId)?.name ??
        product.sizes[0]?.name ??
        INITIAL_STATE.size

      return {
        product,
        selectedVariantId: firstVariant?.id ?? null,
        baseColor: firstColor,
        size: (firstSize as Size) ?? INITIAL_STATE.size,
        customizationRuleAvailability: Object.fromEntries(
          product.customizationAvailability.map((item) => [
            `${item.areaSlug}:${item.optionSlug}`,
            item.enabled,
          ]),
        ),
      }
    }),
  resetCustomizer: () => set(() => ({ ...INITIAL_STATE })),
  setSelectedVariant: (variantId) => set({ selectedVariantId: variantId }),

  setBaseColor: (color) =>
    set((state) => {
      if (!state.product) return { baseColor: color }
      const selectedColor = state.product.colors.find((item) => item.hex === color)
      const matchingVariant =
        state.product.variants.find(
          (variant) =>
            variant.colorId === selectedColor?.id &&
            variant.sizeId === state.product?.sizes.find((size) => size.name === state.size)?.id &&
            variant.isActive,
        ) ??
        state.product.variants.find(
          (variant) => variant.colorId === selectedColor?.id && variant.isActive,
        ) ??
        null
      const nextSize =
        state.product.sizes.find((size) => size.id === matchingVariant?.sizeId)?.name ?? state.size

      return {
        baseColor: color,
        selectedVariantId: matchingVariant?.id ?? state.selectedVariantId,
        size: nextSize as Size,
      }
    }),
  setDetailColor: (color) => set({ detailColor: color }),
  setCollarStyle: (style) => set({ collarStyle: style }),
  setSleeveStyle: (style) => set({ sleeveStyle: style }),
  setSleeveOption: (option) => set({ sleeveOption: option }),
  setButtonStyle: (style) => set({ buttonStyle: style }),
  setSize: (size) =>
    set((state) => {
      if (!state.product) return { size }
      const selectedColorId =
        state.product.colors.find((color) => color.hex === state.baseColor)?.id ?? null
      const nextVariant =
        state.product.variants.find(
          (variant) =>
            variant.sizeId === state.product?.sizes.find((item) => item.name === size)?.id &&
            variant.colorId === selectedColorId &&
            variant.isActive,
        ) ??
        state.product.variants.find(
          (variant) =>
            variant.sizeId === state.product?.sizes.find((item) => item.name === size)?.id &&
            variant.isActive,
        ) ??
        null

      return {
        size,
        selectedVariantId: nextVariant?.id ?? state.selectedVariantId,
      }
    }),
  setCustomizationRuleAvailability: (key, enabled) =>
    set((state) => ({
      customizationRuleAvailability: {
        ...state.customizationRuleAvailability,
        [key]: enabled,
      },
    })),
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
