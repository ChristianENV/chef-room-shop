import 'server-only'

import { SHIPPING_PACKAGE_TIERS } from '@/src/config/shipping'

import { getDefaultPackageConfig, type PackageDimensionsConfig } from './shipping.config'

export type CartItemQuantityInput = {
  quantity: number
}

export type PackageDimensions = PackageDimensionsConfig

const MULTI_PACKAGE_WEIGHT_PER_EXTRA_KG = 0.15

/**
 * Returns default single-garment package from env-backed config.
 */
export function getDefaultPackage(): PackageDimensions {
  return getDefaultPackageConfig()
}

/**
 * Estimates parcel size from total garment quantity (v1 tiers).
 *
 * - 1 garment: 30×20×5 cm, 0.5 kg
 * - 2–3: 35×25×8 cm, 0.9 kg
 * - 4–6: 40×30×12 cm, 1.5 kg
 * - \>6: same volume as medium; weight increases 0.15 kg per extra unit (multipackage TBD)
 */
export function calculateEstimatedPackageFromQuantity(quantity: number): PackageDimensions {
  const qty = Math.max(1, Math.floor(quantity))

  if (qty === 1) {
    return { ...SHIPPING_PACKAGE_TIERS.single }
  }

  if (qty <= 3) {
    return { ...SHIPPING_PACKAGE_TIERS.small }
  }

  if (qty <= 6) {
    return { ...SHIPPING_PACKAGE_TIERS.medium }
  }

  const base = { ...SHIPPING_PACKAGE_TIERS.medium }
  const extraUnits = qty - 6
  return {
    ...base,
    weightKg: Math.round((base.weightKg + extraUnits * MULTI_PACKAGE_WEIGHT_PER_EXTRA_KG) * 100) / 100,
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
