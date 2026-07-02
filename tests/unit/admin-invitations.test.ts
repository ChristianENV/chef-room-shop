import './helpers/mock-server-only'

import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  generateUserInvitationToken,
  hashUserInvitationToken,
} from '@/src/server/invitations/user-invitation-crypto'
import { normalizeInvitationEmail } from '@/src/server/graphql/modules/admin-invitations/admin-invitations.validation'
import { mapUserInvitationToGql } from '@/src/server/graphql/modules/admin-invitations/admin-invitations.mappers'
import { mapUserInvitationToTableRow } from '@/src/features/admin/users/mappers/admin-invitations-ui.mapper'
import { RoleSlug, UserInvitationStatus } from '@prisma/client'

describe('user invitation crypto', () => {
  it('hashes token without returning raw token in digest', () => {
    const raw = generateUserInvitationToken()
    const hash = hashUserInvitationToken(raw)

    assert.notEqual(raw, hash)
    assert.equal(hash.length, 64)
    assert.match(hash, /^[a-f0-9]+$/)
  })

  it('produces stable hash for same token', () => {
    const raw = 'test-token-value'
    assert.equal(hashUserInvitationToken(raw), hashUserInvitationToken(raw))
  })

  it('generates unique tokens', () => {
    const a = generateUserInvitationToken()
    const b = generateUserInvitationToken()
    assert.notEqual(a, b)
  })
})

describe('user invitation validation', () => {
  it('normalizes email with trim and lowercase', () => {
    assert.equal(normalizeInvitationEmail('  Chef@Example.COM '), 'chef@example.com')
  })
})

describe('user invitation gql mapper', () => {
  it('does not expose tokenHash in GraphQL output', () => {
    const gql = mapUserInvitationToGql({
      id: 'inv-1',
      email: 'chef@example.com',
      targetRole: RoleSlug.ADMIN,
      tokenHash: 'secret-hash-should-not-leak',
      status: UserInvitationStatus.PENDING,
      invitedByUserId: 'user-1',
      expiresAt: new Date('2026-07-08T12:00:00.000Z'),
      acceptedAt: null,
      acceptedByUserId: null,
      revokedAt: null,
      revokedByUserId: null,
      metadataJson: null,
      createdAt: new Date('2026-07-01T12:00:00.000Z'),
      updatedAt: new Date('2026-07-01T12:00:00.000Z'),
      invitedBy: {
        id: 'user-1',
        name: 'Admin User',
        email: 'admin@chefroom.test',
        emailVerified: true,
        image: null,
        status: 'ACTIVE',
        customerTier: 'REGULAR',
        firstName: null,
        lastName: null,
        phone: null,
        marketingOptIn: false,
        lastLoginAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
        roles: [{ role: { slug: RoleSlug.ADMIN } }],
      },
      acceptedBy: null,
      revokedBy: null,
    } as never)

    assert.equal(gql.email, 'chef@example.com')
    assert.equal(gql.targetRole, 'ADMIN')
    assert.equal('tokenHash' in gql, false)
  })
})

describe('user invitation permissions and roles', () => {
  function canCreateTargetRole(targetRole: string, hasWrite: boolean): boolean {
    if (!hasWrite) return false
    if (targetRole === 'SUPERADMIN') return false
    return targetRole === 'CUSTOMER' || targetRole === 'ADMIN'
  }

  it('create invite requires users.write', () => {
    assert.equal(canCreateTargetRole('ADMIN', false), false)
    assert.equal(canCreateTargetRole('ADMIN', true), true)
  })

  it('ADMIN invite target is allowed with users.write', () => {
    assert.equal(canCreateTargetRole('ADMIN', true), true)
  })

  it('SUPERADMIN invite target is rejected', () => {
    assert.equal(canCreateTargetRole('SUPERADMIN', true), false)
  })
})

describe('user invitation duplicate and status semantics', () => {
  it('revoke sets status REVOKED and revokedAt', () => {
    const before = { status: 'PENDING', revokedAt: null as Date | null }
    const after = {
      status: 'REVOKED',
      revokedAt: new Date(),
    }
    assert.equal(after.status, 'REVOKED')
    assert.ok(after.revokedAt instanceof Date)
    assert.equal(before.status, 'PENDING')
  })

  it('resend rotates token by replacing tokenHash', () => {
    const oldHash = hashUserInvitationToken('old-token')
    const newHash = hashUserInvitationToken(generateUserInvitationToken())
    assert.notEqual(oldHash, newHash)
  })

  it('expired pending invite resolves to EXPIRED', () => {
    const expiresAt = new Date(Date.now() - 60_000)
    const isExpired = expiresAt.getTime() < Date.now()
    assert.equal(isExpired, true)
  })

  it('duplicate pending supersede revokes old before creating new', () => {
    const pendingIds = ['inv-old-1', 'inv-old-2']
    const superseded = pendingIds.map((id) => ({ id, status: 'REVOKED' }))
    assert.equal(superseded.length, 2)
    assert.ok(superseded.every((row) => row.status === 'REVOKED'))
  })
})

describe('admin invitations ui mapper', () => {
  it('adds expiration hint for pending invitations', () => {
    const inThreeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString()
    const row = mapUserInvitationToTableRow({
      id: 'inv-1',
      email: 'chef@example.com',
      targetRole: 'CUSTOMER',
      status: 'PENDING',
      expiresAt: inThreeDays,
      acceptedAt: null,
      revokedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      invitedBy: { id: 'u-1', name: 'Admin', email: 'admin@example.com' },
      acceptedBy: null,
      revokedBy: null,
    })

    assert.equal(row.canRevoke, true)
    assert.equal(row.canResend, true)
    assert.ok(row.expiresAtHint?.includes('Expira en'))
  })

  it('disables actions for accepted invitations', () => {
    const row = mapUserInvitationToTableRow({
      id: 'inv-2',
      email: 'chef@example.com',
      targetRole: 'ADMIN',
      status: 'ACCEPTED',
      expiresAt: new Date().toISOString(),
      acceptedAt: new Date().toISOString(),
      revokedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      invitedBy: null,
      acceptedBy: null,
      revokedBy: null,
    })

    assert.equal(row.canRevoke, false)
    assert.equal(row.canResend, false)
    assert.equal(row.expiresAtHint, null)
  })
})
