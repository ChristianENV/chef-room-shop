import { isEditableElement } from './customizer-utils'
import type { CustomizerProductData } from '../types/customizer-product.types'
import type {
  ButtonStyle,
  CollarStyle,
  Layer,
  Size,
  SleeveStyle,
} from '../types/customizer.types'
import {
  computeDefaultCustomizerVariant,
  findColorByHex,
  findSizeByLabel,
  resolveCustomizerVariant,
} from './resolve-customizer-variant'
import { STRUCTURAL_LAYERS } from './customizer-defaults'

export type CustomizerBaseline = {
  selectedVariantId: string | null
  baseColor: string
  detailColor: string
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  sleeveOption: string | null
  buttonStyle: ButtonStyle
  size: Size
  layers: Layer[]
}

export type CustomizerIntentState = CustomizerBaseline & {
  layers: Layer[]
}

function editableLayers(layers: Layer[]): Layer[] {
  return layers.filter((layer) => isEditableElement(layer.type))
}

function layerSignature(layer: Layer): string {
  return [
    layer.id,
    layer.type,
    layer.text ?? '',
    layer.assetPublicId ?? '',
    layer.assetUrl ?? '',
    layer.zone ?? '',
    layer.visible ? '1' : '0',
  ].join(':')
}

/** Default product customization baseline used to detect meaningful edits. */
export function buildCustomizerBaseline(product: CustomizerProductData): CustomizerBaseline {
  const firstVariant = computeDefaultCustomizerVariant(product)
  const firstColor =
    product.colors.find((color) => color.id === firstVariant?.colorId)?.hex ??
    product.colors[0]?.hex ??
    '#FFFFFF'
  const firstSize =
    (product.sizes.find((size) => size.id === firstVariant?.sizeId)?.name ??
      product.sizes[0]?.name ??
      'M') as Size

  const resolved = resolveCustomizerVariant(product, {
    baseColor: firstColor,
    size: firstSize,
  })

  return {
    selectedVariantId: resolved?.id ?? firstVariant?.id ?? null,
    baseColor: findColorByHex(product.colors, firstColor)?.hex ?? firstColor,
    detailColor: '#1a1a1a',
    collarStyle: 'mao',
    sleeveStyle: '3/4',
    sleeveOption: null,
    buttonStyle: 'tradicional',
    size: (findSizeByLabel(product.sizes, firstSize)?.name ?? firstSize) as Size,
    layers: STRUCTURAL_LAYERS,
  }
}

/** True when the user changed something beyond the product defaults. */
export function hasMeaningfulCustomization(
  current: CustomizerIntentState,
  baseline: CustomizerBaseline,
): boolean {
  if (current.baseColor !== baseline.baseColor) return true
  if (current.detailColor !== baseline.detailColor) return true
  if (current.size !== baseline.size) return true
  if (current.collarStyle !== baseline.collarStyle) return true
  if (current.sleeveStyle !== baseline.sleeveStyle) return true
  if (current.sleeveOption !== baseline.sleeveOption) return true
  if (current.buttonStyle !== baseline.buttonStyle) return true

  const currentEditable = editableLayers(current.layers)
  const baselineEditable = editableLayers(baseline.layers)

  if (currentEditable.length > baselineEditable.length) return true

  const baselineById = new Map(baselineEditable.map((layer) => [layer.id, layer]))
  for (const layer of currentEditable) {
    const previous = baselineById.get(layer.id)
    if (!previous) return true
    if (layerSignature(layer) !== layerSignature(previous)) return true
  }

  return false
}

export function shouldCreateDesignInDatabase(params: {
  isAuthenticated: boolean
  force: boolean
  interactionCount: number
  meaningful: boolean
}): boolean {
  if (params.force) return true
  if (!params.isAuthenticated) return false
  return params.meaningful || params.interactionCount >= 2
}

export function shouldUpdateExistingDesign(params: {
  isAuthenticated: boolean
  force: boolean
  isDirty: boolean
  interactionCount: number
  meaningful: boolean
}): boolean {
  if (params.force) return true
  if (!params.isAuthenticated || !params.isDirty) return false
  return params.meaningful || params.interactionCount >= 1
}

export function shouldAutosaveDraft(params: {
  isDirty: boolean
  interactionCount: number
  meaningful: boolean
}): boolean {
  if (!params.isDirty) return false
  return params.meaningful || params.interactionCount >= 2
}
