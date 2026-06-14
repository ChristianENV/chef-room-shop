import { extractSelectionFromConfigJson } from '@/src/lib/customization/build-customization-snapshot'
import { STRUCTURAL_LAYERS } from './customizer-defaults'
import { isEditableElement } from './customizer-utils'
import { findColorByHex, findSizeByLabel, resolveCustomizerVariant } from './resolve-customizer-variant'
import type { CustomizerProductData } from '../types/customizer-product.types'
import type {
  ButtonStyle,
  CollarStyle,
  DesignTool,
  Layer,
  Size,
  SleeveStyle,
  ViewAngle,
  ViewMode,
} from '../types/customizer.types'

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseNumber(value: unknown, fallback: number): number {
  return typeof value === 'number' && Number.isFinite(value) ? value : fallback
}

function parseStyleField<T extends string>(
  value: unknown,
  allowed: readonly T[],
  fallback: T,
): T {
  return typeof value === 'string' && (allowed as readonly string[]).includes(value)
    ? (value as T)
    : fallback
}

const COLLAR_STYLES = ['mao', 'granjero', 'clasico'] as const
const SLEEVE_STYLES = ['corta', '3/4', 'larga'] as const
const BUTTON_STYLES = ['tradicional', 'ocultos', 'automaticos'] as const
const SIZES = ['XS', 'S', 'M', 'L', 'XL', 'XXL'] as const
const VIEW_MODES = ['2D', '3D'] as const
const VIEW_ANGLES = ['front', 'back'] as const
const TEXT_ALIGNS = ['left', 'center', 'right'] as const
const LAYER_TYPES = ['logo', 'text', 'patch', 'vivos', 'buttons', 'base'] as const

function parseLayer(value: unknown): Layer | null {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return null
  const record = value as Record<string, unknown>
  const id = parseString(record.id)
  const name = parseString(record.name)
  const type = parseStyleField(record.type, LAYER_TYPES, 'text')
  if (!id || !name) return null

  const position = parseRecord(record.position)
  const size = parseRecord(record.size)

  return {
    id,
    name,
    type,
    visible: record.visible !== false,
    locked: record.locked === true,
    position: {
      x: parseNumber(position.x, 0),
      y: parseNumber(position.y, 0),
    },
    size: {
      width: parseNumber(size.width, 10),
      height: parseNumber(size.height, 10),
    },
    rotation: parseNumber(record.rotation, 0),
    opacity: parseNumber(record.opacity, 100),
    text: parseString(record.text) ?? undefined,
    fontSize: parseNumber(record.fontSize, 16),
    textColor: parseString(record.textColor) ?? undefined,
    fontFamily: parseString(record.fontFamily) ?? undefined,
    textAlign: parseStyleField(record.textAlign, TEXT_ALIGNS, 'center'),
    zone: (parseString(record.zone) as Layer['zone']) ?? undefined,
    assetUrl: parseString(record.assetUrl) ?? undefined,
    assetPublicId: parseString(record.assetPublicId) ?? undefined,
  }
}

function parseLayers(config: Record<string, unknown>): Layer[] {
  if (Array.isArray(config.layers)) {
    const parsed = config.layers
      .map(parseLayer)
      .filter((layer): layer is Layer => layer != null)
    if (parsed.length > 0) return parsed
  }

  const editable = Array.isArray(config.elements)
    ? config.elements
        .map(parseLayer)
        .filter((layer): layer is Layer => layer != null && isEditableElement(layer.type))
    : []

  return [...editable, ...STRUCTURAL_LAYERS]
}

export type ParsedDesignConfig = {
  productSlug: string | null
  selectedVariantId: string | null
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
  selectedLayerId: string | null
  activeTool: DesignTool
}

export function resolveDesignProductSlug(
  configJson: unknown,
  product: { slug: string } | null | undefined,
): string | null {
  const config = parseRecord(configJson)
  return parseString(config.productSlug) ?? product?.slug ?? null
}

/** Parses a persisted design configJson into customizer store fields. */
export function parseDesignConfigForHydration(
  configJson: unknown,
  product: CustomizerProductData,
): ParsedDesignConfig {
  const config = parseRecord(configJson)
  const style = parseRecord(config.style)
  const selection = extractSelectionFromConfigJson(configJson)
  const view = parseRecord(config.view)

  const styleBaseColor = parseString(style.baseColor)
  const styleDetailColor = parseString(style.detailColor)
  const styleSize = parseString(style.size)

  const baseColor =
    selection.fabricColor.hex ??
    selection.selectedColor.hex ??
    styleBaseColor ??
    product.colors[0]?.hex ??
    '#FFFFFF'

  const matchedColor = findColorByHex(product.colors, baseColor)
  const resolvedBaseColor = matchedColor?.hex ?? baseColor

  const sizeLabel =
    selection.selectedSize.name ??
    selection.selectedSize.label ??
    styleSize ??
    product.sizes[0]?.name ??
    'M'

  const matchedSize = findSizeByLabel(product.sizes, sizeLabel)
  const size = parseStyleField(matchedSize?.name ?? sizeLabel, SIZES, 'M')

  const resolvedVariant = resolveCustomizerVariant(product, {
    baseColor: resolvedBaseColor,
    size,
  })

  const layers = parseLayers(config)
  const selectedLayerId =
    layers.find((layer) => isEditableElement(layer.type) && layer.visible)?.id ?? null

  return {
    productSlug: resolveDesignProductSlug(configJson, product),
    selectedVariantId:
      selection.selectedVariantId ?? resolvedVariant?.id ?? null,
    baseColor: resolvedBaseColor,
    detailColor:
      selection.detailColor.hex ??
      styleDetailColor ??
      '#1a1a1a',
    collarStyle: parseStyleField(style.collarStyle, COLLAR_STYLES, 'mao'),
    sleeveStyle: parseStyleField(style.sleeveStyle, SLEEVE_STYLES, '3/4'),
    sleeveOption: parseString(style.sleeveOption),
    buttonStyle: parseStyleField(style.buttonStyle, BUTTON_STYLES, 'tradicional'),
    size,
    quantity: Math.max(1, Math.min(99, Math.round(parseNumber(style.quantity, 1)))),
    viewMode: parseStyleField(view.mode, VIEW_MODES, '3D'),
    viewAngle: parseStyleField(view.angle, VIEW_ANGLES, 'front'),
    layers,
    selectedLayerId,
    activeTool: 'select',
  }
}
