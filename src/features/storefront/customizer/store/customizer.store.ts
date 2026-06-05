import { create } from 'zustand'
import { STRUCTURAL_LAYERS } from '../lib/customizer-defaults'
import { isEditableElement } from '../lib/customizer-utils'
import {
  computeDefaultCustomizerVariant,
  findColorByHex,
  findSizeByLabel,
  resolveCustomizerVariant,
} from '../lib/resolve-customizer-variant'
import type { CustomizerProductData } from '../types/customizer-product.types'
import { calculateCustomizerPrice } from '../pricing/calculate-customizer-price'
import type { CustomizerPriceBreakdown } from '../pricing/customizer-pricing.types'
import type {
  ButtonStyle,
  CollarStyle,
  DesignTool,
  DesignZone,
  Layer,
  LayerPatch,
  Size,
  SleeveStyle,
  TextElementInput,
  ViewAngle,
  ViewMode,
  SaveStatus,
} from '../types/customizer.types'

type DesignSnapshot = {
  selectedVariantId: string | null
  baseColor: string
  detailColor: string
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  sleeveOption: string | null
  buttonStyle: ButtonStyle
  size: Size
  quantity: number
  layers: Layer[]
  selectedLayerId: string | null
  activeTool: DesignTool
}

type CustomizerState = DesignSnapshot & {
  product: CustomizerProductData | null
  selectedProductId: string | null
  selectedProductSlug: string | null
  selectedGarmentType: string | null
  viewMode: ViewMode
  viewAngle: ViewAngle
  captureInstant: boolean
  customizationRuleAvailability: Record<string, boolean>
  designId: string | null
  isDirty: boolean
  lastSavedAt: string | null
  saveStatus: SaveStatus
  past: DesignSnapshot[]
  future: DesignSnapshot[]
  initFromProduct: (product: CustomizerProductData) => void
  syncProductCatalog: (product: CustomizerProductData) => void
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
  setQuantity: (quantity: number) => void
  setCustomizationRuleAvailability: (key: string, enabled: boolean) => void
  setDesignId: (designId: string | null) => void
  setSaveStatus: (status: SaveStatus) => void
  setLastSavedAt: (iso: string | null) => void
  markDirty: (dirty?: boolean) => void
  setViewMode: (mode: ViewMode) => void
  setViewAngle: (angle: ViewAngle) => void
  setCaptureInstant: (value: boolean) => void
  selectLayer: (id: string | null) => void
  setActiveTool: (tool: DesignTool) => void
  toggleLayerVisibility: (id: string) => void
  updateLayer: (id: string, patch: LayerPatch) => void
  updateLayerPosition: (id: string, position: { x: number; y: number }) => void
  updateLayerSize: (id: string, size: { width: number; height: number }) => void
  updateLayerRotation: (id: string, rotation: number) => void
  updateLayerOpacity: (id: string, opacity: number) => void
  updateTextElement: (id: string, patch: LayerPatch) => void
  duplicateLayer: (id: string) => void
  deleteLayer: (id: string) => void
  addElement: (type: 'logo' | 'text' | 'patch', name?: string) => void
  addLogoElement: (input: {
    name?: string
    assetUrl: string
    assetPublicId: string
    zone?: DesignZone
  }) => void
  addTextElement: (input?: TextElementInput) => void
  addNameElement: (input?: Omit<TextElementInput, 'name'> & { zone?: DesignZone }) => void
  undo: () => void
  redo: () => void
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
  quantity: 1,
  viewMode: '3D' as ViewMode,
  viewAngle: 'front' as ViewAngle,
  captureInstant: false,
  layers: STRUCTURAL_LAYERS,
  selectedLayerId: null as string | null,
  activeTool: 'select' as DesignTool,
  customizationRuleAvailability: {} as Record<string, boolean>,
  designId: null as string | null,
  isDirty: false,
  lastSavedAt: null as string | null,
  saveStatus: 'idle' as SaveStatus,
  past: [] as DesignSnapshot[],
  future: [] as DesignSnapshot[],
}

const MAX_HISTORY = 50

