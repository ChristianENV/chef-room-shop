/**
 * Email safety guardrail tests.
 *
 * Verifies that real email providers (Resend, Mailtrap) are NEVER used in
 * test / CI / DISABLE_EMAIL_SENDS=true environments, and that the console
 * provider never calls any external API.
 */
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, it, before, after } from 'node:test'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Cast process.env to a plain mutable record so tests can safely set / delete
 * individual keys (including NODE_ENV) without TypeScript read-only errors.
 */
const mutableEnv = process.env as Record<string, string | undefined>

type EnvSnapshot = {
  NODE_ENV: string | undefined
  CI: string | undefined
  DISABLE_EMAIL_SENDS: string | undefined
  EMAIL_PROVIDER: string | undefined
  RESEND_API_KEY: string | undefined
  MAILTRAP_TOKEN: string | undefined
}

function saveEnv(): EnvSnapshot {
  return {
    NODE_ENV: mutableEnv['NODE_ENV'],
    CI: mutableEnv['CI'],
    DISABLE_EMAIL_SENDS: mutableEnv['DISABLE_EMAIL_SENDS'],
    EMAIL_PROVIDER: mutableEnv['EMAIL_PROVIDER'],
    RESEND_API_KEY: mutableEnv['RESEND_API_KEY'],
    MAILTRAP_TOKEN: mutableEnv['MAILTRAP_TOKEN'],
  }
}

function restoreEnv(snapshot: EnvSnapshot) {
  for (const [key, value] of Object.entries(snapshot)) {
    if (value === undefined) {
      delete mutableEnv[key]
    } else {
      mutableEnv[key] = value
    }
  }
}

// ---------------------------------------------------------------------------
// Module loader (lazy so tests can override env before importing config)
// ---------------------------------------------------------------------------

async function loadEmailConfig() {
  await import('./helpers/mock-server-only')
  return import('@/src/server/email/email.config')
}

// ---------------------------------------------------------------------------
// 1. isEmailForciblyDisabled
// ---------------------------------------------------------------------------

describe('isEmailForciblyDisabled', () => {
  let snap: EnvSnapshot
  let isEmailForciblyDisabled: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['isEmailForciblyDisabled']

  before(async () => {
    snap = saveEnv()
    ;({ isEmailForciblyDisabled } = await loadEmailConfig())
  })

  after(() => {
    restoreEnv(snap)
  })

  it('returns true when NODE_ENV=test', () => {
    mutableEnv['NODE_ENV'] = 'test'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(isEmailForciblyDisabled(), true)
  })

  it('returns true when CI=true', () => {
    delete mutableEnv['NODE_ENV']
    mutableEnv['CI'] = 'true'
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(isEmailForciblyDisabled(), true)
  })

  it('returns true when DISABLE_EMAIL_SENDS=true', () => {
    delete mutableEnv['NODE_ENV']
    delete mutableEnv['CI']
    mutableEnv['DISABLE_EMAIL_SENDS'] = 'true'
    assert.equal(isEmailForciblyDisabled(), true)
  })

  it('returns false in production with no safety overrides', () => {
    mutableEnv['NODE_ENV'] = 'production'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(isEmailForciblyDisabled(), false)
  })

  it('returns false in development with no safety overrides', () => {
    mutableEnv['NODE_ENV'] = 'development'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(isEmailForciblyDisabled(), false)
  })
})

// ---------------------------------------------------------------------------
// 2. resolveActiveEmailProvider — test environment always returns 'disabled'
// ---------------------------------------------------------------------------

describe('resolveActiveEmailProvider — test environment blocks real providers', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    mutableEnv['NODE_ENV'] = 'test'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
  })

  after(() => {
    restoreEnv(snap)
  })

  it('returns "disabled" when EMAIL_PROVIDER=console', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'console'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })

  it('blocks resend even when API key is set', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    mutableEnv['RESEND_API_KEY'] = 're_test_fake_key'
    const config = getEmailConfig()
    const provider = resolveActiveEmailProvider(config)
    assert.equal(provider, 'disabled')
    assert.notEqual(provider, 'resend')
  })

  it('blocks mailtrap even when token is set', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'mailtrap'
    mutableEnv['MAILTRAP_TOKEN'] = 'fake_mailtrap_token'
    const config = getEmailConfig()
    const provider = resolveActiveEmailProvider(config)
    assert.equal(provider, 'disabled')
    assert.notEqual(provider, 'mailtrap')
  })
})

// ---------------------------------------------------------------------------
// 3. CI environment always returns 'disabled'
// ---------------------------------------------------------------------------

describe('resolveActiveEmailProvider — CI environment blocks real providers', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    delete mutableEnv['NODE_ENV']
    mutableEnv['CI'] = 'true'
    delete mutableEnv['DISABLE_EMAIL_SENDS']
  })

  after(() => {
    restoreEnv(snap)
  })

  it('returns "disabled" regardless of EMAIL_PROVIDER', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    mutableEnv['RESEND_API_KEY'] = 're_ci_fake_key'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })

  it('returns "disabled" for console provider too', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'console'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })
})

// ---------------------------------------------------------------------------
// 4. DISABLE_EMAIL_SENDS=true
// ---------------------------------------------------------------------------

describe('resolveActiveEmailProvider — DISABLE_EMAIL_SENDS=true', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    mutableEnv['NODE_ENV'] = 'development'
    delete mutableEnv['CI']
    mutableEnv['DISABLE_EMAIL_SENDS'] = 'true'
  })

  after(() => {
    restoreEnv(snap)
  })

  it('returns "disabled" in development with DISABLE_EMAIL_SENDS=true', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'console'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })

  it('blocks resend in development when DISABLE_EMAIL_SENDS=true', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    mutableEnv['RESEND_API_KEY'] = 're_disable_fake_key'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })
})

