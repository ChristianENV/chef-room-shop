import { SkydropxValidationError } from './skydropx.validation-errors'

/**
 * Normalizes a Mexican phone to 10 digits for Skydropx (no +52 prefix).
 *
 * @example +529981234567 → 9981234567
 */
export function normalizeMxPhoneForSkydropx(phone: string): string {
  const digits = phone.replace(/\D/g, '')

  if (digits.length === 10) {
    return digits
  }

  if (digits.length === 12 && digits.startsWith('52')) {
    return digits.slice(2)
  }

  if (digits.length === 13 && digits.startsWith('521')) {
    return digits.slice(3)
  }

  throw new SkydropxValidationError(
    'El teléfono debe tener 10 dígitos para generar la guía.',
  )
}

/**
 * Returns true when the value can be normalized to 10 MX digits.
 */
export function isNormalizableMxPhone(phone: string): boolean {
  try {
    normalizeMxPhoneForSkydropx(phone)
    return true
  } catch {
    return false
  }
}
