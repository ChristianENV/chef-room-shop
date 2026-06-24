import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { normalizeDatabaseUrl } from '@/src/server/db/create-prisma'

describe('normalizeDatabaseUrl', () => {
  it('maps sslmode=require to verify-full for pg compatibility', () => {
    const normalized = normalizeDatabaseUrl(
      'postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require',
    )

    assert.match(normalized ?? '', /sslmode=verify-full/)
    assert.doesNotMatch(normalized ?? '', /sslmode=require/)
  })

  it('strips channel_binding and adds Neon timeouts', () => {
    const normalized = normalizeDatabaseUrl(
      'postgresql://user:pass@ep-xxx-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require',
    )

    assert.match(normalized ?? '', /connect_timeout=15/)
    assert.match(normalized ?? '', /pool_timeout=15/)
    assert.doesNotMatch(normalized ?? '', /channel_binding/)
  })
})
