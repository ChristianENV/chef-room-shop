import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  getCustomerTierLabel,
  isPremiumCustomerTier,
  mapCustomerTierToUiStatus,
} from '@/src/lib/customer/customer-tier'

describe('customer tier helpers', () => {
  it('maps prisma tiers to UI status', () => {
    assert.equal(mapCustomerTierToUiStatus('REGULAR'), 'regular')
    assert.equal(mapCustomerTierToUiStatus('PREMIUM'), 'premium')
    assert.equal(mapCustomerTierToUiStatus('VIP'), 'vip')
  })

  it('detects premium tiers for badges', () => {
    assert.equal(isPremiumCustomerTier('PREMIUM'), true)
    assert.equal(isPremiumCustomerTier('VIP'), true)
    assert.equal(isPremiumCustomerTier('REGULAR'), false)
    assert.equal(getCustomerTierLabel('PREMIUM'), 'Cliente premium')
    assert.equal(getCustomerTierLabel('REGULAR'), null)
  })
})
