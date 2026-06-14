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
import {
  buildPricingSnapshot,
  calculateCustomizerPrice,
} from '../pricing/calculate-customizer-price'
import { DEFAULT_FABRIC_COLORS, DETAIL_FABRIC_COLORS } from '../constants/fabric-colors'
import { isEditableElement } from './customizer-utils'
import { findColorByHex, findSizeByLabel, normalizeHex } from './resolve-customizer-variant'

export type DesignConfigInput = {
  product: CustomizerProductData | null
  productVariantId: string | null
  baseColor: string
  detailColor: string
  collarStyle: CollarStyle
  sleeveStyle: SleeveStyle
  sleeveOption: string | null
  buttonStyle: ButtonStyle
  size: Size
  quantity: number
  viewMode: ViewMode
  viewAngle: ViewAngle
  layers: Layer[]
  previews?: unknown
}

function lookupColorName(hex: string, product: CustomizerProductData | null): string | null {
  const fromCatalog = product ? findColorByHex(product.colors, hex) : null
  if (fromCatalog) return fromCatalog.name
  const normalized = normalizeHex(hex)
  const fromPalette =
    DEFAULT_FABRIC_COLORS.find((color) => normalizeHex(color.hex) === normalized) ??
    DETAIL_FABRIC_COLORS.find((color) => normalizeHex(color.hex) === normalized)
  return fromPalette?.name ?? null
}

function buildSelectedOptions(input: DesignConfigInput) {
  return {
    baseColor: input.baseColor,
    detailColor: input.detailColor,
    collarStyle: input.collarStyle,
    sleeveStyle: input.sleeveStyle,
    sleeveOption: input.sleeveOption,
    buttonStyle: input.buttonStyle,
    size: input.size,
    sizeLabel: String(input.size),
    quantity: input.quantity,
  }
}

function buildSelectionMeta(input: DesignConfigInput) {
  const color = input.product ? findColorByHex(input.product.colors, input.baseColor) : null
  const sizeRow = input.product ? findSizeByLabel(input.product.sizes, input.size) : null
  const fabricName = lookupColorName(input.baseColor, input.product)
  const detailName = lookupColorName(input.detailColor, input.product)

  return {
    selectedVariantId: input.productVariantId,
    selectedSize: {
      id: sizeRow?.id ?? null,
      name: sizeRow?.name ?? String(input.size),
      label: sizeRow?.name ?? String(input.size),
    },
    selectedColor: {
      id: color?.id ?? null,
      name: color?.name ?? fabricName,
      hex: color?.hex ?? input.baseColor,
      label: color?.name ?? fabricName,
    },
    fabricColor: {
      name: color?.name ?? fabricName,
      hex: color?.hex ?? input.baseColor,
    },
    detailColor: {
      name: detailName,
      hex: input.detailColor,
    },
    selectedOptions: buildSelectedOptions(input),
  }
}

function serializeElement(layer: Layer) {
  return {
    id: layer.id,
    type: layer.type,
    name: layer.name,
    text: layer.text ?? '',
    position: layer.position,
    size: layer.size,
    rotation: layer.rotation,
    opacity: layer.opacity,
    zone: layer.zone ?? 'general',
    visible: layer.visible,
    fontSize: layer.fontSize ?? 16,
    textColor: layer.textColor ?? '#FFFFFF',
    fontFamily: layer.fontFamily ?? 'sans-serif',
    textAlign: layer.textAlign ?? 'center',
    assetUrl: layer.assetUrl ?? null,
    assetPublicId: layer.assetPublicId ?? null,
  }
}

export function buildDesignConfigJson(input: DesignConfigInput): Record<string, unknown> {
  const editableElements = input.layers.filter((layer) => isEditableElement(layer.type))
  const basePriceCents = input.product?.basePriceCents ?? 0
  const pricing = buildPricingSnapshot(
    calculateCustomizerPrice({
      basePriceCents,
      layers: input.layers,
    }),
  )
  const selection = buildSelectionMeta(input)

  return {
    productId: input.product?.id ?? null,
    productSlug: input.product?.slug ?? null,
    productName: input.product?.name ?? null,
    productVariantId: input.productVariantId,
    selectedVariantId: selection.selectedVariantId,
    selectedProduct: input.product
      ? {
          id: input.product.id,
          slug: input.product.slug,
          name: input.product.name,
        }
      : null,
    style: {
      baseColor: input.baseColor,
      detailColor: input.detailColor,
      collarStyle: input.collarStyle,
      sleeveStyle: input.sleeveStyle,
      sleeveOption: input.sleeveOption,
      buttonStyle: input.buttonStyle,
      size: input.size,
      quantity: input.quantity,
    },
    selectedSize: selection.selectedSize,
    selectedColor: selection.selectedColor,
    fabricColor: selection.fabricColor,
    detailColor: selection.detailColor,
    selectedOptions: selection.selectedOptions,
    view: { mode: input.viewMode, angle: input.viewAngle },
    elements: editableElements.map(serializeElement),
    layers: input.layers,
    pricing,
    ...(input.previews ? { previews: input.previews } : {}),
  }
}