function snapshot(state: CustomizerState): DesignSnapshot {
  return {
    selectedVariantId: state.selectedVariantId,
    baseColor: state.baseColor,
    detailColor: state.detailColor,
    collarStyle: state.collarStyle,
    sleeveStyle: state.sleeveStyle,
    sleeveOption: state.sleeveOption,
    buttonStyle: state.buttonStyle,
    size: state.size,
    quantity: state.quantity,
    layers: state.layers,
    selectedLayerId: state.selectedLayerId,
    activeTool: state.activeTool,
  }
}

function buildProductState(product: CustomizerProductData) {
  const firstVariant = computeDefaultCustomizerVariant(product)
  const firstColor =
    product.colors.find((color) => color.id === firstVariant?.colorId)?.hex ??
    product.colors[0]?.hex ??
    INITIAL_STATE.baseColor
  const firstSize =
    (product.sizes.find((size) => size.id === firstVariant?.sizeId)?.name ??
      product.sizes[0]?.name ??
      INITIAL_STATE.size) as Size

  const resolved = resolveCustomizerVariant(product, {
    baseColor: firstColor,
    size: firstSize,
  })

  return {
    product,
    selectedProductId: product.id,
    selectedProductSlug: product.slug,
    selectedGarmentType: product.productTypeSlug,
    selectedVariantId: resolved?.id ?? firstVariant?.id ?? null,
    baseColor: firstColor,
    detailColor: INITIAL_STATE.detailColor,
    collarStyle: INITIAL_STATE.collarStyle,
    sleeveStyle: INITIAL_STATE.sleeveStyle,
    sleeveOption: null,
    buttonStyle: INITIAL_STATE.buttonStyle,
    size: firstSize,
    quantity: 1,
    layers: STRUCTURAL_LAYERS,
    selectedLayerId: null as string | null,
    activeTool: 'select' as DesignTool,
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
    past: [] as DesignSnapshot[],
    future: [] as DesignSnapshot[],
  }
}

function createTextLayer(input?: TextElementInput): Layer {
  const id = `text-${Date.now()}`
  return {
    id,
    name: input?.name ?? 'Texto',
    type: 'text',
    visible: true,
    locked: false,
    position: input?.position ?? { x: 22, y: 28 },
    size: { width: 28, height: 8 },
    rotation: 0,
    opacity: 100,
    text: input?.text ?? '',
    fontSize: 18,
    textColor: '#FFFFFF',
    fontFamily: 'sans-serif',
    textAlign: 'center',
    zone: input?.zone ?? 'pecho',
  }
}

