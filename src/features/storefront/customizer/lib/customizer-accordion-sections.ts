import type { CustomizerCategory } from './customizer-categories'

export type CustomizerAccordionSectionId =
  | 'producto'
  | 'colores'
  | 'texto'
  | 'logotipos'
  | 'extras'
  | 'talla'
  | 'bordados'
  | 'disenos'
  | 'debug3d'

export type CustomizerAccordionSectionConfig = {
  id: CustomizerAccordionSectionId
  label: string
  testId?: string
  description?: string
}

export const CUSTOMIZER_ACCORDION_SECTIONS: CustomizerAccordionSectionConfig[] = [
  {
    id: 'producto',
    label: 'Producto',
    testId: 'customizer-accordion-product',
    description: 'Elige la prenda a personalizar.',
  },
  {
    id: 'colores',
    label: 'Colores',
    testId: 'customizer-accordion-colors',
  },
  {
    id: 'texto',
    label: 'Texto y nombres',
    testId: 'customizer-accordion-text',
  },
  {
    id: 'logotipos',
    label: 'Logotipos',
    testId: 'customizer-accordion-logos',
  },
  {
    id: 'extras',
    label: 'Extras',
    testId: 'customizer-accordion-extras',
    description: 'Manga y botones.',
  },
  {
    id: 'talla',
    label: 'Talla',
    testId: 'customizer-accordion-size',
  },
  {
    id: 'bordados',
    label: 'Bordados',
    testId: 'customizer-accordion-bordados',
  },
  {
    id: 'disenos',
    label: 'Mis diseños',
    testId: 'customizer-accordion-designs',
  },
]

export const CUSTOMIZER_ADMIN_ACCORDION_SECTION: CustomizerAccordionSectionConfig = {
  id: 'debug3d',
  label: '3D debug',
  testId: 'customizer-accordion-debug3d',
}

/** Rail category → accordion sections to open and scroll target. */
export const RAIL_TO_ACCORDION_SECTIONS: Record<
  CustomizerCategory,
  CustomizerAccordionSectionId[]
> = {
  producto: ['producto'],
  colores: ['colores'],
  texto: ['texto'],
  logotipos: ['logotipos'],
  extras: ['extras', 'talla', 'bordados'],
  disenos: ['disenos'],
  debug3d: ['debug3d'],
}

export function railScrollTarget(category: CustomizerCategory): CustomizerAccordionSectionId {
  if (category === 'extras') return 'talla'
  return category
}
