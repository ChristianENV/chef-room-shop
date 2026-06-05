export const CUSTOMIZER_EMBROIDERY_PRICING_CENTS = {
  TEXT: 10_000,
  CHEST_LOGO: 19_000,
  BACK_LOGO_SAME_AS_CHEST: 40_000,
  BACK_LOGO_PRIMARY_OR_NEW: 49_000,
} as const

export const CUSTOMIZER_PRICING_RULES_VERSION = 'embroidery-v1' as const

export const CUSTOMIZER_PRICING_LABELS = {
  TEXT: 'Texto bordado',
  CHEST_LOGO: 'Logo en pecho',
  BACK_LOGO: 'Logo en espalda',
  BACK_LOGO_SAME_AS_CHEST: 'Logo en espalda usando mismo logo',
} as const
