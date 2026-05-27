import { SHIPPING_VARS } from '@/src/config/vars'

export type CartItemQuantityInput = {
  quantity: number
}

export type PackageDimensions = {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
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

export function getPackageForCartItems(items: CartItemQuantityInput[]): PackageDimensions {
  const totalQuantity = items.reduce((sum, item) => sum + Math.max(0, item.quantity), 0)
  if (totalQuantity <= 0) {
    const defaults = SHIPPING_VARS.defaultPackage
    return {
      lengthCm: defaults.lengthCm,
      widthCm: defaults.widthCm,
      heightCm: defaults.heightCm,
      weightKg: defaults.weightKg,
    }
  }
  return calculateEstimatedPackageFromQuantity(totalQuantity)
}
