import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  AppEnvironmentConfigError,
  resolveAppEnvironment,
} from '@/src/config/app-environment'

async function loadSkydropxModeModule() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/shipping/skydropx/skydropx.mode')
}

describe('resolveAppEnvironment', () => {
  it('resolves local from explicit APP_ENV', () => {
    assert.equal(resolveAppEnvironment({ appEnv: 'local' }), 'local')
    assert.equal(resolveAppEnvironment({ appEnv: 'development' }), 'local')
  })

  it('resolves np from explicit APP_ENV', () => {
    assert.equal(resolveAppEnvironment({ appEnv: 'np' }), 'np')
    assert.equal(resolveAppEnvironment({ appEnv: 'staging' }), 'np')
  })

  it('resolves prod from explicit APP_ENV', () => {
    assert.equal(resolveAppEnvironment({ appEnv: 'prod' }), 'prod')
    assert.equal(resolveAppEnvironment({ appEnv: 'production' }), 'prod')
  })

  it('infers np from Vercel preview', () => {
    assert.equal(resolveAppEnvironment({ vercelEnv: 'preview' }), 'np')
  })

  it('infers prod from Vercel production', () => {
    assert.equal(resolveAppEnvironment({ vercelEnv: 'production' }), 'prod')
  })

  it('throws on invalid APP_ENV', () => {
    assert.throws(
      () => resolveAppEnvironment({ appEnv: 'unknown-env' }),
      (error: unknown) => error instanceof AppEnvironmentConfigError,
    )
  })
})

describe('resolveSkydropxModeFromEnvironment', () => {
  it('local resolves to mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({ appEnv: 'local', nodeEnv: 'development' }),
      'mock',
    )
  })

  it('np resolves to mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({ appEnv: 'np', nodeEnv: 'development' }),
      'mock',
    )
  })

  it('prod resolves to live', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({ appEnv: 'prod', nodeEnv: 'development' }),
      'live',
    )
  })

  it('production runtime cannot use mock even with local APP_ENV', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({
        appEnv: 'local',
        nodeEnv: 'production',
      }),
      'live',
    )
  })

  it('unknown APP_ENV does not silently use mock', async () => {
    const { resolveSkydropxModeFromEnvironment } = await loadSkydropxModeModule()
    assert.equal(
      resolveSkydropxModeFromEnvironment({ appEnv: 'unknown-env', nodeEnv: 'development' }),
      'live',
    )
  })
})
