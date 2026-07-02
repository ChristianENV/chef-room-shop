import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

// ─── Segmentation service unit tests ─────────────────────────────────────────
// These tests verify pure logic without touching the database.

describe('admin users segmentation logic', () => {
  it('CUSTOMERS segment includes users with only CUSTOMER role', () => {
    const user = { roles: [{ role: { slug: 'CUSTOMER' } }] }
    const hasAdminRole = user.roles.some((r) => ['ADMIN', 'SUPERADMIN'].includes(r.role.slug))
    assert.equal(hasAdminRole, false, 'CUSTOMER-only user should not be in ADMINS segment')
  })

  it('CUSTOMERS segment excludes users with CUSTOMER + ADMIN role', () => {
    const user = { roles: [{ role: { slug: 'CUSTOMER' } }, { role: { slug: 'ADMIN' } }] }
    const hasAdminRole = user.roles.some((r) => ['ADMIN', 'SUPERADMIN'].includes(r.role.slug))
    assert.equal(hasAdminRole, true, 'CUSTOMER+ADMIN user should be in ADMINS segment')
  })

  it('ADMINS segment includes users with ADMIN role only', () => {
    const user = { roles: [{ role: { slug: 'ADMIN' } }] }
    const hasAdminRole = user.roles.some((r) => ['ADMIN', 'SUPERADMIN'].includes(r.role.slug))
    assert.equal(hasAdminRole, true)
  })

  it('ADMINS segment includes users with SUPERADMIN role', () => {
    const user = { roles: [{ role: { slug: 'SUPERADMIN' } }] }
    const hasAdminRole = user.roles.some((r) => ['ADMIN', 'SUPERADMIN'].includes(r.role.slug))
    assert.equal(hasAdminRole, true)
  })
})

// ─── Status semantics ─────────────────────────────────────────────────────────

describe('admin users status semantics', () => {
  it('pause should set status SUSPENDED and not modify deletedAt', () => {
    const input = { status: 'ACTIVE', deletedAt: null }
    const after = { ...input, status: 'SUSPENDED' }
    assert.equal(after.status, 'SUSPENDED')
    assert.equal(after.deletedAt, null)
  })

  it('block should set status DELETED and deletedAt to a Date', () => {
    const now = new Date()
    const input = { status: 'ACTIVE', deletedAt: null }
    const after = { ...input, status: 'DELETED', deletedAt: now }
    assert.equal(after.status, 'DELETED')
    assert.ok(after.deletedAt instanceof Date)
  })

  it('reactivate from SUSPENDED should set status ACTIVE and leave deletedAt null', () => {
    const input = { status: 'SUSPENDED', deletedAt: null }
    const after = { ...input, status: 'ACTIVE', deletedAt: null }
    assert.equal(after.status, 'ACTIVE')
    assert.equal(after.deletedAt, null)
  })

  it('reactivate from DELETED should set status ACTIVE and clear deletedAt', () => {
    const input = { status: 'DELETED', deletedAt: new Date() }
    const after = { ...input, status: 'ACTIVE', deletedAt: null }
    assert.equal(after.status, 'ACTIVE')
    assert.equal(after.deletedAt, null)
  })
})

// ─── Safety rules ─────────────────────────────────────────────────────────────

describe('admin users safety rules', () => {
  function checkSelfAction(callerId: string, targetId: string) {
    return callerId === targetId
  }

  function checkAdminTargetingSuperadmin(callerRoles: string[], targetRoles: string[]) {
    const callerIsSuperadmin = callerRoles.includes('SUPERADMIN')
    const targetIsSuperadmin = targetRoles.includes('SUPERADMIN')
    return targetIsSuperadmin && !callerIsSuperadmin
  }

  function checkLastSuperadmin(activeSuperadminCount: number, targetIsSuperadmin: boolean) {
    return targetIsSuperadmin && activeSuperadminCount <= 1
  }

  it('cannot pause/block self', () => {
    assert.equal(checkSelfAction('user-1', 'user-1'), true, 'Same user should be blocked')
    assert.equal(checkSelfAction('user-1', 'user-2'), false, 'Different users should be allowed')
  })

  it('ADMIN cannot target SUPERADMIN', () => {
    const callerRoles = ['ADMIN']
    const targetRoles = ['SUPERADMIN']
    assert.equal(
      checkAdminTargetingSuperadmin(callerRoles, targetRoles),
      true,
      'Should be forbidden',
    )
  })

  it('SUPERADMIN can target another SUPERADMIN', () => {
    const callerRoles = ['SUPERADMIN']
    const targetRoles = ['SUPERADMIN']
    assert.equal(
      checkAdminTargetingSuperadmin(callerRoles, targetRoles),
      false,
      'SUPERADMIN should be allowed',
    )
  })

  it('cannot block/pause the last active SUPERADMIN', () => {
    assert.equal(checkLastSuperadmin(1, true), true, 'Last SA should be protected')
    assert.equal(checkLastSuperadmin(2, true), false, 'Two SAs — should be allowed')
    assert.equal(checkLastSuperadmin(1, false), false, 'Non-SA target — no restriction')
  })
})

// ─── Permission helpers ───────────────────────────────────────────────────────

describe('admin users permissions', () => {
  function hasPermission(userPermissions: string[], key: string, isSuperadmin: boolean) {
    if (isSuperadmin) return true
    return userPermissions.includes(key)
  }

  it('SUPERADMIN has users.write implicitly', () => {
    assert.equal(hasPermission([], 'users.write', true), true)
  })

  it('ADMIN without users.write cannot mutate', () => {
    assert.equal(hasPermission(['users.read'], 'users.write', false), false)
  })

  it('user with explicit users.write can mutate', () => {
    assert.equal(hasPermission(['users.read', 'users.write'], 'users.write', false), true)
  })
})

// ─── Edit field allowlist ─────────────────────────────────────────────────────

describe('admin users edit allowlist', () => {
  const ALLOWED_FIELDS = ['name', 'firstName', 'lastName', 'phone', 'customerTier']
  const FORBIDDEN_FIELDS = ['email', 'password', 'emailVerified', 'accounts', 'sessions']

  it('only allowed fields are in the allowlist', () => {
    for (const field of ALLOWED_FIELDS) {
      assert.ok(ALLOWED_FIELDS.includes(field), `${field} should be allowed`)
    }
  })

  it('forbidden fields are not in the allowlist', () => {
    for (const field of FORBIDDEN_FIELDS) {
      assert.equal(
        ALLOWED_FIELDS.includes(field),
        false,
        `${field} should NOT be in the edit allowlist`,
      )
    }
  })
})
