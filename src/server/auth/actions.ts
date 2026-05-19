'use server'

import { headers } from 'next/headers'

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
