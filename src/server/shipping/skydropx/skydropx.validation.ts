import type { Address, ShippingQuote, ShippingRate } from '@prisma/client'

import {
  resolveShippingOriginFromEnv,
  type ShippingOriginConfig,
} from '../shipping-origin.resolve'

export class SkydropxValidationError extends Error {
  readonly code = 'SKYDROPX_VALIDATION'

  constructor(message: string) {
    super(message)
    this.name = 'SkydropxValidationError'
  }
}

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

function isValidPhone(value: string): boolean {
  const digits = value.replace(/\D/g, '')
  return digits.length >= 8
}

/**
 * Builds street1 for Skydropx from calle + número exterior/interior.
 */
export function formatSkydropxStreet1(
  street: string,
  extNumber?: string | null,
  intNumber?: string | null,
): string {
  const base = street.trim()
  const parts = [base]
  if (extNumber?.trim()) {
    parts.push(`#${extNumber.trim()}`)
  }
  if (intNumber?.trim()) {
    parts.push(`Int. ${intNumber.trim()}`)
  }
  return parts.join(' ').trim()
}

export function parseAddressLine2(line2: string | null | undefined): {
  extNumber: string | null
  intNumber: string | null
} {
  if (!line2?.trim()) return { extNumber: null, intNumber: null }
  const parts = line2.split('|').map((p) => p.trim())
  return {
    extNumber: parts[0] || null,
    intNumber: parts[1] || null,
  }
}

/**
 * Ensures warehouse origin is configured before calling Skydropx.
 */
export function validateShippingOriginForLabel(
  origin: ShippingOriginConfig = resolveShippingOriginFromEnv(),
): void {
  const missing: string[] = []

  if (isBlank(origin.name)) missing.push('nombre')
  if (isBlank(origin.company)) missing.push('empresa')
  if (isBlank(origin.street)) missing.push('calle')
  if (isBlank(origin.extNumber)) missing.push('número exterior')
  if (isBlank(origin.neighborhood)) missing.push('colonia')
  if (isBlank(origin.city)) missing.push('ciudad')
  if (isBlank(origin.state)) missing.push('estado')
  if (isBlank(origin.postalCode)) missing.push('código postal')
  if (isBlank(origin.phone) || !isValidPhone(origin.phone)) missing.push('teléfono')
  if (isBlank(origin.email) || !isValidEmail(origin.email)) missing.push('correo')

  if (missing.length > 0) {
    throw new SkydropxValidationError(
      'Configura la dirección de origen antes de generar guías. Revisa SHIPPING_ORIGIN_* en el servidor (calle, número exterior, colonia, ciudad, estado, CP, teléfono y correo).',
    )
  }
}

export type OrderAddressForLabel = Pick<
  Address,
  'fullName' | 'line1' | 'line2' | 'label' | 'city' | 'state' | 'postalCode' | 'country' | 'phone'
>

/**
 * Validates order shipping address fields required for Skydropx label creation.
 */
export function validateOrderShippingAddressForLabel(
  address: OrderAddressForLabel,
  customerEmail: string,
): { neighborhood: string; reference: string } {
  const { extNumber } = parseAddressLine2(address.line2)
  const neighborhood = address.label?.trim() || ''
  const missing: string[] = []

  if (isBlank(address.fullName)) missing.push('nombre')
  if (isBlank(address.line1)) missing.push('calle')
  if (isBlank(extNumber)) missing.push('número exterior')
  if (isBlank(neighborhood)) missing.push('colonia')
  if (isBlank(address.city)) missing.push('ciudad')
  if (isBlank(address.state)) missing.push('estado')
  if (isBlank(address.postalCode)) missing.push('código postal')
  if (isBlank(address.phone) || !isValidPhone(address.phone!)) missing.push('teléfono')

  const email = customerEmail?.trim() || ''
  if (!isValidEmail(email)) missing.push('correo del cliente')

  if (missing.length > 0) {
    throw new SkydropxValidationError(
      'La dirección del pedido está incompleta. Agrega calle, número exterior, colonia, ciudad, estado, código postal y teléfono.',
    )
  }

  return {
    neighborhood,
    reference: neighborhood,
  }
}

/**
 * Validates quote + rate before POST /api/v1/shipments/.
 */
export function validateShippingQuoteForLabel(
  quote: Pick<ShippingQuote, 'id' | 'providerQuoteId' | 'orderId'>,
  rate: Pick<
    ShippingRate,
    'id' | 'providerRateId' | 'expiresAt' | 'selectedAt' | 'carrier' | 'service'
  >,
  options?: { explicitRateId?: string | null },
): void {
  if (!quote.orderId) {
    throw new SkydropxValidationError(
      'La cotización no está vinculada al pedido. El cliente debe completar checkout con envío.',
    )
  }

  if (!rate.providerRateId?.trim()) {
    throw new SkydropxValidationError(
      'La tarifa no tiene identificador de proveedor válido (providerRateId).',
    )
  }

  if (!quote.providerQuoteId?.trim()) {
    throw new SkydropxValidationError(
      'La cotización no tiene identificador de Skydropx (providerQuoteId). Vuelve a cotizar en checkout.',
    )
  }

  if (rate.expiresAt && rate.expiresAt <= new Date()) {
    throw new SkydropxValidationError(
      'La tarifa de envío expiró. Cotiza nuevamente antes de generar guía.',
    )
  }

  if (!options?.explicitRateId && !rate.selectedAt) {
    throw new SkydropxValidationError(
      'No hay tarifa de envío seleccionada. Selecciona una tarifa en checkout o indica rateId.',
    )
  }
}
