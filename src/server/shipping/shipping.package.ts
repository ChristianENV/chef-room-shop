import 'server-only'

import { getDefaultPackageConfig } from './shipping.config'
import {
  calculateEstimatedPackageFromQuantity,
  getPackageForCartItems,
  type CartItemQuantityInput,
  type PackageDimensions,
} from './shipping-package.shared'

export type { CartItemQuantityInput, PackageDimensions }
export { calculateEstimatedPackageFromQuantity, getPackageForCartItems }

/**
 * Returns default single-garment package from vars-backed config (env override optional).
 */
export function getDefaultPackage(): PackageDimensions {
  return getDefaultPackageConfig()
}
