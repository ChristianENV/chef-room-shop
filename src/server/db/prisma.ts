import 'server-only'

import { createPrismaClient } from './create-prisma'

/**
 * Shared Prisma client singleton (Next.js server / API routes).
 */
export const prisma = createPrismaClient()
