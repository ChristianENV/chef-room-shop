import { createAuthClient } from 'better-auth/react'

const baseURL =
  process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ??
  'http://localhost:3000'

/**
 * Better Auth browser client (for future login/register UI).
 */
export const authClient = createAuthClient({
  baseURL,
})

export const { signIn, signUp, signOut, useSession } = authClient
