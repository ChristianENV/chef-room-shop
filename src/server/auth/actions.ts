'use server'

import { headers } from 'next/headers'

import { routes } from '@/src/config/routes'

import {
  clearGuestSessionCookie,
  getActiveGuestSessionFromCookies,
} from '@/src/server/guest/guest-session'
import { mergeGuestSessionIntoUser } from '@/src/server/guest/merge-guest-session'
import type { GuestMergeResult } from '@/src/server/guest/guest-merge.types'

import { auth } from './better-auth'
import { getCurrentUser } from './current-user'
import {
  getPostAuthRedirectPath,
  type PostAuthRedirectSource,
} from './redirects'
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

/**
 * Returns redirect target for the current session user, or unauthenticated state.
 */
export async function getCurrentUserRedirectAction(): Promise<{
  authenticated: boolean
  redirectTo: string | null
  isAdmin: boolean
  customerTier: string | null
}> {
  const user = await getCurrentUser()

  if (!user) {
    return { authenticated: false, redirectTo: null, isAdmin: false, customerTier: null }
  }

  const isAdmin = await userHasAdminAccess(user.id)

  return {
    authenticated: true,
    redirectTo: getPostAuthRedirectPath({ roles: user.roles }),
    isAdmin,
    customerTier: user.customerTier,
  }
}

/**
 * Resolves where to send the user immediately after sign-in/sign-up (role-aware).
 */
export async function getPostLoginRedirectAction(params?: {
  source?: PostAuthRedirectSource
  callbackUrl?: string | null
}): Promise<string> {
  const user = await getCurrentUser()

  if (!user) {
    return routes.home
  }

  return getPostAuthRedirectPath({
    roles: user.roles,
    fallback: params?.callbackUrl,
    source: params?.source ?? 'storefront-login',
  })
}

const RESEND_VERIFICATION_GENERIC_MESSAGE =
  'Si el correo existe, enviaremos un enlace de verificación.'

/**
 * Resends the Better Auth verification email (generic response; does not reveal if email exists).
 */
export async function resendVerificationEmailAction(params?: {
  email?: string | null
  callbackURL?: string | null
}): Promise<{ ok: true; message: string }> {
  try {
    const requestHeaders = await headers()
    const session = await auth.api.getSession({ headers: requestHeaders })
    const targetEmail =
      params?.email?.trim().toLowerCase() ?? session?.user?.email?.trim().toLowerCase()

    if (!targetEmail) {
      return { ok: true, message: RESEND_VERIFICATION_GENERIC_MESSAGE }
    }

    if (session?.user?.emailVerified) {
      return { ok: true, message: RESEND_VERIFICATION_GENERIC_MESSAGE }
    }

    const callbackURL = params?.callbackURL?.trim() || routes.account

    await auth.api.sendVerificationEmail({
      body: {
        email: targetEmail,
        callbackURL,
      },
      headers: requestHeaders,
    })
  } catch {
    // Do not reveal whether the email exists or send failed.
  }

  return { ok: true, message: RESEND_VERIFICATION_GENERIC_MESSAGE }
}
