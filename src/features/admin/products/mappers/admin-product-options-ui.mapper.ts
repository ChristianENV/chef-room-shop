import { centsToPesos } from '@/src/lib/formatters'
import { GraphQLRequestError } from '@/src/lib/graphql/errors'

import type {
  AdminProductOptionGroup,
  AdminProductOptionScope,
  AdminProductOptionValue,
  CreateAdminProductOptionGroupInput,
  CreateAdminProductOptionValueInput,
  ProductOptionGroupFormValues,
  ProductOptionValueFormValues,
  UpdateAdminProductOptionGroupInput,
  UpdateAdminProductOptionValueInput,
} from '../types/admin-product-options.types'

export const KEBAB_CASE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export const PRODUCT_OPTION_INPUT_TYPE_LABELS = {
  SINGLE_SELECT: 'Selección única',
  BOOLEAN: 'Sí / No',
} as const

export function slugifyProductOptionLabel(label: string): string {
  return label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

export function mapProductOptionGroupToFormValues(
  group: AdminProductOptionGroup | null,
  sortOrderFallback = 0,
): ProductOptionGroupFormValues {
  if (!group) {
    return {
      name: '',
      slug: '',
      description: '',
      inputType: 'SINGLE_SELECT',
      isRequired: false,
      isActive: true,
      sortOrder: sortOrderFallback,
    }
  }

  return {
    name: group.name,
    slug: group.slug,
    description: group.description ?? '',
    inputType: group.inputType,
    isRequired: group.isRequired,
    isActive: group.isActive,
    sortOrder: group.sortOrder,
  }
}

export function mapProductOptionValueToFormValues(
  value: AdminProductOptionValue | null,
  sortOrderFallback = 0,
): ProductOptionValueFormValues {
  if (!value) {
    return {
      label: '',
      slug: '',
      description: '',
      priceDeltaPesos: 0,
      isDefault: false,
      isActive: true,
      sortOrder: sortOrderFallback,
    }
  }

  return {
    label: value.label,
    slug: value.slug,
    description: value.description ?? '',
    priceDeltaPesos: centsToPesos(value.priceDeltaCents),
    isDefault: value.isDefault,
    isActive: value.isActive,
    sortOrder: value.sortOrder,
  }
}

export function mapGroupFormValuesToCreateInputForScope(
  scope: AdminProductOptionScope,
  values: ProductOptionGroupFormValues,
): CreateAdminProductOptionGroupInput {
  const base: CreateAdminProductOptionGroupInput = {
    slug: values.slug.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    inputType: values.inputType,
    isRequired: values.isRequired,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  }

  if (scope.kind === 'product') {
    return { ...base, productId: scope.productId }
  }

  return { ...base, productTypeId: scope.productTypeId }
}

export function mapGroupFormValuesToCreateInput(
  productId: string,
  values: ProductOptionGroupFormValues,
): CreateAdminProductOptionGroupInput {
  return mapGroupFormValuesToCreateInputForScope({ kind: 'product', productId }, values)
}

export function mapGroupFormValuesToUpdateInput(
  groupId: string,
  values: ProductOptionGroupFormValues,
): UpdateAdminProductOptionGroupInput {
  return {
    id: groupId,
    slug: values.slug.trim(),
    name: values.name.trim(),
    description: values.description.trim() || null,
    inputType: values.inputType,
    isRequired: values.isRequired,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  }
}

export function mapValueFormValuesToCreateInput(
  optionGroupId: string,
  values: ProductOptionValueFormValues,
): CreateAdminProductOptionValueInput {
  return {
    optionGroupId,
    slug: values.slug.trim(),
    label: values.label.trim(),
    description: values.description.trim() || null,
    priceDeltaCents: Math.round(values.priceDeltaPesos * 100),
    isDefault: values.isDefault,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  }
}

export function mapValueFormValuesToUpdateInput(
  valueId: string,
  values: ProductOptionValueFormValues,
): UpdateAdminProductOptionValueInput {
  return {
    id: valueId,
    slug: values.slug.trim(),
    label: values.label.trim(),
    description: values.description.trim() || null,
    priceDeltaCents: Math.round(values.priceDeltaPesos * 100),
    isDefault: values.isDefault,
    isActive: values.isActive,
    sortOrder: values.sortOrder,
  }
}

export function validateProductOptionGroupFormValues(
  values: ProductOptionGroupFormValues,
): string | null {
  if (!values.name.trim()) return 'El nombre del grupo es obligatorio.'
  if (!values.slug.trim()) return 'El slug del grupo es obligatorio.'
  if (!KEBAB_CASE_SLUG_REGEX.test(values.slug.trim())) {
    return 'El slug debe estar en minúsculas y formato kebab-case.'
  }
  if (!values.inputType) return 'Selecciona un tipo de entrada.'
  if (values.sortOrder < 0) return 'El orden debe ser mayor o igual a 0.'
  return null
}

export function validateProductOptionValueFormValues(
  values: ProductOptionValueFormValues,
): string | null {
  if (!values.label.trim()) return 'La etiqueta del valor es obligatoria.'
  if (!values.slug.trim()) return 'El slug del valor es obligatorio.'
  if (!KEBAB_CASE_SLUG_REGEX.test(values.slug.trim())) {
    return 'El slug debe estar en minúsculas y formato kebab-case.'
  }
  if (values.priceDeltaPesos < 0) return 'El precio adicional no puede ser negativo.'
  if (values.sortOrder < 0) return 'El orden debe ser mayor o igual a 0.'
  return null
}

export function mapAdminProductOptionMutationError(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    const message = error.errors[0]?.message?.trim()
    if (message) return message
  }

  if (error instanceof Error) {
    const message = error.message
    if (message.includes('slug')) return 'Ya existe un slug igual en este producto o grupo.'
    if (message.includes('Price delta')) return 'El precio adicional no puede ser negativo.'
    if (message.includes('default')) {
      return 'Solo puede haber un valor predeterminado por grupo.'
    }
    return message
  }

  return 'No pudimos guardar la opción comercial.'
}