export const useCustomizerStore = create<CustomizerState>((set, get) => {
  const commitHistory = () => {
    const state = get()
    set({
      past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
      future: [],
    })
  }

  const patchLayer = (id: string, patch: LayerPatch, withHistory: boolean) => {
    if (withHistory) commitHistory()
    set((state) => ({
      layers: state.layers.map((layer) => (layer.id === id ? { ...layer, ...patch } : layer)),
      isDirty: true,
    }))
  }

  return {
    ...INITIAL_STATE,

    initFromProduct: (product) => set(() => buildProductState(product)),
    syncProductCatalog: (product) =>
      set((state) => {
        if (state.product?.id !== product.id) {
          return buildProductState(product)
        }

        const resolved = resolveCustomizerVariant(product, {
          baseColor: state.baseColor,
          size: state.size,
        })

        return {
          product,
          selectedVariantId: resolved?.id ?? state.selectedVariantId,
          customizationRuleAvailability: Object.fromEntries(
            product.customizationAvailability.map((item) => [
              `${item.areaSlug}:${item.optionSlug}`,
              item.enabled,
            ]),
          ),
        }
      }),
    setSelectedProduct: (product) => set(() => buildProductState(product)),
    resetDesignForProduct: (product) => set(() => buildProductState(product)),
    resetCustomizer: () => set(() => ({ ...INITIAL_STATE })),
    setSelectedVariant: (variantId) => set({ selectedVariantId: variantId }),

    setBaseColor: (color) => {
      commitHistory()
      set((state) => {
        if (!state.product) return { baseColor: color, isDirty: true }
        const matchedColor = findColorByHex(state.product.colors, color)
        const baseColor = matchedColor?.hex ?? color
        const resolved = resolveCustomizerVariant(state.product, {
          baseColor,
          size: state.size,
        })
        const nextSize =
          (state.product.sizes.find((size) => size.id === resolved?.sizeId)?.name ??
            state.size) as Size

        return {
          baseColor,
          selectedVariantId: resolved?.id ?? null,
          size: nextSize,
          isDirty: true,
        }
      })
    },
    setDetailColor: (color) => {
      commitHistory()
      set({ detailColor: color, isDirty: true })
    },
    setCollarStyle: (style) => {
      commitHistory()
      set({ collarStyle: style, isDirty: true })
    },
    setSleeveStyle: (style) => {
      commitHistory()
      set({ sleeveStyle: style, isDirty: true })
    },
    setSleeveOption: (option) => {
      commitHistory()
      set({ sleeveOption: option, isDirty: true })
    },
    setButtonStyle: (style) => {
      commitHistory()
      set({ buttonStyle: style, isDirty: true })
    },
    setSize: (size) => {
      commitHistory()
      set((state) => {
        if (!state.product) return { size: size as Size, isDirty: true }
        const matchedSize = findSizeByLabel(state.product.sizes, size)
        const nextSize = (matchedSize?.name ?? size) as Size
        const resolved = resolveCustomizerVariant(state.product, {
          baseColor: state.baseColor,
          size: nextSize,
        })

        return {
          size: nextSize,
          selectedVariantId: resolved?.id ?? null,
          isDirty: true,
        }
      })
    },
    setQuantity: (quantity) =>
      set({ quantity: Math.max(1, Math.min(99, Math.round(quantity))), isDirty: true }),
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
    setCaptureInstant: (value) => set({ captureInstant: value }),
    selectLayer: (id) => set({ selectedLayerId: id }),
    setActiveTool: (tool) => set({ activeTool: tool }),

    toggleLayerVisibility: (id) => {
      commitHistory()
      set((state) => ({
        layers: state.layers.map((layer) =>
          layer.id === id ? { ...layer, visible: !layer.visible } : layer,
        ),
        isDirty: true,
      }))
    },
    updateLayer: (id, patch) => patchLayer(id, patch, true),
    updateLayerPosition: (id, position) => patchLayer(id, { position }, true),
    updateLayerSize: (id, size) => patchLayer(id, { size }, true),
    updateLayerRotation: (id, rotation) => patchLayer(id, { rotation }, true),
    updateLayerOpacity: (id, opacity) => patchLayer(id, { opacity }, true),
    updateTextElement: (id, patch) => {
      const typingOnly = Object.keys(patch).length === 1 && 'text' in patch
      patchLayer(id, patch, !typingOnly)
    },

    duplicateLayer: (id) => {
      const layer = get().layers.find((item) => item.id === id)
      if (!layer || !isEditableElement(layer.type)) return
      commitHistory()
      set((state) => {
        const duplicate: Layer = {
          ...layer,
          id: `${layer.type}-${Date.now()}`,
          name: `${layer.name} (copia)`,
          position: { x: layer.position.x + 3, y: layer.position.y + 3 },
        }
        return {
          layers: [duplicate, ...state.layers],
          selectedLayerId: duplicate.id,
          isDirty: true,
        }
      })
    },
    deleteLayer: (id) => {
      const layer = get().layers.find((item) => item.id === id)
      if (!layer || !isEditableElement(layer.type)) return
      commitHistory()
      set((state) => ({
        layers: state.layers.filter((item) => item.id !== id),
        selectedLayerId: state.selectedLayerId === id ? null : state.selectedLayerId,
        isDirty: true,
      }))
    },
    addTextElement: (input) => {
      commitHistory()
      const layer = createTextLayer(input)
      set((state) => ({
        layers: [layer, ...state.layers],
        selectedLayerId: layer.id,
        activeTool: 'select',
        isDirty: true,
      }))
    },
    addNameElement: (input) => {
      commitHistory()
      const layer = createTextLayer({
        name: 'Nombre',
        text: input?.text ?? 'Nombre del chef',
        zone: input?.zone ?? 'pecho',
        position: input?.position ?? { x: 18, y: 32 },
      })
      set((state) => ({
        layers: [layer, ...state.layers],
        selectedLayerId: layer.id,
        activeTool: 'select',
        isDirty: true,
      }))
    },
    addElement: (type, name) => {
      commitHistory()
      set((state) => {
        const defaultName = type === 'logo' ? 'Logo' : type === 'patch' ? 'Bordado' : 'Texto'
        if (type === 'text') {
          const layer = createTextLayer({ name: name ?? defaultName })
          return {
            layers: [layer, ...state.layers],
            selectedLayerId: layer.id,
            activeTool: 'select',
            isDirty: true,
          }
        }
        const id = `${type}-${Date.now()}`
        const layer: Layer = {
          id,
          name: name ?? defaultName,
          type,
          visible: true,
          locked: false,
          position: { x: 12.5, y: 12 },
          size: { width: 8.6, height: 8.6 },
          rotation: 0,
          opacity: 100,
          text: type === 'logo' ? '[Logo]' : '',
          zone: 'pecho',
        }
        return {
          layers: [layer, ...state.layers],
          selectedLayerId: id,
          activeTool: 'select',
          isDirty: true,
        }
      })
    },
    addLogoElement: (input) => {
      commitHistory()
      const id = `logo-${Date.now()}`
      const layer: Layer = {
        id,
        name: input.name ?? 'Logotipo',
        type: 'logo',
        visible: true,
        locked: false,
        position: { x: 24, y: 30 },
        size: { width: 16, height: 16 },
        rotation: 0,
        opacity: 100,
        zone: input.zone ?? 'pecho',
        assetUrl: input.assetUrl,
        assetPublicId: input.assetPublicId,
        text: 'Logotipo',
      }
      set((state) => ({
        layers: [layer, ...state.layers],
        selectedLayerId: layer.id,
        activeTool: 'select',
        isDirty: true,
      }))
    },
    undo: () => {
      const state = get()
      if (state.past.length === 0) return
      const previous = state.past[state.past.length - 1]
      set({
        ...previous,
        past: state.past.slice(0, -1),
        future: [snapshot(state), ...state.future].slice(0, MAX_HISTORY),
        isDirty: true,
      })
    },
    redo: () => {
      const state = get()
      if (state.future.length === 0) return
      const next = state.future[0]
      set({
        ...next,
        past: [...state.past, snapshot(state)].slice(-MAX_HISTORY),
        future: state.future.slice(1),
        isDirty: true,
      })
    },
  }
})

