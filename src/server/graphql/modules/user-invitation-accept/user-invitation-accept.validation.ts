import { z } from 'zod'

export const userInvitationTokenSchema = z.string().trim().min(1).max(256)

export function parseUserInvitationToken(input: unknown): string {
  return userInvitationTokenSchema.parse(input)
}
