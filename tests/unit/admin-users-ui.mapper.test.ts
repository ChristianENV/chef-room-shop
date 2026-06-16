import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminUsersListVariables,
  mapAdminUserToTableRow,
} from '@/src/features/admin/users/mappers/admin-users-ui.mapper'

describe('admin users ui mapper', () => {
  it('builds list variables from filters', () => {
    const variables = buildAdminUsersListVariables({
      search: 'chef',
      roleFilter: 'ADMIN',
      statusFilter: 'ACTIVE',
    })

    assert.equal(variables.filter?.search, 'chef')
    assert.equal(variables.filter?.role, 'ADMIN')
    assert.equal(variables.filter?.status, 'ACTIVE')
    assert.equal(variables.limit, 50)
  })

  it('maps admin user to table row labels', () => {
    const row = mapAdminUserToTableRow({
      id: 'user-1',
      name: 'Chef Demo',
      email: 'demo@chefroom.test',
      roles: ['CUSTOMER', 'ADMIN'],
      status: 'ACTIVE',
      customerTier: 'PREMIUM',
      emailVerified: true,
      isActive: true,
      createdAt: '2026-01-15T12:00:00.000Z',
      updatedAt: '2026-02-01T08:30:00.000Z',
    })

    assert.equal(row.rolesLabel, 'Cliente, Admin')
    assert.equal(row.statusLabel, 'Activo')
    assert.equal(row.customerTierLabel, 'Cliente premium')
    assert.equal(row.emailVerified, true)
  })
})
