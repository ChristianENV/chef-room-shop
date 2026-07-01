import type {
  ProductOptionGroupWithValues,
  ProductOptionSelectionInput,
  ProductOptionValueRecord,
} from './product-options.types'

/** Parent commercial option group that gates embroidery dependents. */
export const EMBROIDERY_OPTION_GROUP_SLUG = 'embroidery'

/** Value slug that enables embroidery position/size selections. */
export const EMBROIDERY_ENABLED_VALUE_SLUG = 'con-bordado'

/** Commercial option groups persisted only when embroidery is enabled. */
export const EMBROIDERY_DEPENDENT_GROUP_SLUGS = ['embroidery-position', 'embroidery-size'] as const

export type EmbroideryDependentGroupSlug = (typeof EMBROIDERY_DEPENDENT_GROUP_SLUGS)[number]

function isEmbroideryDependentGroupSlug(slug: string): slug is EmbroideryDependentGroupSlug {
  return (EMBROIDERY_DEPENDENT_GROUP_SLUGS as readonly string[]).includes(slug)
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

function getDefaultActiveValue(
  group: ProductOptionGroupWithValues,
): ProductOptionValueRecord | null {
  const defaults = group.values.filter((value) => value.isDefault && value.isActive)
  if (defaults.length === 0) return null
  return defaults.sort((a, b) => a.sortOrder - b.sortOrder)[0] ?? null
}

function resolveEmbroideryValueSlug(
  embroideryGroup: ProductOptionGroupWithValues,
  selectionsByGroupId: Map<string, ProductOptionSelectionInput>,
): string | undefined {
  const explicitSelection = selectionsByGroupId.get(embroideryGroup.id)
  if (explicitSelection) {
    return findValueInGroup(embroideryGroup, explicitSelection)?.slug
  }

  return getDefaultActiveValue(embroideryGroup)?.slug
}

/** Whether commercial embroidery (`con-bordado`) is selected or implied by defaults. */
export function isEmbroiderySelected(
  applicableGroups: ProductOptionGroupWithValues[],
  selectionsByGroupId: Map<string, ProductOptionSelectionInput>,
): boolean {
  const embroideryGroup = applicableGroups.find(
    (group) => group.slug === EMBROIDERY_OPTION_GROUP_SLUG,
  )
  if (!embroideryGroup) return false

  return (
    resolveEmbroideryValueSlug(embroideryGroup, selectionsByGroupId) ===
    EMBROIDERY_ENABLED_VALUE_SLUG
  )
}

/** Whether a group participates in validation/default application for the current selection set. */
export function isProductOptionGroupEnabledForSelection(
  group: ProductOptionGroupWithValues,
  applicableGroups: ProductOptionGroupWithValues[],
  selectionsByGroupId: Map<string, ProductOptionSelectionInput>,
): boolean {
  if (!isEmbroideryDependentGroupSlug(group.slug)) {
    return true
  }

  const hasEmbroideryGroup = applicableGroups.some(
    (candidate) => candidate.slug === EMBROIDERY_OPTION_GROUP_SLUG,
  )
  if (!hasEmbroideryGroup) {
    return true
  }

  return isEmbroiderySelected(applicableGroups, selectionsByGroupId)
}

/** Applicable groups minus embroidery dependents when embroidery is not enabled. */
export function filterApplicableGroupsForSelection(
  applicableGroups: ProductOptionGroupWithValues[],
  selectionsByGroupId: Map<string, ProductOptionSelectionInput>,
): ProductOptionGroupWithValues[] {
  return applicableGroups.filter((group) =>
    isProductOptionGroupEnabledForSelection(group, applicableGroups, selectionsByGroupId),
  )
}
