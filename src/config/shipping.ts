/**
 * Non-sensitive shipping constants (safe for client import in future UI).
 * Secrets and origin contact data live in server env only.
 */

/** ISO country for domestic Mexico shipments. */
export const SHIPPING_COUNTRY_MX = 'MX' as const

/** Default currency for shipping rates. */
export const SHIPPING_CURRENCY_MX = 'MXN' as const

/** v1 package tiers by garment count (cm / kg). See docs/skydropx.md. */
export const SHIPPING_PACKAGE_TIERS = {
  single: { lengthCm: 30, widthCm: 20, heightCm: 5, weightKg: 0.5 },
  small: { lengthCm: 35, widthCm: 25, heightCm: 8, weightKg: 0.9 },
  medium: { lengthCm: 40, widthCm: 30, heightCm: 12, weightKg: 1.5 },
} as const
