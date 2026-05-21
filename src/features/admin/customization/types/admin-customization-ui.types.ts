import type { AdminCustomizationProduct, AdminCustomizationRule } from '../types'

export type GarmentMapType = 'filipinas' | 'mandiles' | 'pantalones'

export type GarmentZoneId =
  | 'pecho'
  | 'espalda'
  | 'manga-izquierda'
  | 'manga-derecha'
  | 'bolsillo'
  | 'cuello'

export type StatusBadgeVariant = 'default' | 'secondary' | 'outline'

export type ProductSelectOption = {
  value: string
  label: string
  product: AdminCustomizationProduct
}

export type CustomizationRuleCardUi = {
  id: string
  productId: string
  areaId: string
  areaSlug: string
  areaName: string
  optionId: string
  optionSlug: string
  optionName: string
  enabled: boolean
  statusLabel: string
  statusBadgeVariant: StatusBadgeVariant
  maxWidthCm: number | null
  maxHeightCm: number | null
  dimensionsLabel: string | null
  basePricePesos: number
  basePriceFormatted: string
  pricePerCmPesos: number
  pricePerCmFormatted: string
  extraProductionDays: number
  allowedFileTypes: string[]
  minQuantity: number | null
  validationMessage: string | null
  notes: string | null
  updatedAtFormatted: string
  rule: AdminCustomizationRule
}

export type CustomizationAreaGroupUi = {
  areaId: string
  areaSlug: string
  garmentZoneId: GarmentZoneId | null
  areaName: string
  rules: CustomizationRuleCardUi[]
  ruleCount: number
  activeCount: number
  minPriceFormatted: string
  dimensionsSummary: string | null
  hasAnyEnabled: boolean
  optionLabels: string[]
}

export type RuleFormValues = {
  productId: string
  areaId: string
  optionId: string
  enabled: boolean
  maxWidthCm: number
  maxHeightCm: number
  minQuantity: number
  basePricePesos: number
  pricePerCmPesos: number
  extraProductionDays: number
  allowedFileTypes: string[]
  validationMessage: string
  notes: string
}

export type PricingPreviewUiState = {
  basePriceFormatted: string
  areaPriceFormatted: string
  sizeFactorFormatted: string
  totalExtraFormatted: string
  extraProductionDays: number
  formulaLabel: string
  sampleDimensions: string
}

export const KNOWN_FILE_TYPES = ['png', 'jpg', 'jpeg', 'svg', 'pdf'] as const

export type KnownFileType = (typeof KNOWN_FILE_TYPES)[number]
