import 'server-only'

import { SHIPPING_VARS } from '@/src/config/vars'

import {
  resolveShippingOriginFromEnv,
  type ShippingOriginConfig,
} from './shipping-origin.resolve'

export type { ShippingOriginConfig }

export type PackageDimensionsConfig = {
  lengthCm: number
  widthCm: number
  heightCm: number
  weightKg: number
}

function parsePositiveNumber(
  raw: string | undefined,
  fallback: number,
  label: string,
): number {
  if (!raw?.trim()) return fallback
  const value = Number.parseFloat(raw.trim())
  if (!Number.isFinite(value) || value <= 0) {
    throw new Error(`Invalid ${label}: must be a positive number`)
  }
  return value
}

/**
 * Warehouse / origin address for outbound shipments.
 * Defaults from `SHIPPING_VARS.origin`; optional `SHIPPING_ORIGIN_*` env overrides.
 */
export function getShippingOriginConfig(): ShippingOriginConfig {
  return resolveShippingOriginFromEnv()
}

/**
 * Default parcel dimensions for a single garment.
 * Defaults from `SHIPPING_VARS.defaultPackage`; optional `SHIPPING_DEFAULT_PACKAGE_*` env overrides.
 */
export function getDefaultPackageConfig(): PackageDimensionsConfig {
  const defaults = SHIPPING_VARS.defaultPackage

  return {
    lengthCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_LENGTH_CM,
      defaults.lengthCm,
      'SHIPPING_DEFAULT_PACKAGE_LENGTH_CM',
    ),
    widthCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_WIDTH_CM,
      defaults.widthCm,
      'SHIPPING_DEFAULT_PACKAGE_WIDTH_CM',
    ),
    heightCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_HEIGHT_CM,
      defaults.heightCm,
      'SHIPPING_DEFAULT_PACKAGE_HEIGHT_CM',
    ),
    weightKg: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_WEIGHT_KG,
      defaults.weightKg,
      'SHIPPING_DEFAULT_PACKAGE_WEIGHT_KG',
    ),
  }
}
