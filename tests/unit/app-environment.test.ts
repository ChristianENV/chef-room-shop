import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { resolveAppEnvironment } from '@/src/config/app-environment'

async function loadSkydropxModeModule() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/shipping/skydropx/skydropx.mode')
}

describe('resolveAppEnvironment', () => {
  it('resolves local from NODE_ENV=development', () => {
    assert.equal(resolveAppEnvironment({ nodeEnv: 'development' }), 'local')
    assert.equal(resolveAppEnvironment({ nodeEnv: 'test' }), 'local')
  })

  it('infers np from Vercel preview', () => {
    assert.equal(resolveAppEnvironment({ nodeEnv: 'production', vercelEnv: 'preview' }), 'np')
  })

  it('infers prod from Vercel production', () => {
    assert.equal(resolveAppEnvironment({ nodeEnv: 'production', vercelEnv: 'production' }), 'prod')
  })

  it('infers np from Railway staging', () => {
    assert.equal(resolveAppEnvironment({ nodeEnv: 'production', railwayEnvironment: 'np' }), 'np')
  })

  it('treats NODE_ENV=production without staging signals as prod', () => {
    assert.equal(resolveAppEnvironment({ nodeEnv: 'production' }), 'prod')
  })
})

describe('resolveSkydropxModeFromEnvironment', () => {
  it('local resolves to mock via NODE_ENV=development', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(resolveSkydropxModeFromEnvironment({ nodeEnv: 'development' }), 'mock')
  })

  it('np resolves to mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'preview',
      }),
      'mock',
    )
  })

  it('prod resolves to live', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'production',
      }),
      'live',
    )
  })

  it('production deployment cannot use mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        nodeEnv: 'production',
        vercelEnv: 'production',
      }),
      'live',
    )
  })

  it('NODE_ENV=production without staging signals fails safe to live', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(resolveSkydropxModeFromEnvironment({ nodeEnv: 'production' }), 'live')
  })
})
