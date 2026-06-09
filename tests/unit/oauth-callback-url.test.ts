import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { buildSocialOAuthCallbackURL } from '@/src/lib/auth/oauth-callback-url'

describe('buildSocialOAuthCallbackURL', () => {
  it('embeds safe callbackUrl and source for post-checkout return', () => {
    const url = buildSocialOAuthCallbackURL({
      callbackUrl: '/account/orders/ORD-1?from=checkout&token=abc',
      source: 'storefront-login',
    })

    assert.ok(url.includes('/auth/social-complete?'))
    assert.ok(url.includes('source=storefront-login'))
    assert.ok(
      url.includes(
        encodeURIComponent('/account/orders/ORD-1?from=checkout&token=abc'),
      ),
    )
  })

  it('omits callbackUrl when unsafe or missing', () => {
    const url = buildSocialOAuthCallbackURL({
      callbackUrl: 'https://evil.example/phish',
      source: 'storefront-register',
    })

    assert.equal(url, '/auth/social-complete?source=storefront-register')
    assert.ok(!url.includes('callbackUrl'))
  })
})
