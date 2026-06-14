import type {
  CustomizationSnapshotData,
  FabricColorSnapshot,
  ProductSnapshotLike,
  SnapshotColor,
  SnapshotSize,
} from './customization-snapshot.types'

type DesignLike = {
  id: string
  previewUrl?: string | null
  configJson?: unknown
}

type VariantLike = {
  id: string
  color?: { id?: string; name?: string; hex?: string } | null
  size?: { id?: string; name?: string } | null
} | null

export type BuildCustomizationSnapshotInput = {
  design?: DesignLike | null
  configJson?: unknown
  variant?: VariantLike
  customizationPriceCents?: number | null
}

const EMPTY_SIZE: SnapshotSize = { id: null, name: null, label: null }
const EMPTY_COLOR: SnapshotColor = { id: null, name: null, hex: null, label: null }
const EMPTY_FABRIC: FabricColorSnapshot = { name: null, hex: null }

function parseRecord(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return {}
  return value as Record<string, unknown>
}

function parseString(value: unknown): string | null {
  return typeof value === 'string' && value.trim() ? value.trim() : null
}

function parseColorField(value: unknown): SnapshotColor {
  const record = parseRecord(value)
  return {
    id: parseString(record.id),
    name: parseString(record.name),
    hex: parseString(record.hex),
    label: parseString(record.label),
  }
}

function parseSizeField(value: unknown): SnapshotSize {
  const record = parseRecord(value)
  return {
    id: parseString(record.id),
    name: parseString(record.name),
    label: parseString(record.label ?? record.name),
  }
}

function parseFabricField(value: unknown): FabricColorSnapshot {
  const record = parseRecord(value)
  return {
    name: parseString(record.name),
    hex: parseString(record.hex),
  }
}

function parseStyle(config: Record<string, unknown>): Record<string, unknown> {
  const style = config.style
  return style && typeof style === 'object' && !Array.isArray(style)
    ? (style as Record<string, unknown>)
    : {}
}

function parseElements(config: Record<string, unknown>): Array<Record<string, unknown>> {
  if (!Array.isArray(config.elements)) return []
  return config.elements.filter(
    (element): element is Record<string, unknown> =>
      Boolean(element) && typeof element === 'object' && !Array.isArray(element),
  )
}

function buildSummaryFromElements(elements: Array<Record<string, unknown>>): string[] {
  const lines: string[] = []
  for (const element of elements) {
    if (element.type !== 'text') continue
    const text = parseString(element.text)
    if (text) lines.push(text)
  }
  return lines
}

function buildAreasFromElements(elements: Array<Record<string, unknown>>): string[] {
  const areaSet = new Set<string>()
  for (const element of elements) {
    const zone = parseString(element.zone)
    if (zone) areaSet.add(zone)
  }
  return Array.from(areaSet)
}

function hasElementType(elements: Array<Record<string, unknown>>, type: string): boolean {
  return elements.some((element) => element.type === type)
}

/** Reads normalized selection fields from a design configJson blob. */
export function extractSelectionFromConfigJson(configJson: unknown): {
  selectedVariantId: string | null
  selectedSize: SnapshotSize
  selectedColor: SnapshotColor
  fabricColor: FabricColorSnapshot
  detailColor: FabricColorSnapshot
  selectedOptions: Record<string, unknown>
  elements: Array<Record<string, unknown>>
  previewBackUrl: string | null
} {
  const config = parseRecord(configJson)
  const style = parseStyle(config)
  const elements = parseElements(config)

  const selectedSize = parseSizeField(config.selectedSize)
  const selectedColor = parseColorField(config.selectedColor)
  const fabricColor = parseFabricField(config.fabricColor)
  const detailColor = parseFabricField(config.detailColor)

  const styleSize = parseString(style.size)
  const styleBaseColor = parseString(style.baseColor)
  const styleDetailColor = parseString(style.detailColor)

  const resolvedSize: SnapshotSize =
    selectedSize.name || selectedSize.label
      ? selectedSize
      : styleSize
        ? { id: null, name: styleSize, label: styleSize }
        : EMPTY_SIZE

  const resolvedFabric: FabricColorSnapshot =
    fabricColor.hex || fabricColor.name
      ? fabricColor
      : styleBaseColor
        ? { name: selectedColor.name, hex: styleBaseColor }
        : selectedColor.hex || selectedColor.name
          ? { name: selectedColor.name, hex: selectedColor.hex }
          : EMPTY_FABRIC

  const resolvedDetail: FabricColorSnapshot =
    detailColor.hex || detailColor.name
      ? detailColor
      : styleDetailColor
        ? { name: detailColor.name, hex: styleDetailColor }
        : EMPTY_FABRIC

  const resolvedColor: SnapshotColor =
    selectedColor.hex || selectedColor.name
      ? { ...selectedColor, hex: selectedColor.hex ?? resolvedFabric.hex }
      : resolvedFabric.hex
        ? {
            id: null,
            name: resolvedFabric.name,
            hex: resolvedFabric.hex,
            label: resolvedFabric.name,
          }
        : EMPTY_COLOR

  const selectedOptions =
    config.selectedOptions && typeof config.selectedOptions === 'object' && !Array.isArray(config.selectedOptions)
      ? (config.selectedOptions as Record<string, unknown>)
      : { ...style }

  const previews = parseRecord(config.previews)
  const back = parseRecord(previews.back)
  const previewBackUrl = parseString(back.url)

  return {
    selectedVariantId:
      parseString(config.selectedVariantId) ?? parseString(config.productVariantId),
    selectedSize: resolvedSize,
    selectedColor: resolvedColor,
    fabricColor: resolvedFabric,
    detailColor: resolvedDetail,
    selectedOptions,
    elements,
    previewBackUrl,
  }
}

