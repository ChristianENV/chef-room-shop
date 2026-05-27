import type { PackageDimensions } from '../shipping.package'
import type { SkydropxParcelInput } from './skydropx.types'

/**
 * Maps internal package dimensions (cm/kg) to Skydropx parcel integers/float.
 */
export function mapPackageToSkydropxParcel(pkg: PackageDimensions): SkydropxParcelInput {
  return {
    length: Math.max(1, Math.round(pkg.lengthCm)),
    width: Math.max(1, Math.round(pkg.widthCm)),
    height: Math.max(1, Math.round(pkg.heightCm)),
    weight: Math.max(0.1, pkg.weightKg),
  }
}
