import type { CustomizerAccordionSectionId } from './customizer-accordion-sections'

export const CUSTOMIZER_ACCORDION_STORAGE_KEY = 'chefroom.customizer.accordion'

const DEFAULT_OPEN: CustomizerAccordionSectionId[] = ['producto']

function isSectionId(value: string): value is CustomizerAccordionSectionId {
  return [
    'producto',
    'colores',
    'texto',
    'logotipos',
    'extras',
    'talla',
    'bordados',
    'disenos',
    'debug3d',
  ].includes(value)
}

export function loadCustomizerAccordionOpen(): CustomizerAccordionSectionId[] {
  if (typeof window === 'undefined') return DEFAULT_OPEN
  try {
    const raw = window.sessionStorage.getItem(CUSTOMIZER_ACCORDION_STORAGE_KEY)
    if (!raw) return DEFAULT_OPEN
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return DEFAULT_OPEN
    const sections = parsed.filter(
      (item): item is CustomizerAccordionSectionId =>
        typeof item === 'string' && isSectionId(item),
    )
    return sections.length > 0 ? sections : DEFAULT_OPEN
  } catch {
    return DEFAULT_OPEN
  }
}

export function saveCustomizerAccordionOpen(sections: CustomizerAccordionSectionId[]): void {
  if (typeof window === 'undefined') return
  try {
    window.sessionStorage.setItem(CUSTOMIZER_ACCORDION_STORAGE_KEY, JSON.stringify(sections))
  } catch {
    // Ignore quota / private mode errors.
  }
}
