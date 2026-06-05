import { isEditableElement } from '../lib/customizer-utils'
import type { Layer, LayerType } from '../types/customizer.types'
import {
  CUSTOMIZER_EMBROIDERY_PRICING_CENTS,
  CUSTOMIZER_PRICING_LABELS,
  CUSTOMIZER_PRICING_RULES_VERSION,
} from './customizer-pricing.constants'
import type { CustomizerPriceBreakdown, CustomizerPriceBreakdownItem } from './customizer-pricing.types'

export type CustomizerPricingElement = {
  id: string
  type: LayerType | string
  name?: string
  text?: string
  zone?: string
  visible?: boolean
  assetUrl?: string | null
  assetPublicId?: string | null
}

export type CalculateCustomizerPriceInput = {
  basePriceCents: number
  layers?: Layer[]
  elements?: CustomizerPricingElement[]
}

const CHEST_ZONE_KEYS = ['front-left-chest', 'front-right-chest', 'chest', 'pecho'] as const
const BACK_ZONE_KEYS = ['back-center', 'back', 'espalda'] as const

const LOGO_PLACEHOLDER_TEXT = '[logo]'

function normalizeZone(zone?: string): string {
  return (zone ?? 'general').trim().toLowerCase()
}

export function isChestZone(zone?: string): boolean {
  const value = normalizeZone(zone)
  return CHEST_ZONE_KEYS.some((key) => value === key || value.includes(key))
}

export function isBackZone(zone?: string): boolean {
  const value = normalizeZone(zone)
  return BACK_ZONE_KEYS.some((key) => value === key || value.includes(key))
}

function hasLogoAsset(element: CustomizerPricingElement): boolean {
  return Boolean(element.assetPublicId?.trim() || element.assetUrl?.trim())
}

function resolveAssetKey(element: CustomizerPricingElement): string | null {
  const publicId = element.assetPublicId?.trim()
  if (publicId) return `public:${publicId}`

  const assetUrl = element.assetUrl?.trim()
  if (assetUrl) return `url:${assetUrl}`

  const id = element.id?.trim()
  if (id) return `id:${id}`

  return null
}

function hasRealTextContent(element: CustomizerPricingElement): boolean {
  const text = element.text?.trim() ?? ''
  if (!text) return false
  if (text.toLowerCase() === LOGO_PLACEHOLDER_TEXT) return false
  return true
}

function isBillableTextElement(element: CustomizerPricingElement): boolean {
  if (element.visible === false) return false
  const type = element.type
  if (type !== 'text' && type !== 'patch') return false
  return hasRealTextContent(element)
}

function isBillableLogoElement(element: CustomizerPricingElement): boolean {
  if (element.visible === false) return false
  if (element.type !== 'logo') return false
  return hasLogoAsset(element)
}

function toPricingElements(input: CalculateCustomizerPriceInput): CustomizerPricingElement[] {
  if (input.elements?.length) {
    return input.elements
  }

  return (input.layers ?? [])
    .filter((layer) => isEditableElement(layer.type))
    .map((layer) => ({
      id: layer.id,
      type: layer.type,
      name: layer.name,
      text: layer.text,
      zone: layer.zone,
      visible: layer.visible,
      assetUrl: layer.assetUrl ?? null,
      assetPublicId: layer.assetPublicId ?? null,
    }))
}

function chestLogoAssetKeys(elements: CustomizerPricingElement[]): Set<string> {
  const keys = new Set<string>()
  for (const element of elements) {
    if (!isBillableLogoElement(element) || !isChestZone(element.zone)) continue
    const key = resolveAssetKey(element)
    if (key) keys.add(key)
  }
  return keys
}

function backLogoAmountCents(
  element: CustomizerPricingElement,
  chestAssets: Set<string>,
): { amountCents: number; label: string } {
  const assetKey = resolveAssetKey(element)
  const hasChestLogo = chestAssets.size > 0
  const sameAsChest = assetKey !== null && chestAssets.has(assetKey)

  if (hasChestLogo && sameAsChest) {
    return {
      amountCents: CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_SAME_AS_CHEST,
      label: CUSTOMIZER_PRICING_LABELS.BACK_LOGO_SAME_AS_CHEST,
    }
  }

  return {
    amountCents: CUSTOMIZER_EMBROIDERY_PRICING_CENTS.BACK_LOGO_PRIMARY_OR_NEW,
    label: CUSTOMIZER_PRICING_LABELS.BACK_LOGO,
  }
}

function logoAmountCents(
  element: CustomizerPricingElement,
  chestAssets: Set<string>,
): { amountCents: number; label: string } {
  if (isBackZone(element.zone)) {
    return backLogoAmountCents(element, chestAssets)
  }

  return {
    amountCents: CUSTOMIZER_EMBROIDERY_PRICING_CENTS.CHEST_LOGO,
    label: CUSTOMIZER_PRICING_LABELS.CHEST_LOGO,
  }
}

export function calculateCustomizerPrice(input: CalculateCustomizerPriceInput): CustomizerPriceBreakdown {
  const basePriceCents = Math.max(0, input.basePriceCents)
  const elements = toPricingElements(input)
  const chestAssets = chestLogoAssetKeys(elements)
  const items: CustomizerPriceBreakdownItem[] = []

  for (const element of elements) {
    if (isBillableTextElement(element)) {
      items.push({
        id: element.id,
        type: 'text',
        label: CUSTOMIZER_PRICING_LABELS.TEXT,
        zone: element.zone ?? 'general',
        amountCents: CUSTOMIZER_EMBROIDERY_PRICING_CENTS.TEXT,
      })
      continue
    }

    if (isBillableLogoElement(element)) {
      const { amountCents, label } = logoAmountCents(element, chestAssets)
      items.push({
        id: element.id,
        type: 'logo',
        label,
        zone: element.zone ?? 'general',
        amountCents,
        metadata: {
          assetKey: resolveAssetKey(element),
        },
      })
    }
  }

  const customizationPriceCents = items.reduce((sum, item) => sum + item.amountCents, 0)

  return {
    basePriceCents,
    customizationPriceCents,
    totalPriceCents: basePriceCents + customizationPriceCents,
    items,
    rulesVersion: CUSTOMIZER_PRICING_RULES_VERSION,
  }
}

export function calculateCustomizationFromConfigJson(
  configJson: unknown,
  basePriceCents: number,
): CustomizerPriceBreakdown {
  if (!configJson || typeof configJson !== 'object' || Array.isArray(configJson)) {
    return calculateCustomizerPrice({ basePriceCents, elements: [] })
  }

  const record = configJson as Record<string, unknown>
  const elements = Array.isArray(record.elements)
    ? (record.elements as CustomizerPricingElement[])
    : undefined
  const layers = Array.isArray(record.layers) ? (record.layers as Layer[]) : undefined

  return calculateCustomizerPrice({
    basePriceCents,
    elements,
    layers,
  })
}

export function buildPricingSnapshot(breakdown: CustomizerPriceBreakdown) {
  return {
    basePriceCents: breakdown.basePriceCents,
    customizationPriceCents: breakdown.customizationPriceCents,
    totalPriceCents: breakdown.totalPriceCents,
    items: breakdown.items,
    rulesVersion: breakdown.rulesVersion,
  }
}
