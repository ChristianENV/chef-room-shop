import 'server-only'

import { createHash, randomBytes } from 'crypto'

import type { Order } from '@prisma/client'

import { prisma } from '@/src/server/db/prisma'

const DEFAULT_EXPIRES_IN_HOURS = 48

export type CheckoutReturnTokenValidationReason = 'NOT_FOUND' | 'EXPIRED' | 'USED'

/**
 * Generates a cryptographically random checkout return token (base64url).
 */
export function generateCheckoutReturnToken(): string {
  return randomBytes(32).toString('base64url')
}

/**
 * SHA-256 hex digest of the return token for DB storage.
 */
export function hashCheckoutReturnToken(token: string): string {
  return createHash('sha256').update(token, 'utf8').digest('hex')
}

/**
 * Persists a hashed return token for post-Conekta success lookup.
 * Returns the plain token once (for URL only).
 */
export async function createCheckoutReturnToken(input: {
  orderId: string
  expiresInHours?: number
}): Promise<{ token: string; expiresAt: Date }> {
  const token = generateCheckoutReturnToken()
  const tokenHash = hashCheckoutReturnToken(token)
  const expiresInHours = input.expiresInHours ?? DEFAULT_EXPIRES_IN_HOURS
  const expiresAt = new Date()
  expiresAt.setHours(expiresAt.getHours() + expiresInHours)

  await prisma.checkoutReturnToken.upsert({
    where: { orderId: input.orderId },
    create: {
      orderId: input.orderId,
      tokenHash,
      expiresAt,
    },
    update: {
      tokenHash,
      expiresAt,
      usedAt: null,
    },
  })

  return { token, expiresAt }
}

/**
 * Validates a checkout return token and returns the associated order when valid.
 */
export async function validateCheckoutReturnToken(token: string): Promise<{
  valid: boolean
  reason?: CheckoutReturnTokenValidationReason
  order?: Order
  expiresAt?: Date
  returnTokenId?: string
}> {
  const tokenHash = hashCheckoutReturnToken(token)

  const returnToken = await prisma.checkoutReturnToken.findUnique({
    where: { tokenHash },
    include: { order: true },
  })

  if (!returnToken) {
    return { valid: false, reason: 'NOT_FOUND' }
  }

  if (returnToken.usedAt) {
    return {
      valid: false,
      reason: 'USED',
      order: returnToken.order,
      expiresAt: returnToken.expiresAt,
      returnTokenId: returnToken.id,
    }
  }

  if (returnToken.expiresAt.getTime() < Date.now()) {
    return {
      valid: false,
      reason: 'EXPIRED',
      order: returnToken.order,
      expiresAt: returnToken.expiresAt,
      returnTokenId: returnToken.id,
    }
  }

  return {
    valid: true,
    order: returnToken.order,
    expiresAt: returnToken.expiresAt,
    returnTokenId: returnToken.id,
  }
}
