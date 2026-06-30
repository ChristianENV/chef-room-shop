import { buildProductOptionSnapshots } from './product-options.snapshot'
import type {
  ProductOptionGroupWithValues,
  ProductOptionSelectionInput,
  ProductOptionValueRecord,
  ProductOptionsValidationFailure,
  ProductOptionsValidationResult,
  ValidateSelectedProductOptionsInput,
} from './product-options.types'

function fail(
  code: ProductOptionsValidationFailure['code'],
  error: string,
): ProductOptionsValidationFailure {
  return { ok: false, code, error }
}

function groupAppliesToProduct(
  group: ProductOptionGroupWithValues,
  productId: string,
  productTypeId: string,
): boolean {
  if (group.productId != null) {
    return group.productId === productId
  }
  if (group.productTypeId != null) {
    return group.productTypeId === productTypeId
  }
  return false
}

function findGroupByReference(
  optionGroups: ProductOptionGroupWithValues[],
  selection: ProductOptionSelectionInput,
): ProductOptionGroupWithValues | null {
  if (selection.groupId) {
    return optionGroups.find((group) => group.id === selection.groupId) ?? null
  }
  if (selection.groupSlug) {
    return optionGroups.find((group) => group.slug === selection.groupSlug) ?? null
  }
  return null
}

function findValueInGroup(
  group: ProductOptionGroupWithValues,
  selection: ProductOptionSelectionInput,
): ProductOptionValueRecord | null {
  if (selection.valueId) {
    return group.values.find((value) => value.id === selection.valueId) ?? null
  }
  if (selection.valueSlug) {
    return group.values.find((value) => value.slug === selection.valueSlug) ?? null
  }
  return null
}

function getDefaultActiveValue(group: ProductOptionGroupWithValues): ProductOptionValueRecord | null {
  const defaults = group.values.filter((value) => value.isDefault && value.isActive)
  if (defaults.length === 0) return null
  return defaults.sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null
}

/**
 * Resolve active commercial option groups for a product, merging product-level
 * groups over product-type groups when slugs collide (catalog BFF parity).
 */
export function resolveApplicableProductOptionGroups({
  productId,
  productTypeId,
  optionGroups,
}: {
  productId: string
  productTypeId: string
  optionGroups: ProductOptionGroupWithValues[]
}): ProductOptionGroupWithValues[] {
  const applicable = optionGroups.filter(
    (group) => group.isActive && groupAppliesToProduct(group, productId, productTypeId),
  )

  const productGroups = applicable.filter((group) => group.productId === productId)
  const productTypeGroups = applicable.filter(
    (group) => group.productTypeId === productTypeId && group.productId == null,
  )

  return [
    ...productGroups,
    ...productTypeGroups.filter(
      (typeGroup) => !productGroups.some((productGroup) => productGroup.slug === typeGroup.slug),
    ),
  ].sort((a, b) => a.sortOrder - b.sortOrder)
}

/**
 * Validate commercial product option selections against server-known groups/values.
 * Applies defaults, enforces required groups, and never trusts client price data.
 */
export function validateSelectedProductOptions(
  input: ValidateSelectedProductOptionsInput,
): ProductOptionsValidationResult {
  const { productId, productTypeId, optionGroups, selectedCommercialOptions } = input

  const applicableGroups = resolveApplicableProductOptionGroups({
    productId,
    productTypeId,
    optionGroups,
  })

  if (applicableGroups.length === 0 && selectedCommercialOptions.length === 0) {
    return {
      ok: true,
      validatedSelections: [],
      commercialOptionsSnapshots: [],
    }
  }

  const selectionsByGroupId = new Map<string, ProductOptionSelectionInput>()

  for (const selection of selectedCommercialOptions) {
    if (!selection.groupId && !selection.groupSlug) {
      return fail('MISSING_GROUP_REFERENCE', 'Cada opción comercial debe incluir groupId o groupSlug.')
    }

    const group = findGroupByReference(optionGroups, selection)
    if (!group) {
      return fail('UNKNOWN_GROUP', 'Grupo de opción comercial no reconocido.')
    }

    if (!group.isActive) {
      return fail('INACTIVE_GROUP', `El grupo "${group.slug}" no está activo.`)
    }

    if (!groupAppliesToProduct(group, productId, productTypeId)) {
      return fail('GROUP_NOT_APPLICABLE', `El grupo "${group.slug}" no aplica a este producto.`)
    }

    if (selectionsByGroupId.has(group.id)) {
      return fail('DUPLICATE_GROUP', `Selección duplicada para el grupo "${group.slug}".`)
    }

    if (!selection.valueId && !selection.valueSlug) {
      return fail('MISSING_VALUE_REFERENCE', `Falta valueId o valueSlug para el grupo "${group.slug}".`)
    }

    const value = findValueInGroup(group, selection)
    if (!value) {
      return fail('UNKNOWN_VALUE', `Valor no reconocido para el grupo "${group.slug}".`)
    }

    if (!value.isActive) {
      return fail('INACTIVE_VALUE', `El valor "${value.slug}" no está activo.`)
    }

    if (value.optionGroupId !== group.id) {
      return fail('VALUE_NOT_IN_GROUP', `El valor "${value.slug}" no pertenece al grupo "${group.slug}".`)
    }

    selectionsByGroupId.set(group.id, selection)
  }

  const validatedSelections: Array<{
    group: ProductOptionGroupWithValues
    value: ProductOptionValueRecord
    fromDefault: boolean
  }> = []

  for (const group of applicableGroups) {
    const activeValues = group.values.filter((value) => value.isActive)
    const explicitSelection = selectionsByGroupId.get(group.id)

    if (explicitSelection) {
      const value = findValueInGroup(group, explicitSelection)
      if (!value || !value.isActive) {
        return fail('INACTIVE_VALUE', `El valor seleccionado para "${group.slug}" no está activo.`)
      }
      validatedSelections.push({ group, value, fromDefault: false })
      continue
    }

    const defaultValue = getDefaultActiveValue({ ...group, values: activeValues })
    if (defaultValue) {
      validatedSelections.push({ group, value: defaultValue, fromDefault: true })
      continue
    }

    if (group.isRequired) {
      return fail(
        'REQUIRED_GROUP_MISSING',
        `Debes seleccionar una opción para "${group.name}".`,
      )
    }
  }

  const commercialOptionsSnapshots = buildProductOptionSnapshots(validatedSelections)

  return {
    ok: true,
    validatedSelections,
    commercialOptionsSnapshots,
  }
}
