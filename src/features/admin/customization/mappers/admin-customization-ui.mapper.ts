import { centsToPesos, formatCurrencyMXN } from '@/src/lib/formatters'

import type {
  AdminCustomizationArea,
  AdminCustomizationOption,
  AdminCustomizationPricingPreview,
  AdminCustomizationProduct,
  AdminCustomizationRule,
  AdminCustomizationRuleInput,
} from '../types'
import type {
  CustomizationAreaGroupUi,
  CustomizationRuleCardUi,
  GarmentMapType,
  GarmentZoneId,
  PricingPreviewUiState,
  ProductSelectOption,
  RuleFormValues,
  StatusBadgeVariant,
} from '../types/admin-customization-ui.types'

const AREA_SLUG_LABELS: Record<string, string> = {
  chest: 'Pecho',
  back: 'Espalda',
  'left-sleeve': 'Manga izquierda',
  'right-sleeve': 'Manga derecha',
  pocket: 'Bolsillo',
}

const OPTION_SLUG_LABELS: Record<string, string> = {
  embroidery: 'Bordado',
  print: 'Estampado',
  patch: 'Patch',
  logo: 'Logo',
  text: 'Texto',
}

const AREA_SLUG_TO_ZONE: Record<string, GarmentZoneId> = {
  chest: 'pecho',
  back: 'espalda',
  'left-sleeve': 'manga-izquierda',
  'right-sleeve': 'manga-derecha',
  pocket: 'bolsillo',
}

const ZONE_TO_AREA_SLUG: Partial<Record<GarmentZoneId, string>> = {
  pecho: 'chest',
  espalda: 'back',
  'manga-izquierda': 'left-sleeve',
  'manga-derecha': 'right-sleeve',
  bolsillo: 'pocket',
}

/**
 * Maps product type name/slug to garment map silhouette type.
 */
export function mapProductToGarmentMapType(product: AdminCustomizationProduct): GarmentMapType {
  const typeName = (product.productTypeName ?? '').toLowerCase()
  const slug = product.slug.toLowerCase()
  if (typeName.includes('mandil') || slug.includes('apron') || slug.includes('mandil')) {
    return 'mandiles'
  }
  if (typeName.includes('pantal') || slug.includes('pant')) {
    return 'pantalones'
  }
  return 'filipinas'
}

/**
 * Maps customization area slug to Spanish label.
 */
export function mapAdminCustomizationAreaToLabel(slug: string, name?: string): string {
  return AREA_SLUG_LABELS[slug] ?? name ?? slug
}

/**
 * Maps option slug to Spanish label.
 */
export function mapOptionSlugToLabel(slug: string, name?: string): string {
  return OPTION_SLUG_LABELS[slug] ?? name ?? slug
}

/**
 * Maps area slug to garment zone id for the visual map.
 */
export function mapAreaSlugToGarmentZone(areaSlug: string): GarmentZoneId | null {
  return AREA_SLUG_TO_ZONE[areaSlug] ?? null
}

/**
 * Maps garment zone id to BFF area slug.
 */
export function mapGarmentZoneToAreaSlug(zoneId: GarmentZoneId): string | null {
  return ZONE_TO_AREA_SLUG[zoneId] ?? null
}

/**
 * Maps enabled flag to status label and badge variant.
 */
