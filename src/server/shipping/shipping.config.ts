import 'server-only'

import { SHIPPING_VARS } from '@/src/config/vars'
import { SHIPPING_COUNTRY_MX } from '@/src/config/shipping'

export type ShippingOriginConfig = {
  name: string
  company: string
  phone: string
  email: string
  street: string
  extNumber: string
  intNumber: string
  neighborhood: string
  city: string
  state: string
  country: string
  postalCode: string
}

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
  const origin = SHIPPING_VARS.origin

  return {
    name: process.env.SHIPPING_ORIGIN_NAME?.trim() || origin.name,
    company: process.env.SHIPPING_ORIGIN_COMPANY?.trim() || origin.company,
    phone: process.env.SHIPPING_ORIGIN_PHONE?.trim() || origin.phone,
    email: process.env.SHIPPING_ORIGIN_EMAIL?.trim() || origin.email,
    street: process.env.SHIPPING_ORIGIN_STREET?.trim() || origin.street,
    extNumber: process.env.SHIPPING_ORIGIN_EXT_NUMBER?.trim() || origin.extNumber,
    intNumber: process.env.SHIPPING_ORIGIN_INT_NUMBER?.trim() || origin.intNumber,
    neighborhood:
      process.env.SHIPPING_ORIGIN_NEIGHBORHOOD?.trim() || origin.neighborhood,
    city: process.env.SHIPPING_ORIGIN_CITY?.trim() || origin.city,
    state: process.env.SHIPPING_ORIGIN_STATE?.trim() || origin.state,
    country: process.env.SHIPPING_ORIGIN_COUNTRY?.trim() || SHIPPING_COUNTRY_MX,
    postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE?.trim() || origin.postalCode,
  }
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
