import 'server-only'

import { prisma } from '@/src/server/db/prisma'

import { buildAuth } from './build-auth'

/**
 * Better Auth server instance (sessions, accounts, email/password, social).
 */
export const auth = buildAuth(prisma)