// ---------------------------------------------------------------------------
// 5. Console provider in local dev
// ---------------------------------------------------------------------------

describe('resolveActiveEmailProvider — console provider (local dev)', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    mutableEnv['NODE_ENV'] = 'development'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
  })

  after(() => {
    restoreEnv(snap)
  })

  it('uses console when EMAIL_PROVIDER is not set', () => {
    delete mutableEnv['EMAIL_PROVIDER']
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'console')
  })

  it('uses console when EMAIL_PROVIDER=console', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'console'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'console')
  })

  it('falls back to console when resend key is missing', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    delete mutableEnv['RESEND_API_KEY']
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'console')
  })

  it('falls back to console when mailtrap token is missing', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'mailtrap'
    delete mutableEnv['MAILTRAP_TOKEN']
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'console')
  })
})

// ---------------------------------------------------------------------------
// 6. Real providers only work outside test/CI with keys present
// ---------------------------------------------------------------------------

describe('resolveActiveEmailProvider — real providers in non-test dev', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    mutableEnv['NODE_ENV'] = 'development'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
  })

  after(() => {
    restoreEnv(snap)
  })

  it('uses resend when key is present', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    mutableEnv['RESEND_API_KEY'] = 're_dev_key'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'resend')
  })

  it('uses mailtrap when token is present', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'mailtrap'
    mutableEnv['MAILTRAP_TOKEN'] = 'mt_dev_token'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'mailtrap')
  })
})

// ---------------------------------------------------------------------------
// 7. getEmailConfig.isEmailDisabled flag
// ---------------------------------------------------------------------------

describe('getEmailConfig.isEmailDisabled', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig } = await loadEmailConfig())
  })

  after(() => {
    restoreEnv(snap)
  })

  it('isEmailDisabled=true when NODE_ENV=test', () => {
    mutableEnv['NODE_ENV'] = 'test'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(getEmailConfig().isEmailDisabled, true)
  })

  it('isEmailDisabled=true when CI=true', () => {
    delete mutableEnv['NODE_ENV']
    mutableEnv['CI'] = 'true'
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(getEmailConfig().isEmailDisabled, true)
  })

  it('isEmailDisabled=false in production without overrides', () => {
    mutableEnv['NODE_ENV'] = 'production'
    delete mutableEnv['CI']
    delete mutableEnv['DISABLE_EMAIL_SENDS']
    assert.equal(getEmailConfig().isEmailDisabled, false)
  })
})

// ---------------------------------------------------------------------------
// 8. Auth email functions (password reset / order) — test env uses disabled
// ---------------------------------------------------------------------------

describe('auth email functions — test env never reaches real provider', () => {
  let snap: EnvSnapshot
  let getEmailConfig: Awaited<ReturnType<typeof loadEmailConfig>>['getEmailConfig']
  let resolveActiveEmailProvider: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['resolveActiveEmailProvider']

  before(async () => {
    snap = saveEnv()
    ;({ getEmailConfig, resolveActiveEmailProvider } = await loadEmailConfig())
    mutableEnv['NODE_ENV'] = 'test'
    mutableEnv['EMAIL_PROVIDER'] = 'resend'
    mutableEnv['RESEND_API_KEY'] = 're_fake_must_not_be_called'
  })

  after(() => {
    restoreEnv(snap)
  })

  it('password reset: resolveActiveEmailProvider returns disabled', () => {
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
    assert.notEqual(resolveActiveEmailProvider(config), 'resend')
  })

  it('order confirmation: resolveActiveEmailProvider returns disabled', () => {
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
  })

  it('misconfigured real provider in test is blocked', () => {
    mutableEnv['EMAIL_PROVIDER'] = 'mailtrap'
    mutableEnv['MAILTRAP_TOKEN'] = 'mt_fake_must_not_be_called'
    const config = getEmailConfig()
    assert.equal(resolveActiveEmailProvider(config), 'disabled')
    assert.notEqual(resolveActiveEmailProvider(config), 'mailtrap')
  })
})

// ---------------------------------------------------------------------------
// 9. Source-level — providers.ts has a 'disabled' case (no external API call)
// ---------------------------------------------------------------------------

describe('email.providers source — disabled case exists and is safe', () => {
  const source = readFileSync(resolve('src/server/email/email.providers.ts'), 'utf8')

  it('sendWithEmailProvider handles the disabled case', () => {
    assert.match(source, /case 'disabled'/)
  })

  it('sendWithDisabled function exists', () => {
    assert.match(source, /function sendWithDisabled/)
  })

  it('disabled case does NOT call resend.emails.send or fetch', () => {
    const disabledBlock = source.match(/case 'disabled':([\s\S]*?)case 'console':/)
    assert.ok(disabledBlock, 'disabled case block not found in email.providers.ts')
    const body = disabledBlock![1]!
    assert.doesNotMatch(body, /resend\.emails\.send/)
    assert.doesNotMatch(body, /fetch\(/)
  })
})

// ---------------------------------------------------------------------------
// 10. email.config.ts exports the isEmailForciblyDisabled helper
// ---------------------------------------------------------------------------

describe('email.config exports — isEmailForciblyDisabled', () => {
  let isEmailForciblyDisabled: Awaited<
    ReturnType<typeof loadEmailConfig>
  >['isEmailForciblyDisabled']

  before(async () => {
    ;({ isEmailForciblyDisabled } = await loadEmailConfig())
  })

  it('is a function', () => {
    assert.equal(typeof isEmailForciblyDisabled, 'function')
  })
})
