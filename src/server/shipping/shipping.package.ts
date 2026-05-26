import 'server-only'

import { SHIPPING_VARS } from '@/src/config/vars'

import { getDefaultPackageConfig, type PackageDimensionsConfig } from './shipping.config'

export type CartItemQuantityInput = {
  quantity: number
}

export type PackageDimensions = PackageDimensionsConfig

/**
 * Returns default single-garment package from vars-backed config (env override optional).
 */
export function getDefaultPackage(): PackageDimensions {
  return getDefaultPackageConfig()
}

function tierDimensionsForQuantity(quantity: number): PackageDimensions | null {
  const tier = SHIPPING_VARS.packageTiers.find(
    (entry) => quantity >= entry.minItems && quantity <= entry.maxItems,
  )
  if (!tier) return null

  return {
    lengthCm: tier.lengthCm,
    widthCm: tier.widthCm,
    heightCm: tier.heightCm,
    weightKg: tier.weightKg,
  }
}

/**
 * Estimates parcel size from total garment quantity (v1 tiers).
 *
 * - 1 garment: 30×20×5 cm, 0.5 kg
 * - 2–3: 35×25×8 cm, 0.9 kg
 * - 4–6: 40×30×12 cm, 1.5 kg
 * - \>6: same volume as medium; weight increases per `SHIPPING_VARS.extraItemWeightKg`
 */
export function calculateEstimatedPackageFromQuantity(quantity: number): PackageDimensions {
  const qty = Math.max(1, Math.floor(quantity))
  const matched = tierDimensionsForQuantity(qty)
  if (matched) return matched

  const lastTier = SHIPPING_VARS.packageTiers[SHIPPING_VARS.packageTiers.length - 1]!
  const extraUnits = qty - lastTier.maxItems

  return {
    lengthCm: lastTier.lengthCm,
    widthCm: lastTier.widthCm,
    heightCm: lastTier.heightCm,
    weightKg:
      Math.round(
        (lastTier.weightKg + extraUnits * SHIPPING_VARS.extraItemWeightKg) * 100,
      ) / 100,
  }
}

/**
 * Aggregates cart line quantities and returns the estimated parcel for quoting.
 */
export function getPackageForCartItems(items: CartItemQuantityInput[]): PackageDimensions {
  const totalQuantity = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0)
  if (totalQuantity <= 0) {
    return getDefaultPackage()
  }
  return calculateEstimatedPackageFromQuantity(totalQuantity)
}