export function mapRuleStatusToBadge(enabled: boolean): {
  label: string
  variant: StatusBadgeVariant
} {
  return enabled
    ? { label: 'Activa', variant: 'default' }
    : { label: 'Inactiva', variant: 'secondary' }
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

function formatDimensions(maxW: number | null, maxH: number | null): string | null {
  if (maxW == null && maxH == null) return null
  const w = maxW ?? 0
  const h = maxH ?? 0
  if (w <= 0 && h <= 0) return null
  return `Máx. ${w} × ${h} cm`
}

/**
 * Maps BFF product to select option for product selector.
 */
export function mapAdminCustomizationProductToOption(
  product: AdminCustomizationProduct,
): ProductSelectOption {
  return {
    value: product.id,
    label: product.name,
    product,
  }
}

/**
 * Maps BFF area to UI list item.
 */
export function mapAdminCustomizationAreaToUi(area: AdminCustomizationArea) {
  return {
    id: area.id,
    slug: area.slug,
    name: mapAdminCustomizationAreaToLabel(area.slug, area.name),
    garmentZoneId: mapAreaSlugToGarmentZone(area.slug),
    sortOrder: area.sortOrder,
  }
}

/**
 * Maps BFF option to UI list item.
 */
export function mapAdminCustomizationOptionToUi(option: AdminCustomizationOption) {
  return {
    id: option.id,
    slug: option.slug,
    name: mapOptionSlugToLabel(option.slug, option.name),
    basePricePesos: centsToPesos(option.basePriceCents),
    basePriceFormatted: formatCurrencyMXN(centsToPesos(option.basePriceCents)),
  }
}

/**
 * Maps a single BFF rule to card UI shape.
 */
export function mapAdminCustomizationRuleToCard(
  rule: AdminCustomizationRule,
): CustomizationRuleCardUi {
  const status = mapRuleStatusToBadge(rule.enabled)
  const basePricePesos = centsToPesos(rule.basePriceCents)
  const pricePerCmPesos = centsToPesos(rule.pricePerCmCents ?? 0)

  return {
    id: rule.id,
    productId: rule.productId,
    areaId: rule.areaId,
    areaSlug: rule.area.slug,
    areaName: mapAdminCustomizationAreaToLabel(rule.area.slug, rule.area.name),
    optionId: rule.optionId,
    optionSlug: rule.option.slug,
    optionName: mapOptionSlugToLabel(rule.option.slug, rule.option.name),
    enabled: rule.enabled,
    statusLabel: status.label,
    statusBadgeVariant: status.variant,
    maxWidthCm: rule.maxWidthCm,
    maxHeightCm: rule.maxHeightCm,
    dimensionsLabel: formatDimensions(rule.maxWidthCm, rule.maxHeightCm),
    basePricePesos,
    basePriceFormatted: formatCurrencyMXN(basePricePesos),
    pricePerCmPesos,
    pricePerCmFormatted: formatCurrencyMXN(pricePerCmPesos),
    extraProductionDays: rule.extraProductionDays ?? 0,
    allowedFileTypes: rule.allowedFileTypes ?? [],
    minQuantity: rule.minQuantity,
    validationMessage: rule.validationMessage,
    notes: rule.notes,
    updatedAtFormatted: formatDateTime(rule.updatedAt),
    rule,
  }
}

/**
 * Groups rules by area for zone cards.
 */
export function groupRulesByArea(
  rules: AdminCustomizationRule[],
  allAreas: AdminCustomizationArea[],
): CustomizationAreaGroupUi[] {
  const cards = rules.map(mapAdminCustomizationRuleToCard)
  const byAreaId = new Map<string, CustomizationRuleCardUi[]>()

  for (const card of cards) {
    const list = byAreaId.get(card.areaId) ?? []
    list.push(card)
    byAreaId.set(card.areaId, list)
  }

  const sortedAreas = [...allAreas].sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))

  return sortedAreas.map((area) => {
    const areaRules = byAreaId.get(area.id) ?? []
    const activeCount = areaRules.filter((r) => r.enabled).length
    const minPrice = areaRules.length > 0 ? Math.min(...areaRules.map((r) => r.basePricePesos)) : 0

    const maxW = areaRules.reduce<number | null>((acc, r) => {
      if (r.maxWidthCm == null) return acc
      return acc == null ? r.maxWidthCm : Math.max(acc, r.maxWidthCm)
    }, null)
    const maxH = areaRules.reduce<number | null>((acc, r) => {
      if (r.maxHeightCm == null) return acc
      return acc == null ? r.maxHeightCm : Math.max(acc, r.maxHeightCm)
    }, null)

    return {
      areaId: area.id,
      areaSlug: area.slug,
      garmentZoneId: mapAreaSlugToGarmentZone(area.slug),
      areaName: mapAdminCustomizationAreaToLabel(area.slug, area.name),
      rules: areaRules,
      ruleCount: areaRules.length,
      activeCount,
      minPriceFormatted: areaRules.length > 0 ? `Desde ${formatCurrencyMXN(minPrice)}` : '—',
      dimensionsSummary: formatDimensions(maxW, maxH),
      hasAnyEnabled: activeCount > 0,
      optionLabels: areaRules.map((r) => r.optionName),
    }
  })
}

