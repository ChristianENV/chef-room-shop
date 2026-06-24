import { GraphQLRequestError } from '@/src/lib/graphql/errors'

import type {
  CreateAdminProductTypeInput,
  AdminProductType,
  UpdateAdminProductTypeInput,
} from '../types'
import type {
  AdminCategoryTableRow,
  CategoryFormFieldErrors,
  CategoryFormValues,
} from '../types/admin-product-types-ui.types'

export const KEBAB_CASE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

const SLUG_ERROR =
  'El slug debe estar en minúsculas y formato kebab-case (ej. chef-jacket, zapatos).'
const SHOP_SLUG_ERROR =
  'El slug de tienda debe estar en minúsculas y formato kebab-case (ej. filipinas, zapatos).'

export function mapProductTypeStatusLabel(isActive: boolean): string {
  return isActive ? 'Activa' : 'Inactiva'
}

export function mapProductTypeNavLabel(showInNav: boolean): string {
  return showInNav ? 'Sí' : 'No'
}

export function mapAdminProductTypeToTableRow(
  productType: AdminProductType,
): AdminCategoryTableRow {
  return {
    id: productType.id,
    name: productType.nameEs,
    slug: productType.slug,
    shopSlug: productType.shopSlug,
    shopSlugLabel: productType.shopSlug ?? '—',
    productCount: productType.productCount,
    activeProductCount: productType.activeProductCount,
    showInNav: productType.showInNav,
    showInNavLabel: mapProductTypeNavLabel(productType.showInNav),
    isActive: productType.isActive,
    statusLabel: mapProductTypeStatusLabel(productType.isActive),
    sortOrder: productType.sortOrder,
    sortOrderLabel:
      productType.sortOrder === null || productType.sortOrder === undefined
        ? '—'
        : String(productType.sortOrder),
  }
}

export function resolveNextCategorySortOrder(productTypes: AdminProductType[]): number {
  if (productTypes.length === 0) return 0
  const maxSort = productTypes.reduce((max, type) => {
    const value = type.sortOrder ?? 0
    return value > max ? value : max
  }, 0)
  return maxSort + 10
}

export function mapAdminProductTypeToFormValues(productType: AdminProductType): CategoryFormValues {
  return {
    nameEs: productType.nameEs,
    nameEn: productType.nameEn ?? '',
    slug: productType.slug,
    shopSlug: productType.shopSlug ?? '',
    description: productType.description ?? '',
    sortOrder: productType.sortOrder ?? 0,
    isActive: productType.isActive,
    showInNav: productType.showInNav,
  }
}

export function buildDefaultCategoryFormValues(
  productTypes: AdminProductType[],
): CategoryFormValues {
  return {
    nameEs: '',
    nameEn: '',
    slug: '',
    shopSlug: '',
    description: '',
    sortOrder: resolveNextCategorySortOrder(productTypes),
    isActive: true,
    showInNav: true,
  }
}

function normalizeOptionalText(value: string): string | null {
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function validateCategoryFormValues(
  values: CategoryFormValues,
): { success: true } | { success: false; errors: CategoryFormFieldErrors } {
  const errors: CategoryFormFieldErrors = {}

  if (!values.nameEs.trim()) {
    errors.nameEs = 'El nombre en español es requerido.'
  }

  if (!values.slug.trim()) {
    errors.slug = 'El slug es requerido.'
  } else if (!KEBAB_CASE_SLUG_REGEX.test(values.slug.trim())) {
    errors.slug = SLUG_ERROR
  }

  const shopSlug = values.shopSlug.trim()
  if (shopSlug && !KEBAB_CASE_SLUG_REGEX.test(shopSlug)) {
    errors.shopSlug = SHOP_SLUG_ERROR
  }

  if (!Number.isFinite(values.sortOrder) || values.sortOrder < 0) {
    errors.sortOrder = 'El orden debe ser un número entero mayor o igual a 0.'
  }

  if (Object.keys(errors).length > 0) {
    return { success: false, errors }
  }

  return { success: true }
}

export function mapCategoryFormValuesToCreateInput(
  values: CategoryFormValues,
): CreateAdminProductTypeInput {
  return {
    slug: values.slug.trim(),
    shopSlug: normalizeOptionalText(values.shopSlug),
    nameEs: values.nameEs.trim(),
    nameEn: normalizeOptionalText(values.nameEn),
    description: normalizeOptionalText(values.description),
    sortOrder: Math.trunc(values.sortOrder),
    isActive: values.isActive,
    showInNav: values.showInNav,
  }
}

export function mapCategoryFormValuesToUpdateInput(
  values: CategoryFormValues,
): UpdateAdminProductTypeInput {
  return {
    slug: values.slug.trim(),
    shopSlug: normalizeOptionalText(values.shopSlug),
    nameEs: values.nameEs.trim(),
    nameEn: normalizeOptionalText(values.nameEn),
    description: normalizeOptionalText(values.description),
    sortOrder: Math.trunc(values.sortOrder),
    isActive: values.isActive,
    showInNav: values.showInNav,
  }
}

export function mapAdminProductTypeMutationError(error: unknown): string {
  if (error instanceof GraphQLRequestError) {
    return error.message
  }

  if (error instanceof Error && error.message) {
    return error.message
  }

  return 'No pudimos completar la acción. Intenta de nuevo.'
}
