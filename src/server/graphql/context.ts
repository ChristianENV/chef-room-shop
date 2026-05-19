import type { PrismaClient } from '@prisma/client'
import type { YogaInitialContext } from 'graphql-yoga'

import { getCurrentUserFromHeaders } from '@/src/server/auth/current-user'
import type { CurrentUser } from '@/src/server/auth/types'
import { prisma } from '@/src/server/db/prisma'

export type GraphQLContext = {
  prisma: PrismaClient
  currentUser: CurrentUser | null
  ipAddress: string | null
  userAgent: string | null
}

/**
 * Builds GraphQL context (Better Auth session + business Prisma).
 * Auth mutations live under `/api/auth/*`, not GraphQL.
 */
export async function createGraphQLContext(
  initialContext: YogaInitialContext,
): Promise<GraphQLContext> {
  const request = initialContext.request
  const currentUser = await getCurrentUserFromHeaders(request.headers)

  return {
    prisma,
    currentUser,
    ipAddress:
      request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
      request.headers.get('x-real-ip') ??
      null,
    userAgent: request.headers.get('user-agent'),
  }
}
