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
import { isEditableElement } from './customizer-utils'

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

  return {
    productId: input.product?.id ?? null,
    productSlug: input.product?.slug ?? null,
    productName: input.product?.name ?? null,
    productVariantId: input.productVariantId,
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
    view: { mode: input.viewMode, angle: input.viewAngle },
    elements: editableElements.map(serializeElement),
    layers: input.layers,
    pricing,
    ...(input.previews ? { previews: input.previews } : {}),
  }
}
