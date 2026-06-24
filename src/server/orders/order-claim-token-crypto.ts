import 'server-only'

import { createHash, randomBytes } from 'crypto'

import { maskEmail } from '@/src/lib/email/mask-email'

/**
 * Generates a cryptographically random order claim token (base64url).
 */
export function generateOrderClaimToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * SHA-256 hex digest of the claim token for DB storage.
 */
export function hashOrderClaimToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/**
 * Masks an email for safe display on the claim preview screen.
 */
export function maskCustomerEmail(email: string): string {
  return maskEmail(email)
}
