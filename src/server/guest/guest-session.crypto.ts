import { createHash, randomBytes } from 'crypto'

/**
 * SHA-256 hex digest of the guest token for DB storage (`GuestSession.tokenHash`).
 */
export function hashGuestSessionToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/**
 * Generates a cryptographically random guest session token (base64url).
 */
export function generateGuestSessionToken(): string {
  return randomBytes(32).toString('base64url')
}
