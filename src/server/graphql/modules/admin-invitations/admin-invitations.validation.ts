import { RoleSlug, UserInvitationStatus } from '@prisma/client'
import { z } from 'zod'

const invitationStatusValues = Object.values(UserInvitationStatus) as [string, ...string[]]
const invitableRoleValues = [RoleSlug.CUSTOMER, RoleSlug.ADMIN] as [string, ...string[]]

export const adminUserInvitationsListInputSchema = z.object({
  filter: z
    .object({
      search: z.string().trim().max(120).optional().nullable(),
      status: z.enum(invitationStatusValues).optional().nullable(),
      targetRole: z.enum(invitableRoleValues).optional().nullable(),
    })
    .optional()
    .nullable(),
  limit: z.number().int().min(1).max(100).optional().nullable(),
  offset: z.number().int().min(0).optional().nullable(),
})

export const createUserInvitationInputSchema = z.object({
  email: z.string().trim().email().max(254),
  targetRole: z.enum(invitableRoleValues),
})

export const invitationIdInputSchema = z.object({
  id: z.string().uuid(),
})

export function parseAdminUserInvitationsListInput(input: unknown) {
  const parsed = adminUserInvitationsListInputSchema.parse(input ?? {})
  return {
    filter: parsed.filter ?? undefined,
    limit: parsed.limit ?? 25,
    offset: parsed.offset ?? 0,
  }
}

export function parseCreateUserInvitationInput(input: unknown) {
  const parsed = createUserInvitationInputSchema.parse(input)
  return {
    email: parsed.email.trim().toLowerCase(),
    targetRole: parsed.targetRole as RoleSlug,
  }
}

export function parseInvitationIdInput(input: unknown) {
  return invitationIdInputSchema.parse(input)
}

export function normalizeInvitationEmail(email: string): string {
  return email.trim().toLowerCase()
}
