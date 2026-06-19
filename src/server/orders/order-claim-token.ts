import 'server-only'

import { createHash, randomBytes } from 'crypto'

import type { Order } from '@prisma/client'

import { prisma } from '@/src/server/db/prisma'
import { maskEmail } from '@/src/lib/email/mask-email'

const DEFAULT_EXPIRES_IN_DAYS = 14

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
 * Persists a hashed claim token for a guest order. Returns the plain token once (for email/URL only).
 */
export async function createOrderClaimToken(input: {
  orderId: string
  sentToEmail: string
  expiresInDays?: number
}): Promise<{ token: string; expiresAt: Date }> {
  const token = generateOrderClaimToken()
  const tokenHash = hashOrderClaimToken(token)
  const expiresInDays = input.expiresInDays ?? DEFAULT_EXPIRES_IN_DAYS
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + expiresInDays)

  await prisma.orderClaimToken.create({
    data: {
      orderId: input.orderId,
      tokenHash,
      sentToEmail: input.sentToEmail.trim().toLowerCase(),
      expiresAt,
    },
  })

  return { token, expiresAt }
}

export type OrderClaimTokenValidationReason = 'NOT_FOUND' | 'EXPIRED' | 'USED'

/**
 * Validates a claim token and returns the associated order when valid.
 */
export async function validateOrderClaimToken(token: string): Promise<{
  valid: boolean
  reason?: OrderClaimTokenValidationReason
  order?: Order
  expiresAt?: Date
  claimTokenId?: string
}> {
  const tokenHash = hashOrderClaimToken(token)

  const claimToken = await prisma.orderClaimToken.findUnique({
    where: { tokenHash },
    include: { order: true },
  })

  if (!claimToken) {
    return { valid: false, reason: 'NOT_FOUND' }
  }

  if (claimToken.usedAt) {
    return {
      valid: false,
      reason: 'USED',
      order: claimToken.order,
      expiresAt: claimToken.expiresAt,
    }
  }

  if (claimToken.expiresAt.getTime() < Date.now()) {
    return {
      valid: false,
      reason: 'EXPIRED',
      order: claimToken.order,
      expiresAt: claimToken.expiresAt,
    }
  }

  return {
    valid: true,
    order: claimToken.order,
    expiresAt: claimToken.expiresAt,
    claimTokenId: claimToken.id,
  }
}

/**
 * Masks an email for safe display on the claim preview screen.
 */
export function maskCustomerEmail(email: string): string {
  return maskEmail(email)
}
