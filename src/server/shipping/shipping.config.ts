import 'server-only'

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
 * Warehouse / origin address for outbound shipments (from env).
 * Missing optional contact fields do not break build; validate at quote time if needed.
 */
export function getShippingOriginConfig(): ShippingOriginConfig {
  return {
    name: process.env.SHIPPING_ORIGIN_NAME?.trim() || 'Chef Room',
    company: process.env.SHIPPING_ORIGIN_COMPANY?.trim() || 'Chef Room by Bedolla',
    phone: process.env.SHIPPING_ORIGIN_PHONE?.trim() ?? '',
    email: process.env.SHIPPING_ORIGIN_EMAIL?.trim() ?? '',
    street: process.env.SHIPPING_ORIGIN_STREET?.trim() ?? '',
    extNumber: process.env.SHIPPING_ORIGIN_EXT_NUMBER?.trim() ?? '',
    intNumber: process.env.SHIPPING_ORIGIN_INT_NUMBER?.trim() ?? '',
    neighborhood: process.env.SHIPPING_ORIGIN_NEIGHBORHOOD?.trim() ?? '',
    city: process.env.SHIPPING_ORIGIN_CITY?.trim() || 'Puebla',
    state: process.env.SHIPPING_ORIGIN_STATE?.trim() || 'Puebla',
    country: process.env.SHIPPING_ORIGIN_COUNTRY?.trim() || SHIPPING_COUNTRY_MX,
    postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE?.trim() || '72000',
  }
}

/**
 * Default parcel dimensions for a single garment (from env with sane fallbacks).
 */
export function getDefaultPackageConfig(): PackageDimensionsConfig {
  return {
    lengthCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_LENGTH_CM,
      30,
      'SHIPPING_DEFAULT_PACKAGE_LENGTH_CM',
    ),
    widthCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_WIDTH_CM,
      20,
      'SHIPPING_DEFAULT_PACKAGE_WIDTH_CM',
    ),
    heightCm: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_HEIGHT_CM,
      5,
      'SHIPPING_DEFAULT_PACKAGE_HEIGHT_CM',
    ),
    weightKg: parsePositiveNumber(
      process.env.SHIPPING_DEFAULT_PACKAGE_WEIGHT_KG,
      0.5,
      'SHIPPING_DEFAULT_PACKAGE_WEIGHT_KG',
    ),
  }
}
