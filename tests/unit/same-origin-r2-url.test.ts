import assert from 'node:assert/strict'
import { afterEach, beforeEach, describe, it } from 'node:test'

import {
  appendCustomizerModelCacheBust,
  getCustomizerChefJacketGltfUrl,
} from '@/src/config/public-models'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'

const TEST_R2_BASE = 'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev'

const R2_ENV_KEYS = ['NEXT_PUBLIC_R2_PUBLIC_BASE_URL', 'R2_PUBLIC_BASE_URL'] as const

type R2EnvSnapshot = Record<(typeof R2_ENV_KEYS)[number], string | undefined>

function snapshotR2Env(): R2EnvSnapshot {
  return {
    NEXT_PUBLIC_R2_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL,
    R2_PUBLIC_BASE_URL: process.env.R2_PUBLIC_BASE_URL,
  }
}

function restoreR2Env(snapshot: R2EnvSnapshot) {
  for (const key of R2_ENV_KEYS) {
    const value = snapshot[key]
    if (value === undefined) {
      delete process.env[key]
    } else {
      process.env[key] = value
    }
  }
}

function clearR2Env() {
  delete process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
  delete process.env.R2_PUBLIC_BASE_URL
}

describe('toSameOriginR2Url', () => {
  let envSnapshot: R2EnvSnapshot

  beforeEach(() => {
    envSnapshot = snapshotR2Env()
  })

  afterEach(() => {
    restoreR2Env(envSnapshot)
  })

  it('rewrites R2 HTTPS URLs to /r2 proxy paths', () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = TEST_R2_BASE

    const url = toSameOriginR2Url(`${TEST_R2_BASE}/products/foo/image.webp`)

    assert.equal(url, '/r2/products/foo/image.webp')
  })
})

describe('appendCustomizerModelCacheBust', () => {
  it('appends v query param to /r2 paths', () => {
    assert.match(
      appendCustomizerModelCacheBust(
        '/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf',
      ),
      /\?v=2$|&v=2$/,
    )
  })
})

describe('getCustomizerChefJacketGltfUrl', () => {
  let envSnapshot: R2EnvSnapshot

  beforeEach(() => {
    envSnapshot = snapshotR2Env()
  })

  afterEach(() => {
    restoreR2Env(envSnapshot)
  })

  it('returns the local chef-jacket glTF path when R2 base URL is unset', () => {
    clearR2Env()

    const url = getCustomizerChefJacketGltfUrl()
    assert.equal(url, '/models/customizer/chef-jacket/chef-jacket.gltf')
  })

  it('returns the R2 HTTPS URL when public base URL is configured', () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = TEST_R2_BASE

    const url = getCustomizerChefJacketGltfUrl()
    assert.equal(
      url,
      `${TEST_R2_BASE}/public/images/models/customizer/chef-jacket/chef-jacket.gltf`,
    )
  })
})
