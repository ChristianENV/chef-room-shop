'use server'

import { headers } from 'next/headers'

import {
  clearGuestSessionCookie,
  getActiveGuestSessionFromCookies,
} from '@/src/server/guest/guest-session'
import { mergeGuestSessionIntoUser } from '@/src/server/guest/merge-guest-session'
import type { GuestMergeResult } from '@/src/server/guest/guest-merge.types'

import { auth } from './better-auth'
import { ensureCustomerRole, userHasAdminAccess } from './roles'

type ActionResult =
  | { ok: true }
  | { ok: false; message: string }

/**
 * Assigns CUSTOMER role to the current session user (post sign-up / OAuth).
 */
export async function ensureCustomerRoleAction(): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return { ok: false, message: 'No hay sesión activa.' }
  }

  await ensureCustomerRole(session.user.id)
  return { ok: true }
}

/**
 * Verifies the current session user may access the admin panel.
 */
export async function assertAdminAccessAction(): Promise<ActionResult> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return { ok: false, message: 'Debes iniciar sesión.' }
  }

  const allowed = await userHasAdminAccess(session.user.id)

  if (!allowed) {
    return {
      ok: false,
      message: 'No tienes permisos para acceder al dashboard.',
    }
  }

  return { ok: true }
}

/**
 * Merges the current cookie guest session into the authenticated user (idempotent).
 * Clears the guest cookie after a successful merge. Returns null when there is nothing to merge.
 */
export async function mergeCurrentGuestSessionAction(): Promise<GuestMergeResult | null> {
  const session = await auth.api.getSession({
    headers: await headers(),
  })

  if (!session?.user?.id) {
    return null
  }

  const guestSession = await getActiveGuestSessionFromCookies()
  if (!guestSession) {
    return null
  }

  const result = await mergeGuestSessionIntoUser({
    userId: session.user.id,
    guestSessionId: guestSession.id,
  })

  if (result.merged && !result.conflict) {
    await clearGuestSessionCookie()
  }

  return result
}
