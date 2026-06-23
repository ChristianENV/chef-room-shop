import type { Address, ShippingQuote, ShippingRate } from '@prisma/client'

import type { PackageDimensions } from '../shipping-package.shared'
import { resolveShippingOriginFromEnv, type ShippingOriginConfig } from '../shipping-origin.resolve'
import type { SkydropxLabelAddress } from './skydropx-address'
import { truncateSkydropxReference } from './skydropx-field-limits'
import { normalizeMxPhoneForSkydropx } from './skydropx-phone'
import { SkydropxValidationError } from './skydropx.validation-errors'

export { SkydropxValidationError }

export type QuotationDestinationInput = {
  postalCode: string
  city: string
  state: string
  neighborhood: string
  country?: string
}

function isBlank(value: string | null | undefined): boolean {
  return !value?.trim()
}

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value.trim())
}

/**
 * Mexican postal code: exactly 5 digits.
 */
export function normalizeMxPostalCode(postalCode: string): string {
  const digits = postalCode.replace(/\D/g, '')
  if (digits.length !== 5) {
    throw new SkydropxValidationError('El código postal debe tener 5 dígitos.')
  }
  return digits
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

function assertMxCountry(country: string, fieldLabel = 'país'): void {
  const normalized = country.trim().toUpperCase()
  if (
    normalized !== 'MX' &&
    normalized !== 'MEX' &&
    normalized !== 'MÉXICO' &&
    normalized !== 'MEXICO'
  ) {
    throw new SkydropxValidationError(`El ${fieldLabel} debe ser MX para envíos nacionales.`)
  }
}

/**
 * Validates warehouse origin and returns canonical Skydropx label address.
 */
export function validateShippingOriginForLabel(
  origin: ShippingOriginConfig = resolveShippingOriginFromEnv(),
): SkydropxLabelAddress {
  const missing: string[] = []

  if (isBlank(origin.name)) missing.push('nombre')
  if (isBlank(origin.street)) missing.push('calle')
  if (isBlank(origin.extNumber)) missing.push('número exterior')
  if (isBlank(origin.neighborhood)) missing.push('colonia')
  if (isBlank(origin.city)) missing.push('ciudad')
  if (isBlank(origin.state)) missing.push('estado')
  if (isBlank(origin.postalCode)) missing.push('código postal')
  if (isBlank(origin.phone)) missing.push('teléfono')
  if (isBlank(origin.email)) missing.push('correo')

  if (missing.length > 0) {
    throw new SkydropxValidationError(
      `Configura la dirección de origen antes de generar guías. Faltan: ${missing.join(', ')}.`,
    )
  }

  let postal_code: string
  let phone: string

  try {
    postal_code = normalizeMxPostalCode(origin.postalCode)
  } catch (error) {
    if (error instanceof SkydropxValidationError) {
      throw new SkydropxValidationError(
        'Configura la dirección de origen antes de generar guías. El código postal debe tener 5 dígitos.',
      )
    }
    throw error
  }

  try {
    phone = normalizeMxPhoneForSkydropx(origin.phone)
  } catch (error) {
    if (error instanceof SkydropxValidationError) {
      throw new SkydropxValidationError(
        'Configura la dirección de origen antes de generar guías. El teléfono debe tener 10 dígitos.',
      )
    }
    throw error
  }

  if (!isValidEmail(origin.email)) {
    throw new SkydropxValidationError(
      'Configura la dirección de origen antes de generar guías. El correo no es válido.',
    )
  }

  assertMxCountry(origin.country)

  const reference = truncateSkydropxReference(
    origin.reference?.trim() || origin.neighborhood.trim() || 'Bodega Chef Room',
  )

  return {
    address: origin.street.trim(),
    internal_number: origin.extNumber.trim(),
    reference,
    sector: origin.neighborhood.trim(),
    city: origin.city.trim(),
    state: origin.state.trim(),
    postal_code,
    country: 'MX',
    person_name: origin.name.trim(),
    company: origin.company?.trim() || origin.name.trim(),
    phone,
    email: origin.email.trim(),
    ...(origin.intNumber?.trim()
      ? { further_information: `Int. ${origin.intNumber.trim()}`.slice(0, 70) }
      : {}),
  }
}

export type OrderAddressForLabel = Pick<
  Address,
  'fullName' | 'line1' | 'line2' | 'label' | 'city' | 'state' | 'postalCode' | 'country' | 'phone'
>

/**
 * Validates order shipping address and returns canonical recipient address.
 */
export function validateOrderShippingAddressForSkydropx(
  address: OrderAddressForLabel,
  customerEmail: string,
): SkydropxLabelAddress {
  const { extNumber, intNumber } = parseAddressLine2(address.line2)
  const sector = address.label?.trim() || ''
  const missing: string[] = []

  if (isBlank(address.fullName)) missing.push('nombre')
  if (isBlank(address.line1)) missing.push('calle')
  if (isBlank(extNumber)) missing.push('número exterior')
  if (isBlank(sector)) missing.push('colonia')
  if (isBlank(address.city)) missing.push('ciudad')
  if (isBlank(address.state)) missing.push('estado')
  if (isBlank(address.postalCode)) missing.push('código postal')
  if (isBlank(address.phone)) missing.push('teléfono')

  const email = customerEmail?.trim() || ''
  if (!isValidEmail(email)) missing.push('correo del cliente')

  if (missing.length > 0) {
    throw new SkydropxValidationError(
      `La dirección del pedido está incompleta. Faltan: ${missing.join(', ')}.`,
    )
  }

  let postal_code: string
  let phone: string

  try {
    postal_code = normalizeMxPostalCode(address.postalCode)
  } catch {
    throw new SkydropxValidationError(
      'La dirección del pedido está incompleta. El código postal debe tener 5 dígitos.',
    )
  }

  try {
    phone = normalizeMxPhoneForSkydropx(address.phone!)
  } catch {
    throw new SkydropxValidationError(
      'La dirección del pedido está incompleta. El teléfono debe tener 10 dígitos.',
    )
  }

  assertMxCountry(address.country, 'país del destinatario')

  const referencesFromLabel = sector

  return {
    address: address.line1.trim(),
    internal_number: extNumber!.trim(),
    reference: referencesFromLabel,
    sector,
    city: address.city.trim(),
    state: address.state.trim(),
    postal_code,
    country: 'MX',
    person_name: address.fullName.trim(),
    company: address.fullName.trim(),
    phone,
    email,
    ...(intNumber?.trim() ? { further_information: `Int. ${intNumber.trim()}`.slice(0, 70) } : {}),
  }
}

/** @deprecated Use validateOrderShippingAddressForSkydropx */
export function validateOrderShippingAddressForLabel(
  address: OrderAddressForLabel,
  customerEmail: string,
): { neighborhood: string; reference: string } {
  const validated = validateOrderShippingAddressForSkydropx(address, customerEmail)
  return { neighborhood: validated.sector, reference: validated.reference }
}

/** Alias — same rules as label origin (phone 10 digits, reference max 30). */
export function validateShippingOriginForQuotation(
  origin?: ShippingOriginConfig,
): SkydropxLabelAddress {
  return validateShippingOriginForLabel(origin)
}

/**
 * Validates destination for POST /api/v1/quotations (CP + city/state sufficient).
 */
export function validateQuotationDestination(
  input: QuotationDestinationInput,
): QuotationDestinationInput {
  const missing: string[] = []

  if (isBlank(input.postalCode)) missing.push('código postal')
  if (isBlank(input.city)) missing.push('ciudad')
  if (isBlank(input.state)) missing.push('estado')

  if (missing.length > 0) {
    throw new SkydropxValidationError(`No pudimos cotizar el envío. Faltan: ${missing.join(', ')}.`)
  }

  let postalCode: string
  try {
    postalCode = normalizeMxPostalCode(input.postalCode)
  } catch {
    throw new SkydropxValidationError('El código postal debe tener 5 dígitos.')
  }

  assertMxCountry(input.country ?? 'MX', 'país de destino')

  return {
    postalCode,
    city: input.city.trim(),
    state: input.state.trim(),
    neighborhood: input.neighborhood?.trim() || input.city.trim(),
    country: 'MX',
  }
}

/**
 * Validates cart package dimensions before Skydropx quotation.
 */
export function validateQuotationParcel(pkg: PackageDimensions): void {
  const invalid: string[] = []

  if (!Number.isFinite(pkg.lengthCm) || pkg.lengthCm <= 0) invalid.push('largo')
  if (!Number.isFinite(pkg.widthCm) || pkg.widthCm <= 0) invalid.push('ancho')
  if (!Number.isFinite(pkg.heightCm) || pkg.heightCm <= 0) invalid.push('alto')
  if (!Number.isFinite(pkg.weightKg) || pkg.weightKg <= 0) invalid.push('peso')

  if (invalid.length > 0) {
    throw new SkydropxValidationError(
      `El paquete debe tener peso y dimensiones válidas. Revisa: ${invalid.join(', ')}.`,
    )
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
