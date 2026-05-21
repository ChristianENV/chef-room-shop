export type AdminCustomizationArea = {
  id: string
  slug: string
  name: string
  description: string | null
  sortOrder: number | null
  isActive: boolean
}

export type AdminCustomizationOption = {
  id: string
  slug: string
  name: string
  basePriceCents: number
  pricePerCmCents: number | null
  isActive: boolean
}

export type AdminCustomizationProduct = {
  id: string
  slug: string
  name: string
  productTypeName: string | null
  status: string
  customizable: boolean
}

export type AdminCustomizationRule = {
  id: string
  productId: string
  areaId: string
  optionId: string
  enabled: boolean
  maxWidthCm: number | null
  maxHeightCm: number | null
  minQuantity: number | null
  basePriceCents: number
  pricePerCmCents: number | null
  extraProductionDays: number | null
  allowedFileTypes: string[]
  validationMessage: string | null
  notes: string | null
  metadataJson: Record<string, unknown> | null
  product: AdminCustomizationProduct
  area: AdminCustomizationArea
  option: AdminCustomizationOption
  createdAt: string
  updatedAt: string
}

export type AdminCustomizationRulesPayload = {
  items: AdminCustomizationRule[]
  total: number
}

export type AdminCustomizationPricingPreview = {
  basePriceCents: number
  areaPriceCents: number
  sizeFactorCents: number
  extraProductionDays: number
  totalExtraCents: number
  formulaLabel: string
}

export type AdminCustomizationRulesFilterInput = {
  productId?: string | null
  productSlug?: string | null
  areaSlug?: string | null
  optionSlug?: string | null
  enabled?: boolean | null
  search?: string | null
}

export type AdminCustomizationRulesListVariables = {
  filter?: AdminCustomizationRulesFilterInput | null
  limit?: number | null
  offset?: number | null
}

export type AdminCustomizationRuleInput = {
  productId: string
  areaId: string
  optionId: string
  enabled?: boolean | null
  maxWidthCm?: number | null
  maxHeightCm?: number | null
  minQuantity?: number | null
  basePriceCents?: number | null
  pricePerCmCents?: number | null
  extraProductionDays?: number | null
  allowedFileTypes?: string[] | null
  validationMessage?: string | null
  notes?: string | null
  metadataJson?: Record<string, unknown> | null
}

export type DuplicateCustomizationRulesInput = {
  fromProductId: string
  toProductId: string
  overwriteExisting?: boolean | null
}

export type AdminCustomizationPricingPreviewInput = {
  productId: string
  areaId: string
  optionId: string
  widthCm?: number | null
  heightCm?: number | null
  quantity?: number | null
}

export type AdminCustomizationProductsVariables = {
  search?: string | null
  customizable?: boolean | null
}
