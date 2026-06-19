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
  reference: string
}

/**
 * Warehouse / origin address from env + vars defaults (safe for scripts).
 */
export function resolveShippingOriginFromEnv(): ShippingOriginConfig {
  const origin = SHIPPING_VARS.origin

  return {
    name: process.env.SHIPPING_ORIGIN_NAME?.trim() || origin.name,
    company: process.env.SHIPPING_ORIGIN_COMPANY?.trim() || origin.company,
    phone: process.env.SHIPPING_ORIGIN_PHONE?.trim() || origin.phone,
    email: process.env.SHIPPING_ORIGIN_EMAIL?.trim() || origin.email,
    street: process.env.SHIPPING_ORIGIN_STREET?.trim() || origin.street,
    extNumber: process.env.SHIPPING_ORIGIN_EXT_NUMBER?.trim() || origin.extNumber,
    intNumber: process.env.SHIPPING_ORIGIN_INT_NUMBER?.trim() || origin.intNumber,
    neighborhood: process.env.SHIPPING_ORIGIN_NEIGHBORHOOD?.trim() || origin.neighborhood,
    city: process.env.SHIPPING_ORIGIN_CITY?.trim() || origin.city,
    state: process.env.SHIPPING_ORIGIN_STATE?.trim() || origin.state,
    country: process.env.SHIPPING_ORIGIN_COUNTRY?.trim() || SHIPPING_COUNTRY_MX,
    postalCode: process.env.SHIPPING_ORIGIN_POSTAL_CODE?.trim() || origin.postalCode,
    reference: process.env.SHIPPING_ORIGIN_REFERENCE?.trim() || '',
  }
}
