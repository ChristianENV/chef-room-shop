import { createAuthClient } from 'better-auth/react'
import { inferAdditionalFields } from 'better-auth/client/plugins'

const baseURL = process.env.NEXT_PUBLIC_APP_URL?.replace(/\/$/, '') ?? 'http://localhost:3000'

/**
 * Better Auth browser client for storefront and admin UI.
 */
export const authClient = createAuthClient({
  baseURL,
  plugins: [
    inferAdditionalFields({
      user: {
        firstName: { type: 'string', required: false },
        lastName: { type: 'string', required: false },
        phone: { type: 'string', required: false },
        marketingOptIn: { type: 'boolean', required: false },
      },
    }),
  ],
})

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  sendVerificationEmail,
  requestPasswordReset,
  resetPassword,
} = authClient
