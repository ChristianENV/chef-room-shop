import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { canRunDbIntegrationTests } from './helpers/db-integration'

describe('canRunDbIntegrationTests', () => {
  it('skips local dev chef_room database', () => {
    const original = process.env.DATABASE_URL
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/chef_room?schema=public'
    try {
      assert.equal(canRunDbIntegrationTests(), false)
    } finally {
      process.env.DATABASE_URL = original
    }
  })

  it('skips CI placeholder chef_room_ci without Postgres service', () => {
    const original = process.env.DATABASE_URL
    process.env.DATABASE_URL =
      'postgresql://postgres:postgres@localhost:5432/chef_room_ci?schema=public'
    try {
      assert.equal(canRunDbIntegrationTests(), false)
    } finally {
      process.env.DATABASE_URL = original
    }
  })

  it('allows remote integration databases', () => {
    const original = process.env.DATABASE_URL
    process.env.DATABASE_URL = 'postgresql://user:pass@db.example.com:5432/chef_room_prod'
    try {
      assert.equal(canRunDbIntegrationTests(), true)
    } finally {
      process.env.DATABASE_URL = original
    }
  })
})
