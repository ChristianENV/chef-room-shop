import 'server-only'

import { createHash, randomBytes } from 'crypto'

/**
 * Generates a cryptographically random user invitation token (base64url).
 */
export function generateUserInvitationToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * SHA-256 hex digest of the invitation token for DB storage.
 */
export function hashUserInvitationToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}
