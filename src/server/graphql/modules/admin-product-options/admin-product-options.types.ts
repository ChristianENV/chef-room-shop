import type { ProductOptionInputType } from '@prisma/client'

// ────────────────────────────────────────────────────────────────────────────
// Query filters / inputs
// ────────────────────────────────────────────────────────────────────────────

export type GetAdminProductOptionGroupsInput = {
  productId?: string | null
  productTypeId?: string | null
  includeInactive?: boolean
}

export type GetAdminProductOptionGroupInput = {
  id: string
}

export type CreateAdminProductOptionGroupInput = {
  productId?: string | null
  productTypeId?: string | null
  slug: string
  name: string
  description?: string | null
  inputType: ProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  configJson?: any
}

export type UpdateAdminProductOptionGroupInput = {
  id: string
  slug?: string
  name?: string
  description?: string | null
  inputType?: ProductOptionInputType
  isRequired?: boolean
  isActive?: boolean
  sortOrder?: number
  configJson?: any
}

export type ArchiveAdminProductOptionGroupInput = {
  id: string
}

export type CreateAdminProductOptionValueInput = {
  optionGroupId: string
  slug: string
  label: string
  description?: string | null
  priceDeltaCents: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  configJson?: any
}

export type UpdateAdminProductOptionValueInput = {
  id: string
  slug?: string
  label?: string
  description?: string | null
  priceDeltaCents?: number
  isDefault?: boolean
  isActive?: boolean
  sortOrder?: number
  configJson?: any
}

export type ArchiveAdminProductOptionValueInput = {
  id: string
}

// ────────────────────────────────────────────────────────────────────────────
// GraphQL payload types
// ────────────────────────────────────────────────────────────────────────────

export type AdminProductOptionValueGql = {
  id: string
  optionGroupId: string
  slug: string
  label: string
  description: string | null
  priceDeltaCents: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  configJson: any
  createdAt: string
  updatedAt: string
}

export type AdminProductOptionGroupGql = {
  id: string
  productId: string | null
  productTypeId: string | null
  slug: string
  name: string
  description: string | null
  inputType: ProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  configJson: any
  values: AdminProductOptionValueGql[]
  createdAt: string
  updatedAt: string
}

export type AdminProductOptionGroupsPayloadGql = {
  groups: AdminProductOptionGroupGql[]
  total: number
}

export type AdminProductOptionGroupPayloadGql = {
  group: AdminProductOptionGroupGql
}

export type AdminProductOptionValuePayloadGql = {
  value: AdminProductOptionValueGql
}

export type ArchiveAdminProductOptionGroupPayloadGql = {
  success: boolean
  message: string
}

export type ArchiveAdminProductOptionValuePayloadGql = {
  success: boolean
  message: string
}
