/**
 * Non-sensitive shipping constants (safe for client import).
 * Source of truth: `src/config/vars.ts` (`SHIPPING_VARS`).
 * Secrets and per-environment origin contact overrides live in server env only.
 */

import { SHIPPING_VARS } from './vars'

/** ISO country for domestic Mexico shipments. */
export const SHIPPING_COUNTRY_MX = SHIPPING_VARS.countryCode

/** Default currency for shipping rates. */
export const SHIPPING_CURRENCY_MX = SHIPPING_VARS.currencyCode

const [singleTier, smallTier, mediumTier] = SHIPPING_VARS.packageTiers

/** v1 package tiers by garment count (cm / kg). See docs/skydropx.md. */
export const SHIPPING_PACKAGE_TIERS = {
  single: {
    lengthCm: singleTier.lengthCm,
    widthCm: singleTier.widthCm,
    heightCm: singleTier.heightCm,
    weightKg: singleTier.weightKg,
  },
  small: {
    lengthCm: smallTier.lengthCm,
    widthCm: smallTier.widthCm,
    heightCm: smallTier.heightCm,
    weightKg: smallTier.weightKg,
  },
  medium: {
    lengthCm: mediumTier.lengthCm,
    widthCm: mediumTier.widthCm,
    heightCm: mediumTier.heightCm,
    weightKg: mediumTier.weightKg,
  },
} as const
