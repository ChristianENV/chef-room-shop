import type {
  CustomizationArea,
  CustomizationOption,
  Prisma,
  Product,
  ProductCustomizationRule,
  ProductType,
} from '@prisma/client'

import type {
  AdminCustomizationAreaGql,
  AdminCustomizationOptionGql,
  AdminCustomizationProductGql,
  AdminCustomizationRuleGql,
  AdminCustomizationRuleInput,
} from './admin-customization.types'

export type RuleConfigJson = {
  priceCents?: number
  maxDimensionsCm?: { width?: number; height?: number }
  allowedFileTypes?: string[]
  pricePerCmCents?: number
  minQuantity?: number
  extraProductionDays?: number
  validationMessage?: string
  notes?: string
  metadata?: Record<string, unknown>
}

type RuleWithRelations = ProductCustomizationRule & {
  product: Product & { productType: ProductType }
  area: CustomizationArea
  option: CustomizationOption
}

/**
 * Parses stored configJson into a typed rule configuration object.
 */
export function parseRuleConfig(config: unknown): RuleConfigJson {
  if (!config || typeof config !== 'object' || Array.isArray(config)) {
    return {}
  }
  return config as RuleConfigJson
}

function parseAllowedFileTypes(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string')
}

/**
 * Default allowed file types by customization option slug (v1 heuristic).
 */
export function defaultAllowedFileTypesForOption(optionSlug: string): string[] {
  if (optionSlug === 'logo' || optionSlug === 'text' || optionSlug === 'patch') {
    return ['png', 'jpg', 'svg']
  }
  if (optionSlug === 'embroidery' || optionSlug === 'print') {
    return ['png', 'jpg', 'svg', 'pdf']
  }
  return ['png', 'jpg', 'svg']
}

/**
 * Builds Prisma configJson from admin rule input and option defaults.
 */
export function buildRuleConfigJson(
  input: AdminCustomizationRuleInput,
  option: CustomizationOption,
  existing?: RuleConfigJson,
): Prisma.InputJsonValue {
  const prev = existing ?? {}
  const basePriceCents =
    input.basePriceCents ?? prev.priceCents ?? option.priceCents
  const pricePerCmCents = input.pricePerCmCents ?? prev.pricePerCmCents ?? null
  const maxWidthCm = input.maxWidthCm ?? prev.maxDimensionsCm?.width ?? null
  const maxHeightCm = input.maxHeightCm ?? prev.maxDimensionsCm?.height ?? null

  const prevFileTypes = parseAllowedFileTypes(prev.allowedFileTypes)
  const allowedFileTypes =
    input.allowedFileTypes ??
    (prevFileTypes.length > 0
      ? prevFileTypes
      : defaultAllowedFileTypesForOption(option.slug))

  const config: RuleConfigJson = {
    priceCents: basePriceCents,
    pricePerCmCents: pricePerCmCents ?? undefined,
    maxDimensionsCm:
      maxWidthCm != null || maxHeightCm != null
        ? {
            width: maxWidthCm ?? undefined,
            height: maxHeightCm ?? undefined,
          }
        : prev.maxDimensionsCm,
    allowedFileTypes,
    minQuantity: input.minQuantity ?? prev.minQuantity,
    extraProductionDays: input.extraProductionDays ?? prev.extraProductionDays,
    validationMessage: input.validationMessage ?? prev.validationMessage,
    notes: input.notes ?? prev.notes,
    metadata:
      input.metadataJson != null
        ? input.metadataJson
        : prev.metadata,
  }

  return config as Prisma.InputJsonValue
}

/**
 * Maps a customization area row to the admin GraphQL shape.
 */
export function mapAdminCustomizationAreaToGql(
  area: CustomizationArea,
): AdminCustomizationAreaGql {
  return {
    id: area.id,
    slug: area.slug,
    name: area.nameEs,
    description: area.nameEn,
    sortOrder: area.sortOrder,
    isActive: true,
  }
}

/**
 * Maps a customization option row to the admin GraphQL shape.
 */
export function mapAdminCustomizationOptionToGql(
  option: CustomizationOption,
): AdminCustomizationOptionGql {
  return {
    id: option.id,
    slug: option.slug,
    name: option.nameEs,
    basePriceCents: option.priceCents,
    pricePerCmCents: null,
    isActive: true,
  }
}

/**
 * Maps a product row (with type) to the admin customization product shape.
 */
export function mapAdminCustomizationProductToGql(
  product: Product & { productType: ProductType },
): AdminCustomizationProductGql {
  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    productTypeName: product.productType.nameEs,
    status: product.status,
    customizable: product.customizable,
  }
}

/**
 * Maps a product customization rule with relations to the admin GraphQL shape.
 */
export function mapAdminCustomizationRuleToGql(
  rule: RuleWithRelations,
): AdminCustomizationRuleGql {
  const config = parseRuleConfig(rule.configJson)
  const basePriceCents = config.priceCents ?? rule.option.priceCents

  return {
    id: rule.id,
    productId: rule.productId,
    areaId: rule.areaId,
    optionId: rule.optionId,
    enabled: rule.isEnabled,
    maxWidthCm: config.maxDimensionsCm?.width ?? null,
    maxHeightCm: config.maxDimensionsCm?.height ?? null,
    minQuantity: config.minQuantity ?? null,
    basePriceCents,
    pricePerCmCents: config.pricePerCmCents ?? null,
    extraProductionDays: config.extraProductionDays ?? null,
    allowedFileTypes: parseAllowedFileTypes(config.allowedFileTypes),
    validationMessage: config.validationMessage ?? null,
    notes: config.notes ?? null,
    metadataJson: config.metadata ?? null,
    product: mapAdminCustomizationProductToGql(rule.product),
    area: mapAdminCustomizationAreaToGql(rule.area),
    option: {
      ...mapAdminCustomizationOptionToGql(rule.option),
      pricePerCmCents: config.pricePerCmCents ?? null,
    },
    createdAt: rule.createdAt.toISOString(),
    updatedAt: rule.updatedAt.toISOString(),
  }
}
