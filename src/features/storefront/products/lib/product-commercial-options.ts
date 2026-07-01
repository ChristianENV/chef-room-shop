import {
  clearDisabledCommercialOptionSelections,
  isCommercialOptionGroupEnabled,
} from './product-commercial-option-dependencies'

export {
  EMBROIDERY_DEPENDENT_GROUP_SLUGS,
  EMBROIDERY_ENABLED_VALUE_SLUG,
  EMBROIDERY_OPTION_GROUP_SLUG,
  clearDisabledCommercialOptionSelections,
  isCommercialOptionGroupEnabled,
  isEmbroideryCommercialOptionEnabled,
} from './product-commercial-option-dependencies'

/** Commercial product option value from catalog BFF (PDP). */
export type ProductOptionValue = {
  id: string
  slug: string
  label: string
  description?: string | null
  priceDeltaCents: number
  isDefault: boolean
  sortOrder: number
}

/** Commercial product option group from catalog BFF (PDP). */
export type ProductOptionGroup = {
  id: string
  slug: string
  name: string
  description?: string | null
  inputType: 'SINGLE_SELECT' | 'BOOLEAN'
  isRequired: boolean
  sortOrder: number
  values: ProductOptionValue[]
}

/** Client selection state keyed by option group id. */
export type CommercialOptionSelections = Record<string, string>

/** Payload entry for add-to-cart (identifiers only). */
export type SelectedCommercialOptionInput = {
  groupId: string
  valueId: string
}

/**
 * Builds initial commercial option selections from group defaults.
 * Embroidery dependents are omitted when embroidery is not enabled.
 */
export function getInitialCommercialOptionSelections(
  optionGroups: ProductOptionGroup[],
): CommercialOptionSelections {
  const selections: CommercialOptionSelections = {}

  for (const group of optionGroups) {
    const defaultValue =
      group.values.find((value) => value.isDefault) ??
      (group.values.length === 1 ? group.values[0] : undefined)

    if (defaultValue) {
      selections[group.id] = defaultValue.id
    }
  }

  return clearDisabledCommercialOptionSelections(optionGroups, selections)
}

/**
 * Validates required commercial option groups have a selected value.
 * Disabled embroidery dependents are not required on the client.
 */
export function validateCommercialOptionSelections(
  optionGroups: ProductOptionGroup[],
  selections: CommercialOptionSelections,
): { ok: true } | { ok: false; message: string } {
  for (const group of optionGroups) {
    if (!group.isRequired) continue
    if (!isCommercialOptionGroupEnabled(group, optionGroups, selections)) continue

    const selectedValueId = selections[group.id]
    if (!selectedValueId) {
      return {
        ok: false,
        message: `Selecciona una opción para "${group.name}".`,
      }
    }

    const value = group.values.find((item) => item.id === selectedValueId)
    if (!value) {
      return {
        ok: false,
        message: `La opción seleccionada para "${group.name}" no es válida.`,
      }
    }
  }

  return { ok: true }
}

/**
 * Builds add-to-cart payload from current commercial option selections.
 * Sends groupId + valueId only — never price or labels.
 * Disabled embroidery dependents are omitted.
 */
export function buildSelectedCommercialOptionsPayload(
  optionGroups: ProductOptionGroup[],
  selections: CommercialOptionSelections,
): SelectedCommercialOptionInput[] {
  const payload: SelectedCommercialOptionInput[] = []

  for (const group of optionGroups) {
    if (!isCommercialOptionGroupEnabled(group, optionGroups, selections)) continue

    const valueId = selections[group.id]
    if (!valueId) continue

    const value = group.values.find((item) => item.id === valueId)
    if (!value) continue

    payload.push({
      groupId: group.id,
      valueId: value.id,
    })
  }

  return payload
}

/**
 * Sums selected commercial option price deltas for PDP display (estimate only).
 * Disabled embroidery dependents are excluded.
 */
export function calculateCommercialOptionsPriceDeltaCents(
  optionGroups: ProductOptionGroup[],
  selections: CommercialOptionSelections,
): number {
  let total = 0

  for (const group of optionGroups) {
    if (!isCommercialOptionGroupEnabled(group, optionGroups, selections)) continue

    const valueId = selections[group.id]
    if (!valueId) continue

    const value = group.values.find((item) => item.id === valueId)
    if (value) {
      total += value.priceDeltaCents
    }
  }

  return total
}

/**
 * Resolves unit price in cents from base product price and optional variant override.
 */
export function resolveProductUnitPriceCents(
  basePriceCents: number,
  variantPriceCents?: number | null,
): number {
  if (variantPriceCents != null) {
    return variantPriceCents
  }
  return basePriceCents
}

/**
 * Estimated PDP unit price in cents (display only; server validates on add-to-cart).
 */
export function calculateEstimatedUnitPriceCents(input: {
  basePriceCents: number
  variantPriceCents?: number | null
  optionGroups: ProductOptionGroup[]
  selections: CommercialOptionSelections
}): number {
  const unitPriceCents = resolveProductUnitPriceCents(input.basePriceCents, input.variantPriceCents)
  const optionsDeltaCents = calculateCommercialOptionsPriceDeltaCents(
    input.optionGroups,
    input.selections,
  )
  return unitPriceCents + optionsDeltaCents
}
