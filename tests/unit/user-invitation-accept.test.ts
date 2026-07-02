import { config } from 'dotenv'
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { AuditAction, RoleSlug, UserInvitationStatus, UserStatus } from '@prisma/client'
import { GraphQLError } from 'graphql'

import type { CurrentUser } from '@/src/server/auth/types'
import type { GraphQLContext } from '@/src/server/graphql/context'
import { canRunDbIntegrationTests } from './helpers/db-integration'

config({ path: '.env.local' })

const hasDatabase = canRunDbIntegrationTests()

async function loadModules() {
  await import('./helpers/mock-server-only')
  const [acceptService, crypto, rolesCore] = await Promise.all([
    import('@/src/server/invitations/user-invitation-accept.service'),
    import('@/src/server/invitations/user-invitation-crypto'),
    import('@/src/server/auth/roles-core'),
  ])
  return { ...acceptService, ...crypto, ...rolesCore }
}

async function loadPrisma() {
  await import('./helpers/mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

function buildUser(
  overrides: Partial<CurrentUser> & Pick<CurrentUser, 'id' | 'email'>,
): CurrentUser {
  return {
    id: overrides.id,
    email: overrides.email,
    emailVerified: overrides.emailVerified ?? true,
    name: overrides.name ?? 'Test User',
    firstName: overrides.firstName ?? null,
    lastName: overrides.lastName ?? null,
    phone: overrides.phone ?? null,
    image: overrides.image ?? null,
    customerTier: overrides.customerTier ?? 'REGULAR',
    roles: overrides.roles ?? ['CUSTOMER'],
    permissions: overrides.permissions ?? [],
  }
}

function buildContext(prisma: GraphQLContext['prisma'], user: CurrentUser | null): GraphQLContext {
  return {
    prisma,
    currentUser: user,
    ipAddress: null,
    userAgent: null,
  }
}

function buildPreviewMockPrisma(): GraphQLContext['prisma'] {
  return {
    userInvitation: {
      findUnique: async () => null,
    },
    user: {
      findUnique: async () => null,
    },
  } as unknown as GraphQLContext['prisma']
}

describe('previewUserInvitation', () => {
  it('returns safe error for invalid token without tokenHash', async () => {
    const { previewUserInvitation } = await loadModules()

    const preview = await previewUserInvitation(buildContext(buildPreviewMockPrisma(), null), '   ')

    assert.equal(preview.valid, false)
    assert.equal(preview.maskedEmail, null)
    assert.equal('tokenHash' in preview, false)
  })

  it('returns generic error for unknown token', async () => {
    const { previewUserInvitation } = await loadModules()

    const preview = await previewUserInvitation(
      buildContext(buildPreviewMockPrisma(), null),
      'unknown-token-value',
    )

    assert.equal(preview.valid, false)
    assert.equal(preview.email, null)
    assert.ok(preview.message)
    assert.equal('tokenHash' in preview, false)
  })
})

describe('acceptUserInvitation auth guard', () => {
  it('requires authenticated user', async () => {
    const { acceptUserInvitation } = await loadModules()

    await assert.rejects(
      () => acceptUserInvitation(buildContext(buildPreviewMockPrisma(), null), 'some-token'),
      (error: unknown) => {
        assert.ok(error instanceof GraphQLError)
        assert.equal((error as GraphQLError).extensions?.code, 'UNAUTHENTICATED')
        return true
      },
    )
  })
})

describe('assignRoleIfMissing', () => {
  it('rejects SUPERADMIN assignment', async () => {
    const { assignRoleIfMissing } = await loadModules()

    await assert.rejects(
      () => assignRoleIfMissing(buildPreviewMockPrisma(), 'user-id', RoleSlug.SUPERADMIN),
      /SUPERADMIN role cannot be assigned/,
    )
  })
})

describe('user invitation accept integration', { skip: !hasDatabase }, () => {
  const cleanup = {
    invitationIds: [] as string[],
    userIds: [] as string[],
    auditLogIds: [] as string[],
  }

  after(async () => {
    const { prisma } = await loadPrisma()

    if (cleanup.auditLogIds.length > 0) {
      await prisma.auditLog.deleteMany({ where: { id: { in: cleanup.auditLogIds } } })
    }

    if (cleanup.invitationIds.length > 0) {
      await prisma.userInvitation.deleteMany({ where: { id: { in: cleanup.invitationIds } } })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.userRole.deleteMany({ where: { userId: { in: cleanup.userIds } } })
      await prisma.auditLog.deleteMany({ where: { userId: { in: cleanup.userIds } } })
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  async function createInviter() {
    const { prisma } = await loadPrisma()
    const inviter = await prisma.user.create({
      data: {
        name: 'Inviter',
        email: `inviter-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(inviter.id)
    return inviter
  }

  async function createInvitation(params: {
    email: string
    targetRole: RoleSlug
    status?: UserInvitationStatus
    expiresAt?: Date
    rawToken?: string
  }) {
    const { prisma } = await loadPrisma()
    const { generateUserInvitationToken, hashUserInvitationToken } = await loadModules()
    const inviter = await createInviter()
    const token = params.rawToken ?? generateUserInvitationToken()

    const invitation = await prisma.userInvitation.create({
      data: {
        email: params.email.trim().toLowerCase(),
        targetRole: params.targetRole,
        tokenHash: hashUserInvitationToken(token),
        status: params.status ?? UserInvitationStatus.PENDING,
        invitedByUserId: inviter.id,
        expiresAt: params.expiresAt ?? new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      },
    })

    cleanup.invitationIds.push(invitation.id)
    return { invitation, token, inviter }
  }

  async function createAcceptingUser(email: string, status: UserStatus = UserStatus.ACTIVE) {
    const { prisma } = await loadPrisma()
    const user = await prisma.user.create({
      data: {
        name: 'Invitee',
        email,
        emailVerified: true,
        status,
      },
    })
    cleanup.userIds.push(user.id)
    return user
  }

  it('preview returns masked email and existingUserHint for pending invite', async () => {
    const { previewUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `preview-${Date.now()}@example.com`
    const { token } = await createInvitation({ email, targetRole: RoleSlug.CUSTOMER })

    const preview = await previewUserInvitation(buildContext(prisma, null), token)

    assert.equal(preview.valid, true)
    assert.equal(preview.status, UserInvitationStatus.PENDING)
    assert.ok(preview.maskedEmail?.includes('@'))
    assert.equal(preview.email, email)
    assert.equal(preview.existingUserHint, 'new')
    assert.equal('tokenHash' in preview, false)
  })

  it('preview reports accepted status', async () => {
    const { previewUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `accepted-preview-${Date.now()}@example.com`
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
      status: UserInvitationStatus.ACCEPTED,
    })

    const preview = await previewUserInvitation(buildContext(prisma, null), token)

    assert.equal(preview.valid, false)
    assert.equal(preview.status, UserInvitationStatus.ACCEPTED)
    assert.equal(preview.email, null)
    assert.ok(preview.message?.includes('aceptada'))
  })

  it('preview reports revoked status', async () => {
    const { previewUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `revoked-preview-${Date.now()}@example.com`
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
      status: UserInvitationStatus.REVOKED,
    })

    const preview = await previewUserInvitation(buildContext(prisma, null), token)

    assert.equal(preview.valid, false)
    assert.equal(preview.status, UserInvitationStatus.REVOKED)
    assert.ok(preview.message?.includes('revocada'))
  })

  it('preview marks expired pending invitations', async () => {
    const { previewUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `expired-preview-${Date.now()}@example.com`
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
      expiresAt: new Date(Date.now() - 60_000),
    })

    const preview = await previewUserInvitation(buildContext(prisma, null), token)

    assert.equal(preview.valid, false)
    assert.equal(preview.status, UserInvitationStatus.EXPIRED)
    assert.equal(preview.isExpired, true)
  })

  it('accept rejects wrong email', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `wrong-email-${Date.now()}@example.com`
    const other = await createAcceptingUser(`other-${Date.now()}@example.com`)
    const { token } = await createInvitation({ email, targetRole: RoleSlug.CUSTOMER })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: other.id, email: other.email })),
      token,
    )

    assert.equal(result.success, false)
    assert.ok(result.message?.includes('correo'))
  })

  it('accept rejects expired invite', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `expired-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email)
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
      expiresAt: new Date(Date.now() - 60_000),
    })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, false)
    assert.ok(result.message?.includes('expir'))
  })

  it('accept rejects revoked invite', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `revoked-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email)
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
      status: UserInvitationStatus.REVOKED,
    })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, false)
    assert.ok(result.message?.includes('revocada'))
  })

  it('accept rejects deleted/blocked user', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `blocked-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email, UserStatus.DELETED)
    await prisma.user.update({
      where: { id: user.id },
      data: { deletedAt: new Date() },
    })
    const { token } = await createInvitation({ email, targetRole: RoleSlug.CUSTOMER })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, false)
    assert.ok(result.message?.toLowerCase().includes('bloqueada'))
  })

  it('accept rejects suspended user', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `suspended-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email, UserStatus.SUSPENDED)
    const { token } = await createInvitation({ email, targetRole: RoleSlug.CUSTOMER })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, false)
    assert.ok(result.message?.includes('suspendida'))
  })

  it('accept rejects SUPERADMIN invite', async () => {
    const { acceptUserInvitation } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `superadmin-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email)
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.SUPERADMIN,
    })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, false)
  })

  it('accept assigns CUSTOMER role idempotently and marks invitation accepted', async () => {
    const { acceptUserInvitation, getUserRolesAndPermissions } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `customer-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email)
    const { token, invitation } = await createInvitation({
      email,
      targetRole: RoleSlug.CUSTOMER,
    })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, true)
    assert.equal(result.targetRole, RoleSlug.CUSTOMER)

    const roles = await getUserRolesAndPermissions(prisma, user.id)
    assert.ok(roles.roles.includes(RoleSlug.CUSTOMER))

    const updated = await prisma.userInvitation.findUnique({ where: { id: invitation.id } })
    assert.equal(updated?.status, UserInvitationStatus.ACCEPTED)
    assert.ok(updated?.acceptedAt)
    assert.equal(updated?.acceptedByUserId, user.id)

    const audit = await prisma.auditLog.findFirst({
      where: {
        entityType: 'UserInvitation',
        entityId: invitation.id,
        userId: user.id,
        action: AuditAction.UPDATE,
      },
    })
    assert.ok(audit)
    if (audit) cleanup.auditLogIds.push(audit.id)

    const second = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )
    assert.equal(second.success, false)
  })

  it('accept assigns ADMIN role and ensures CUSTOMER role', async () => {
    const { acceptUserInvitation, getUserRolesAndPermissions } = await loadModules()
    const { prisma } = await loadPrisma()
    const email = `admin-accept-${Date.now()}@example.com`
    const user = await createAcceptingUser(email)
    const { token } = await createInvitation({
      email,
      targetRole: RoleSlug.ADMIN,
    })

    const result = await acceptUserInvitation(
      buildContext(prisma, buildUser({ id: user.id, email: user.email })),
      token,
    )

    assert.equal(result.success, true)
    assert.equal(result.targetRole, RoleSlug.ADMIN)

    const roles = await getUserRolesAndPermissions(prisma, user.id)
    assert.ok(roles.roles.includes(RoleSlug.ADMIN))
    assert.ok(roles.roles.includes(RoleSlug.CUSTOMER))
  })
})
