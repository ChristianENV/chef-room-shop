import 'server-only'

import type { GuestSession } from '@prisma/client'
import { cookies, headers } from 'next/headers'

import { prisma } from '@/src/server/db/prisma'

import { GUEST_SESSION_COOKIE_NAME, GUEST_SESSION_TTL_DAYS } from './guest-session.constants'
import { generateGuestSessionToken, hashGuestSessionToken } from './guest-session.crypto'

export { generateGuestSessionToken, hashGuestSessionToken } from './guest-session.crypto'

/**
 * Reads the raw guest session token from the request cookie (not hashed).
 */
export async function getGuestSessionTokenFromCookies(): Promise<string | null> {
  const cookieStore = await cookies()
  const value = cookieStore.get(GUEST_SESSION_COOKIE_NAME)?.value
  return value && value.length > 0 ? value : null
}

function guestSessionExpiresAt(): Date {
  const expiresAt = new Date()
  expiresAt.setDate(expiresAt.getDate() + GUEST_SESSION_TTL_DAYS)
  return expiresAt
}

/**
 * Best-effort guard: skip creating guest sessions when the request appears to come from admin.
 */
async function shouldSkipGuestSessionCreation(): Promise<boolean> {
  const headerList = await headers()
  const referer = headerList.get('referer')
  if (!referer) return false
  try {
    return new URL(referer).pathname.startsWith('/admin')
  } catch {
    return false
  }
}

function isGuestSessionUsable(session: GuestSession): boolean {
  if (session.mergedToUserId) return false
  return session.expiresAt > new Date()
}

/**
 * Returns an active guest session from the cookie, or null if missing/expired/merged.
 */
export async function getActiveGuestSessionFromCookies(): Promise<GuestSession | null> {
  const token = await getGuestSessionTokenFromCookies()
  if (!token) return null

  const tokenHash = hashGuestSessionToken(token)
  const session = await prisma.guestSession.findUnique({
    where: { tokenHash },
  })

  if (!session || !isGuestSessionUsable(session)) {
    return null
  }

  return session
}

/**
 * Sets the httpOnly guest session cookie.
 */
export async function setGuestSessionCookie(token: string, expiresAt: Date): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.set(GUEST_SESSION_COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    expires: expiresAt,
  })
}

/**
 * Removes the guest session cookie after a successful merge.
 */
export async function clearGuestSessionCookie(): Promise<void> {
  const cookieStore = await cookies()
  cookieStore.delete(GUEST_SESSION_COOKIE_NAME)
}

/**
 * Resolves or creates a guest session and sets the cookie when new.
 * Call from guest actions (design, cart, checkout) — not on every page view.
 */
export async function getOrCreateGuestSession(): Promise<{
  guestSession: GuestSession
  token: string
  isNew: boolean
}> {
  if (await shouldSkipGuestSessionCreation()) {
    throw new Error('Guest sessions are not created for admin routes.')
  }

  const existingToken = await getGuestSessionTokenFromCookies()
  if (existingToken) {
    const tokenHash = hashGuestSessionToken(existingToken)
    const existing = await prisma.guestSession.findUnique({
      where: { tokenHash },
    })
    if (existing && isGuestSessionUsable(existing)) {
      return {
        guestSession: existing,
        token: existingToken,
        isNew: false,
      }
    }
  }

  const token = generateGuestSessionToken()
  const tokenHash = hashGuestSessionToken(token)
  const expiresAt = guestSessionExpiresAt()

  const guestSession = await prisma.guestSession.create({
    data: {
      tokenHash,
      expiresAt,
    },
  })

  await setGuestSessionCookie(token, expiresAt)

  return { guestSession, token, isNew: true }
}
