import 'server-only'

import { prisma } from '@/src/server/db/prisma'

export type RecordLoginAttemptInput = {
  email: string
  success: boolean
  userId?: string | null
  ipAddress?: string | null
}

/**
 * Records a login or registration authentication attempt for audit/rate limiting.
 */
export async function recordLoginAttempt(input: RecordLoginAttemptInput): Promise<void> {
  await prisma.loginAttempt.create({
    data: {
      email: input.email.toLowerCase(),
      success: input.success,
      userId: input.userId ?? null,
      ipAddress: input.ipAddress ?? null,
    },
  })
}
