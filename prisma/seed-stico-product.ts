/** Stable slug for the STICO canonical product. */
export const STICO_PRODUCT_SLUG = 'zapato-stico-real-safety'

export const STICO_PRODUCT_TYPE_SLUG = 'shoes'

/** Future variant intent documented for admin reference (seeded when DB confirms). */
export const STICO_INTENDED_VARIANT_SIZE_SLUGS = [
  '22',
  '23',
  '24',
  '25',
  '26',
  '27',
  '28',
  '29',
  '30',
] as const

export const STICO_INTENDED_COLOR_SLUG = 'black' as const

export const STICO_SHORT_DESCRIPTION =
  'Zapato profesional cerrado de talón con suela de caucho Nanotech + cerámica para máximo agarre. Diseñado para entornos de cocina y trabajo donde se requiere resistencia, comodidad y seguridad.'

const STICO_SPECS_LINES = [
  'Parte superior: 90% EVA ARLON CX, 10% caucho alta densidad.',
  'Plantilla: Plantilla antifatiga Hamble X.',
  'Suela: Caucho Nanotech + cerámica, máximo agarre.',
  'Antiderrapante: Grabado patentado y canaletas antiderrapantes.',
  'Rango de tallas: 220 mm - 300 mm.',
  'Peso: 680 gramos el par.',
  'Estándares indicados: KIFLT, SPIC, SATRA, OSHA, ÖNORM EN ISO 20347:2012.',
  'Resistencia nivel A: detergente, aceite y agua.',
] as const

const STICO_FEATURE_BULLETS = [
  'Diseño cerrado de talón',
  'Antiderrapante caucho + cerámica',
  'Mayor resistencia',
] as const

/** Long description built only from confirmed supplier/product copy. */
export function buildSticoDescription(): string {
  return [
    STICO_SHORT_DESCRIPTION,
    '',
    'Características:',
    ...STICO_FEATURE_BULLETS.map((line) => `- ${line}`),
    '',
    'Especificaciones:',
    ...STICO_SPECS_LINES,
  ].join('\n')
}

/** @deprecated Use buildSticoDescription */
export const buildSticoDraftDescription = buildSticoDescription

/** @deprecated Use STICO_PRODUCT_SLUG */
export const STICO_DRAFT_PRODUCT_SLUG = STICO_PRODUCT_SLUG

/** @deprecated Use STICO_PRODUCT_TYPE_SLUG */
export const STICO_DRAFT_PRODUCT_TYPE_SLUG = STICO_PRODUCT_TYPE_SLUG

/** @deprecated Use STICO_SHORT_DESCRIPTION */
export const STICO_DRAFT_SHORT_DESCRIPTION = STICO_SHORT_DESCRIPTION
