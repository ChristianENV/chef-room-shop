export type AdminProductOptionInputType = 'SINGLE_SELECT' | 'BOOLEAN'

export type AdminProductOptionScope =
  | { kind: 'product'; productId: string }
  | { kind: 'productType'; productTypeId: string }

export type AdminProductOptionValue = {
  id: string
  optionGroupId: string
  slug: string
  label: string
  description: string | null
  priceDeltaCents: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  createdAt: string
  updatedAt: string
}

export type AdminProductOptionGroup = {
  id: string
  productId: string | null
  productTypeId: string | null
  slug: string
  name: string
  description: string | null
  inputType: AdminProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  values: AdminProductOptionValue[]
  createdAt: string
  updatedAt: string
}

export type AdminProductOptionGroupsPayload = {
  groups: AdminProductOptionGroup[]
  total: number
}

export type GetAdminProductOptionGroupsInput = {
  productId?: string | null
  productTypeId?: string | null
  includeInactive?: boolean
}

export type CreateAdminProductOptionGroupInput = {
  productId?: string | null
  productTypeId?: string | null
  slug: string
  name: string
  description?: string | null
  inputType: AdminProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
}

export type UpdateAdminProductOptionGroupInput = {
  id: string
  slug?: string
  name?: string
  description?: string | null
  inputType?: AdminProductOptionInputType
  isRequired?: boolean
  isActive?: boolean
  sortOrder?: number
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
}

export type ArchiveAdminProductOptionGroupInput = {
  id: string
}

export type ArchiveAdminProductOptionValueInput = {
  id: string
}

export type ArchiveAdminProductOptionPayload = {
  success: boolean
  message: string
}

export type ProductOptionGroupFormValues = {
  name: string
  slug: string
  description: string
  inputType: AdminProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
}

export type ProductOptionValueFormValues = {
  label: string
  slug: string
  description: string
  priceDeltaPesos: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
}
