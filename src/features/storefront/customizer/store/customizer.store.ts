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
  SaveStatus,
} from '../types/customizer.types'

type CustomizerState = {
  product: CustomizerProductData | null
  selectedProductId: string | null
  selectedProductSlug: string | null
  selectedGarmentType: string | null
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
  designId: string | null
  isDirty: boolean
  lastSavedAt: string | null
  saveStatus: SaveStatus
  initFromProduct: (product: CustomizerProductData) => void
  setSelectedProduct: (product: CustomizerProductData) => void
  resetDesignForProduct: (product: CustomizerProductData) => void
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
  setDesignId: (designId: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setLastSavedAt: (iso: string | null) => void
  markDirty: (dirty?: boolean) => void
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
  selectedProductId: null,
  selectedProductSlug: null,
  selectedGarmentType: null,
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
  designId: null,
  isDirty: false,
  lastSavedAt: null,
  saveStatus: 'idle' as SaveStatus,
}

function computeFirstVariant(product: CustomizerProductData) {
  return (
    product.variants.find((variant) => variant.isActive && variant.stockQty > 0) ??
    product.variants.find((variant) => variant.isActive) ??
    product.variants[0] ??
    null
  )
}

function buildProductState(product: CustomizerProductData) {
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
    selectedProductId: product.id,
    selectedProductSlug: product.slug,
    selectedGarmentType: product.productTypeSlug,
    selectedVariantId: firstVariant?.id ?? null,
    baseColor: firstColor,
    detailColor: INITIAL_STATE.detailColor,
    collarStyle: INITIAL_STATE.collarStyle,
    sleeveStyle: INITIAL_STATE.sleeveStyle,
    sleeveOption: null,
    buttonStyle: INITIAL_STATE.buttonStyle,
    size: (firstSize as Size) ?? INITIAL_STATE.size,
    layers: DEFAULT_LAYERS,
    selectedLayerId: 'logo',
    customizationRuleAvailability: Object.fromEntries(
      product.customizationAvailability.map((item) => [
        `${item.areaSlug}:${item.optionSlug}`,
        item.enabled,
      ]),
    ),
    designId: null,
    isDirty: false,
    lastSavedAt: null,
    saveStatus: 'idle' as SaveStatus,
  }
}

export const useCustomizerStore = create<CustomizerState>((set) => ({
  ...INITIAL_STATE,

  initFromProduct: (product) => set(() => buildProductState(product)),
  setSelectedProduct: (product) => set(() => buildProductState(product)),
  resetDesignForProduct: (product) => set(() => buildProductState(product)),
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
        isDirty: true,
      }
    }),
  setDetailColor: (color) => set({ detailColor: color, isDirty: true }),
  setCollarStyle: (style) => set({ collarStyle: style, isDirty: true }),
  setSleeveStyle: (style) => set({ sleeveStyle: style, isDirty: true }),
  setSleeveOption: (option) => set({ sleeveOption: option, isDirty: true }),
  setButtonStyle: (style) => set({ buttonStyle: style, isDirty: true }),
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
        isDirty: true,
      }
    }),
  setCustomizationRuleAvailability: (key, enabled) =>
    set((state) => ({
      customizationRuleAvailability: {
        ...state.customizationRuleAvailability,
        [key]: enabled,
      },
      isDirty: true,
    })),
  setDesignId: (designId) => set({ designId }),
  setSaveStatus: (saveStatus) => set({ saveStatus }),
  setLastSavedAt: (lastSavedAt) => set({ lastSavedAt }),
  markDirty: (dirty = true) => set({ isDirty: dirty }),
  setViewMode: (mode) => set({ viewMode: mode }),
  setViewAngle: (angle) => set({ viewAngle: angle }),
  selectLayer: (id) => set({ selectedLayerId: id }),
  toggleLayerVisibility: (id) =>
    set((state) => ({
      layers: state.layers.map((layer) =>
        layer.id === id ? { ...layer, visible: !layer.visible } : layer
      ),
      isDirty: true,
    })),
  updateLayerPosition: (id, position) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, position } : layer)),
      isDirty: true,
    })),
  updateLayerSize: (id, size) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, size } : layer)),
      isDirty: true,
    })),
  updateLayerRotation: (id, rotation) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, rotation } : layer)),
      isDirty: true,
    })),
  updateLayerOpacity: (id, opacity) =>
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, opacity } : layer)),
      isDirty: true,
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
      return {
        layers: [duplicate, ...state.layers],
        selectedLayerId: duplicate.id,
        isDirty: true,
      }
    }),
  deleteLayer: (id) =>
    set((state) => {
      const layer = state.layers.find((item) => item.id === id)
      if (!layer || layer.type === 'base') return state
      return {
        layers: state.layers.filter((item) => item.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        isDirty: true,
      }
    }),
}))
