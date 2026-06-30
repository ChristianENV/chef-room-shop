import type {
  ProductOptionSnapshot,
  ValidatedProductOptionSelection,
} from './product-options.types'

function isProductOptionSnapshot(value: unknown): value is ProductOptionSnapshot {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return false
  const record = value as Record<string, unknown>
  return (
    typeof record.groupId === 'string' &&
    typeof record.groupSlug === 'string' &&
    typeof record.groupName === 'string' &&
    typeof record.valueId === 'string' &&
    typeof record.valueSlug === 'string' &&
    typeof record.valueLabel === 'string' &&
    typeof record.priceDeltaCents === 'number'
  )
}

/**
 * Parse commercial option snapshots from `CartItem.selectedOptionsJson` / `OrderItem.selectedOptionsJson`.
 */
export function parseCommercialOptionsSnapshot(json: unknown): ProductOptionSnapshot[] {
  if (!Array.isArray(json)) return []
  return json.filter(isProductOptionSnapshot)
}

/**
 * Deterministic cart line key segment for commercial options (empty when none selected).
 */
export function buildCommercialOptionsLineKey(snapshots: ProductOptionSnapshot[]): string {
  if (snapshots.length === 0) return ''
  return snapshots
    .slice()
    .sort((a, b) => a.groupSlug.localeCompare(b.groupSlug))
    .map((snapshot) => `${snapshot.groupSlug}:${snapshot.valueSlug}`)
    .join('|')
}

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