/** Builds the stable customization snapshot for cart/order persistence. */
export function buildCustomizationSnapshot(
  input: BuildCustomizationSnapshotInput,
): CustomizationSnapshotData {
  const configJson = input.configJson ?? input.design?.configJson
  const config = parseRecord(configJson)
  const selection = extractSelectionFromConfigJson(configJson)
  const elements = selection.elements
  const textElements = elements.filter((element) => element.type === 'text')

  const summaryFromConfig = Array.isArray(config.summary)
    ? config.summary.filter((line): line is string => typeof line === 'string')
    : []
  const summaryFromElements = buildSummaryFromElements(elements)
  const summary =
    summaryFromConfig.length > 0
      ? summaryFromConfig
      : summaryFromElements.length > 0
        ? summaryFromElements
        : input.design?.id
          ? []
          : []

  const areasFromConfig = Array.isArray(config.areas)
    ? config.areas.filter((area): area is string => typeof area === 'string')
    : []
  const areas = areasFromConfig.length > 0 ? areasFromConfig : buildAreasFromElements(elements)

  const variant = input.variant
  const variantSizeName = parseString(variant?.size?.name)
  const variantColorName = parseString(variant?.color?.name)
  const variantColorHex = parseString(variant?.color?.hex)

  const selectedSize: SnapshotSize = {
    id: selection.selectedSize.id ?? parseString(variant?.size?.id) ?? null,
    name: selection.selectedSize.name ?? variantSizeName,
    label: selection.selectedSize.label ?? selection.selectedSize.name ?? variantSizeName,
  }

  const selectedColor: SnapshotColor = {
    id: selection.selectedColor.id ?? parseString(variant?.color?.id) ?? null,
    name: selection.selectedColor.name ?? variantColorName ?? selection.fabricColor.name,
    hex: selection.selectedColor.hex ?? variantColorHex ?? selection.fabricColor.hex,
    label:
      selection.selectedColor.label ??
      selection.selectedColor.name ??
      variantColorName ??
      selection.fabricColor.name,
  }

  const fabricColor: FabricColorSnapshot = {
    name: selection.fabricColor.name ?? selectedColor.name,
    hex: selection.fabricColor.hex ?? selectedColor.hex,
  }

  const pricing = parseRecord(config.pricing)
  const customizationPriceCents =
    input.customizationPriceCents ??
    (typeof pricing.customizationPriceCents === 'number'
      ? pricing.customizationPriceCents
      : null)

  return {
    designId: input.design?.id ?? null,
    previewUrl: input.design?.previewUrl ?? null,
    previewBackUrl: selection.previewBackUrl,
    selectedVariantId: selection.selectedVariantId ?? variant?.id ?? null,
    selectedSize,
    selectedColor,
    fabricColor,
    detailColor: selection.detailColor,
    elements,
    selectedOptions: selection.selectedOptions,
    customizationPriceCents,
    summary,
    areas,
    hasLogo: Boolean(config.hasLogo) || hasElementType(elements, 'logo'),
    hasEmbroidery: Boolean(config.hasEmbroidery) || hasElementType(elements, 'patch'),
    embroideredName: parseString(config.embroideredName),
  }
}

/** Fills missing product snapshot color/size from configJson when variant data is absent. */
export function enrichProductSnapshotWithConfig(
  snapshot: ProductSnapshotLike,
  configJson: unknown,
): ProductSnapshotLike {
  const selection = extractSelectionFromConfigJson(configJson)

  return {
    ...snapshot,
    variantId: snapshot.variantId ?? selection.selectedVariantId,
    sizeName:
      snapshot.sizeName ??
      selection.selectedSize.label ??
      selection.selectedSize.name ??
      null,
    colorName:
      snapshot.colorName ??
      selection.fabricColor.name ??
      selection.selectedColor.name ??
      null,
    colorHex:
      snapshot.colorHex ??
      selection.fabricColor.hex ??
      selection.selectedColor.hex ??
      null,
  }
}

/** One-line personalization summary for cart UI. */
export function buildCustomizationSummaryLine(snapshot: CustomizationSnapshotData): string | null {
  const textElements = snapshot.elements.filter((element) => element.type === 'text')
  const texts = textElements
    .map((element) => parseString(element.text))
    .filter((value): value is string => Boolean(value))

  if (texts.length > 0) {
    const zone = parseString(textElements[0]?.zone)
    return zone ? `Texto en ${zone}` : `Texto: ${texts[0]}`
  }
  if (snapshot.hasLogo) return 'Logo incluido'
  if (snapshot.hasEmbroidery) return 'Bordado incluido'
  if (snapshot.summary.length > 0) return snapshot.summary[0] ?? null
  return null
}
