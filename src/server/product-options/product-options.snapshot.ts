import type { ProductOptionSnapshot, ValidatedProductOptionSelection } from './product-options.types'

/**
 * Build immutable commercial option snapshots from server-validated selections.
 * Never reads customizer `selectedOptions` — commercial options only.
 */
export function buildProductOptionSnapshots(
  validatedSelections: ValidatedProductOptionSelection[],
): ProductOptionSnapshot[] {
  return validatedSelections.map(({ group, value }) => ({
    groupId: group.id,
    groupSlug: group.slug,
    groupName: group.name,
    valueId: value.id,
    valueSlug: value.slug,
    valueLabel: value.label,
    priceDeltaCents: value.priceDeltaCents,
  }))
}