/**
 * Maps BFF rule to form values (pesos in UI).
 */
export function mapAdminCustomizationRuleToFormValues(
  rule: AdminCustomizationRule | null,
  productId: string,
  defaults?: { areaId?: string; optionId?: string; optionBasePriceCents?: number },
): RuleFormValues {
  if (!rule) {
    const basePesos = defaults?.optionBasePriceCents
      ? centsToPesos(defaults.optionBasePriceCents)
      : 0
    return {
      productId,
      areaId: defaults?.areaId ?? '',
      optionId: defaults?.optionId ?? '',
      enabled: true,
      maxWidthCm: 8,
      maxHeightCm: 8,
      minQuantity: 1,
      basePricePesos: basePesos,
      pricePerCmPesos: 0,
      extraProductionDays: 0,
      allowedFileTypes: ['png', 'jpg', 'svg'],
      validationMessage: '',
      notes: '',
    }
  }

  return {
    productId: rule.productId,
    areaId: rule.areaId,
    optionId: rule.optionId,
    enabled: rule.enabled,
    maxWidthCm: rule.maxWidthCm ?? 0,
    maxHeightCm: rule.maxHeightCm ?? 0,
    minQuantity: rule.minQuantity ?? 1,
    basePricePesos: centsToPesos(rule.basePriceCents),
    pricePerCmPesos: centsToPesos(rule.pricePerCmCents ?? 0),
    extraProductionDays: rule.extraProductionDays ?? 0,
    allowedFileTypes:
      rule.allowedFileTypes.length > 0 ? rule.allowedFileTypes : ['png', 'jpg', 'svg'],
    validationMessage: rule.validationMessage ?? '',
    notes: rule.notes ?? '',
  }
}

/**
 * Maps form values to BFF mutation input (pesos → centavos).
 */
export function mapRuleFormValuesToInput(values: RuleFormValues): AdminCustomizationRuleInput {
  return {
    productId: values.productId,
    areaId: values.areaId,
    optionId: values.optionId,
    enabled: values.enabled,
    maxWidthCm: values.maxWidthCm > 0 ? values.maxWidthCm : null,
    maxHeightCm: values.maxHeightCm > 0 ? values.maxHeightCm : null,
    minQuantity: values.minQuantity >= 1 ? values.minQuantity : 1,
    basePriceCents: Math.round(values.basePricePesos * 100),
    pricePerCmCents: Math.round(values.pricePerCmPesos * 100),
    extraProductionDays: values.extraProductionDays,
    allowedFileTypes: values.allowedFileTypes,
    validationMessage: values.validationMessage.trim() || null,
    notes: values.notes.trim() || null,
  }
}

/**
 * Maps BFF pricing preview to UI display.
 */
export function mapPricingPreviewToUi(
  preview: AdminCustomizationPricingPreview,
  widthCm: number,
  heightCm: number,
): PricingPreviewUiState {
  return {
    basePriceFormatted: formatCurrencyMXN(centsToPesos(preview.basePriceCents)),
    areaPriceFormatted: formatCurrencyMXN(centsToPesos(preview.areaPriceCents)),
    sizeFactorFormatted: formatCurrencyMXN(centsToPesos(preview.sizeFactorCents)),
    totalExtraFormatted: formatCurrencyMXN(centsToPesos(preview.totalExtraCents)),
    extraProductionDays: preview.extraProductionDays,
    formulaLabel: preview.formulaLabel,
    sampleDimensions: `${widthCm} × ${heightCm} cm`,
  }
}

export { ZONE_TO_AREA_SLUG, AREA_SLUG_TO_ZONE }
