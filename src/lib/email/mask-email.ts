/**
 * Masks an email for safe display (e.g. `c***e@restaurante.com`).
 */
export function maskEmail(email: string): string {
  const normalized = email.trim().toLowerCase()
  const at = normalized.indexOf('@')
  if (at <= 0) return '***'

  const local = normalized.slice(0, at)
  const domain = normalized.slice(at + 1)

  if (local.length <= 1) {
    return `${local}***@${domain}`
  }

  return `${local[0]}***${local[local.length - 1]}@${domain}`
}

/** @deprecated Use maskEmail */
export const maskCustomerEmail = maskEmail
