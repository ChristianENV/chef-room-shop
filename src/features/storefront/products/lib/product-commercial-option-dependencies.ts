/** Parent commercial option group that gates embroidery dependents on the PDP. */
export const EMBROIDERY_OPTION_GROUP_SLUG = 'embroidery'

/** Value slug that enables embroidery position/size selectors. */
export const EMBROIDERY_ENABLED_VALUE_SLUG = 'con-bordado'

/** Commercial option groups shown only when embroidery is enabled. */
export const EMBROIDERY_DEPENDENT_GROUP_SLUGS = ['embroidery-position', 'embroidery-size'] as const

export type EmbroideryDependentGroupSlug = (typeof EMBROIDERY_DEPENDENT_GROUP_SLUGS)[number]

export type CommercialOptionSelections = Record<string, string>

type CommercialOptionGroupForDependency = {
  id: string
  slug: string
  values: Array<{ id: string; slug: string }>
}

function isEmbroideryDependentGroupSlug(slug: string): slug is EmbroideryDependentGroupSlug {
  return (EMBROIDERY_DEPENDENT_GROUP_SLUGS as readonly string[]).includes(slug)
}

function getSelectedValueSlug(
  group: CommercialOptionGroupForDependency,
  selections: CommercialOptionSelections,
): string | undefined {
  const valueId = selections[group.id]
  if (!valueId) return undefined
  return group.values.find((value) => value.id === valueId)?.slug
}

/** Whether the customer selected commercial embroidery (not "sin bordado"). */
export function isEmbroideryCommercialOptionEnabled(
  optionGroups: CommercialOptionGroupForDependency[],
  selections: CommercialOptionSelections,
): boolean {
  const embroideryGroup = optionGroups.find((group) => group.slug === EMBROIDERY_OPTION_GROUP_SLUG)
  if (!embroideryGroup) return false

  return getSelectedValueSlug(embroideryGroup, selections) === EMBROIDERY_ENABLED_VALUE_SLUG
}

/**
 * Client-side PDP guard: embroidery dependents apply only when the embroidery group exists
 * and "con-bordado" is selected. Products without an embroidery group behave as before.
 */
export function isCommercialOptionGroupEnabled(
  group: CommercialOptionGroupForDependency,
  optionGroups: CommercialOptionGroupForDependency[],
  selections: CommercialOptionSelections,
): boolean {
  if (!isEmbroideryDependentGroupSlug(group.slug)) {
    return true
  }

  const hasEmbroideryGroup = optionGroups.some(
    (candidate) => candidate.slug === EMBROIDERY_OPTION_GROUP_SLUG,
  )
  if (!hasEmbroideryGroup) {
    return true
  }

  return isEmbroideryCommercialOptionEnabled(optionGroups, selections)
}

/** Removes selections for commercial option groups that are currently disabled. */
export function clearDisabledCommercialOptionSelections(
  optionGroups: CommercialOptionGroupForDependency[],
  selections: CommercialOptionSelections,
): CommercialOptionSelections {
  const next = { ...selections }

  for (const group of optionGroups) {
    if (!isCommercialOptionGroupEnabled(group, optionGroups, selections)) {
      delete next[group.id]
    }
  }

  return next
}
