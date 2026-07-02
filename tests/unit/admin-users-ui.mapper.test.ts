import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  buildAdminUsersListVariables,
  mapAdminUserToTableRow,
} from '@/src/features/admin/users/mappers/admin-users-ui.mapper'

const makeUser = (overrides = {}) => ({
  id: 'user-1',
  name: 'Chef Demo',
  email: 'demo@chefroom.test',
  roles: ['CUSTOMER'] as string[],
  status: 'ACTIVE',
  customerTier: 'REGULAR',
  emailVerified: true,
  isActive: true,
  firstName: null,
  lastName: null,
  phone: null,
  createdAt: '2026-01-15T12:00:00.000Z',
  updatedAt: '2026-02-01T08:30:00.000Z',
  ...overrides,
})

describe('admin users ui mapper', () => {
  it('builds list variables with segment and status filter', () => {
    const variables = buildAdminUsersListVariables({
      search: 'chef',
      statusFilter: 'ACTIVE',
      segment: 'CUSTOMERS',
    })

    assert.equal(variables.filter?.search, 'chef')
    assert.equal(variables.filter?.status, 'ACTIVE')
    assert.equal(variables.filter?.segment, 'CUSTOMERS')
    assert.equal(variables.limit, 50)
  })

  it('omits segment when not provided', () => {
    const variables = buildAdminUsersListVariables({
      search: '',
      statusFilter: 'all',
    })

    assert.equal(variables.filter?.segment, undefined)
    assert.equal(variables.filter?.status, undefined)
  })

  it('maps admin user to table row labels', () => {
    const row = mapAdminUserToTableRow(
      makeUser({ roles: ['CUSTOMER', 'ADMIN'], customerTier: 'PREMIUM' }),
    )

    assert.equal(row.rolesLabel, 'Cliente, Admin')
    assert.equal(row.statusLabel, 'Activo')
    assert.equal(row.customerTierLabel, 'Cliente premium')
    assert.equal(row.emailVerified, true)
  })

  it('includes firstName, lastName, phone on table row', () => {
    const row = mapAdminUserToTableRow(
      makeUser({ firstName: 'Ana', lastName: 'García', phone: '+52 55 1234 5678' }),
    )

    assert.equal(row.firstName, 'Ana')
    assert.equal(row.lastName, 'García')
    assert.equal(row.phone, '+52 55 1234 5678')
  })
})