export function selectCanUndo(state: CustomizerState): boolean {
  return state.past.length > 0
}

export function selectCanRedo(state: CustomizerState): boolean {
  return state.future.length > 0
}

let priceBreakdownCache: { key: string; value: CustomizerPriceBreakdown } | null = null

function pricingBreakdownCacheKey(state: CustomizerState): string {
  const basePriceCents = state.product?.basePriceCents ?? 0
  const layersKey = state.layers
    .filter((layer) => isEditableElement(layer.type))
    .map((layer) =>
      [
        layer.id,
        layer.type,
        layer.visible ? 1 : 0,
        layer.zone ?? '',
        layer.text ?? '',
        layer.assetPublicId ?? '',
        layer.assetUrl ?? '',
      ].join(':'),
    )
    .join('|')
  return `${basePriceCents}|${layersKey}`
}

export function selectPriceBreakdown(state: CustomizerState): CustomizerPriceBreakdown {
  const key = pricingBreakdownCacheKey(state)
  if (priceBreakdownCache?.key === key) {
    return priceBreakdownCache.value
  }

  const value = calculateCustomizerPrice({
    basePriceCents: state.product?.basePriceCents ?? 0,
    layers: state.layers,
  })
  priceBreakdownCache = { key, value }
  return value
}

export function selectCustomizationPriceCents(state: CustomizerState): number {
  return selectPriceBreakdown(state).customizationPriceCents
}

export function selectTotalPriceCents(state: CustomizerState): number {
  return selectPriceBreakdown(state).totalPriceCents
}
