import type { ProductOptionInputType } from '@prisma/client'

/**
 * Client-safe commercial option selection (PDP / add-to-cart input).
 * Distinct from customizer `selectedOptions` in design snapshots.
 */
export type ProductOptionSelectionInput = {
  groupId?: string
  groupSlug?: string
  valueId?: string
  valueSlug?: string
}

/**
 * Immutable commercial option snapshot stored on cart/order lines.
 * Prisma persists these in `selectedOptionsJson` on CartItem / OrderItem.
 */
export type ProductOptionSnapshot = {
  groupId: string
  groupSlug: string
  groupName: string
  valueId: string
  valueSlug: string
  valueLabel: string
  priceDeltaCents: number
}

export type ProductOptionValueRecord = {
  id: string
  optionGroupId: string
  slug: string
  label: string
  description?: string | null
  priceDeltaCents: number
  isDefault: boolean
  isActive: boolean
  sortOrder: number
  configJson?: unknown
}

export type ProductOptionGroupWithValues = {
  id: string
  productId: string | null
  productTypeId: string | null
  slug: string
  name: string
  description?: string | null
  inputType: ProductOptionInputType
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  configJson?: unknown
  values: ProductOptionValueRecord[]
}

/**
 * Optional metadata on option groups/values for future dependency rules
 * (e.g. embroidery position visible only when embroidery is selected).
 */
export type ProductOptionGroupConfig = {
  dependsOnGroupSlug?: string
  dependsOnValueSlug?: string
  [key: string]: unknown
}

export type ValidatedProductOptionSelection = {
  group: ProductOptionGroupWithValues
  value: ProductOptionValueRecord
  fromDefault: boolean
}

export type ProductOptionsValidationSuccess = {
  ok: true
  validatedSelections: ValidatedProductOptionSelection[]
  commercialOptionsSnapshots: ProductOptionSnapshot[]
}

export type ProductOptionsValidationFailure = {
  ok: false
  error: string
  code:
    | 'UNKNOWN_GROUP'
    | 'INACTIVE_GROUP'
    | 'GROUP_NOT_APPLICABLE'
    | 'DUPLICATE_GROUP'
    | 'MISSING_GROUP_REFERENCE'
    | 'MISSING_VALUE_REFERENCE'
    | 'UNKNOWN_VALUE'
    | 'INACTIVE_VALUE'
    | 'VALUE_NOT_IN_GROUP'
    | 'REQUIRED_GROUP_MISSING'
    | 'DEPENDENT_GROUP_DISABLED'
}

export type ProductOptionsValidationResult =
  | ProductOptionsValidationSuccess
  | ProductOptionsValidationFailure

export type ValidateSelectedProductOptionsInput = {
  productId: string
  productTypeId: string
  optionGroups: ProductOptionGroupWithValues[]
  selectedCommercialOptions: ProductOptionSelectionInput[]
}
