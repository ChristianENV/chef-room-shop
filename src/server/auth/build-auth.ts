import { betterAuth } from 'better-auth'
import { prismaAdapter } from '@better-auth/prisma-adapter'
import type { PrismaClient } from '@prisma/client'

import { ensureCustomerRole } from './roles-core'

export type BuildAuthOptions = {
  /** Skip transactional email callbacks (Prisma seed / CLI scripts). */
  disableEmailCallbacks?: boolean
}

/**
 * Builds trusted origins for Better Auth CSRF / callback validation.
 */
export function getBetterAuthTrustedOrigins(): string[] {
  const origins = new Set<string>()

  if (process.env.BETTER_AUTH_URL) {
    origins.add(process.env.BETTER_AUTH_URL.replace(/\/$/, ''))
  }
  if (process.env.NEXT_PUBLIC_APP_URL) {
    origins.add(process.env.NEXT_PUBLIC_APP_URL.replace(/\/$/, ''))
  }
  if (process.env.NODE_ENV !== 'production') {
    origins.add('http://localhost:3000')
  }

  return [...origins]
}

/**
 * Creates a Better Auth instance bound to the given Prisma client.
 * Used by the app singleton and by `prisma/seed.ts` (no `server-only` import).
 */
export function buildAuth(database: PrismaClient, options: BuildAuthOptions = {}) {
  const disableEmailCallbacks = options.disableEmailCallbacks ?? false
  const googleClientId = process.env.GOOGLE_CLIENT_ID
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET

  const socialProviders =
    googleClientId && googleClientSecret
      ? {
          google: {
            clientId: googleClientId,
            clientSecret: googleClientSecret,
            mapProfileToUser: (profile: {
              given_name?: string
              family_name?: string
              name?: string
              picture?: string
            }) => ({
              firstName: profile.given_name ?? profile.name?.split(' ')[0] ?? undefined,
              lastName:
                profile.family_name ?? profile.name?.split(' ').slice(1).join(' ') ?? undefined,
              image: profile.picture,
            }),
          },
        }
      : undefined

  return betterAuth({
    database: prismaAdapter(database, {
      provider: 'postgresql',
    }),
    secret: process.env.BETTER_AUTH_SECRET,
    baseURL: process.env.BETTER_AUTH_URL,
    trustedOrigins: getBetterAuthTrustedOrigins(),
    emailAndPassword: {
      enabled: true,
      resetPasswordTokenExpiresIn: 3600,
      revokeSessionsOnPasswordReset: true,
      sendResetPassword: disableEmailCallbacks
        ? undefined
        : async ({ user, url }) => {
            const { sendBetterAuthResetPasswordEmail } = await import('./send-reset-password-email')
            sendBetterAuthResetPasswordEmail({
              to: user.email,
              userId: user.id,
              resetPasswordUrl: url,
            })
          },
    },
    emailVerification: {
      sendOnSignUp: !disableEmailCallbacks,
      autoSignInAfterVerification: true,
      sendVerificationEmail: disableEmailCallbacks
        ? undefined
        : async ({ user, url }) => {
            const { sendBetterAuthVerificationEmail } = await import('./send-verification-email')
            sendBetterAuthVerificationEmail({
              to: user.email,
              userId: user.id,
              verificationUrl: url,
            })
          },
    },
    socialProviders,
    user: {
      additionalFields: {
        firstName: {
          type: 'string',
          required: false,
          input: true,
        },
        lastName: {
          type: 'string',
          required: false,
          input: true,
        },
        phone: {
          type: 'string',
          required: false,
          input: true,
        },
        status: {
          type: 'string',
          required: false,
          defaultValue: 'ACTIVE',
          input: false,
        },
        marketingOptIn: {
          type: 'boolean',
          required: false,
          defaultValue: false,
          input: true,
        },
        customerTier: {
          type: 'string',
          required: false,
          defaultValue: 'REGULAR',
          input: false,
        },
        deletedAt: {
          type: 'date',
          required: false,
          input: false,
        },
        lastLoginAt: {
          type: 'date',
          required: false,
          input: false,
        },
      },
    },
    advanced: {
      database: {
        generateId: 'uuid',
      },
    },
    databaseHooks: {
      user: {
        create: {
          after: async (user) => {
            if (user.id) {
              await ensureCustomerRole(database, user.id)
            }
          },
        },
      },
    },
  })
}
