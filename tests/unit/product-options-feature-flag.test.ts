import './helpers/mock-server-only'

import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { afterEach, describe, it } from 'node:test'

import {
  assertProductOptionsFeatureEnabled,
  isProductOptionsEnabledOnServer,
} from '@/src/config/features.server'
import {
  isProductOptionsEnabled,
  parseFeatureFlagEnv,
  PRODUCT_OPTIONS_DISABLED_CODE,
  PRODUCT_OPTIONS_DISABLED_MESSAGE,
} from '@/src/config/features'
import { normalizeAccountOrderItem } from '@/src/features/storefront/account/order-detail/order-detail.utils'
import { normalizeCommercialOptionsSnapshot } from '@/src/features/storefront/cart/mappers/cart-ui.mapper'

const originalPublicFlag = process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS
const originalServerFlag = process.env.ENABLE_PRODUCT_OPTIONS

afterEach(() => {
  if (originalPublicFlag === undefined) {
    delete process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS
  } else {
    process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS = originalPublicFlag
  }

  if (originalServerFlag === undefined) {
    delete process.env.ENABLE_PRODUCT_OPTIONS
  } else {
    process.env.ENABLE_PRODUCT_OPTIONS = originalServerFlag
  }
})

describe('product options feature flag config', () => {
  it('defaults to enabled when env vars are unset', () => {
    delete process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS
    delete process.env.ENABLE_PRODUCT_OPTIONS

    assert.equal(parseFeatureFlagEnv(undefined, true), true)
    assert.equal(isProductOptionsEnabled(), true)
    assert.equal(isProductOptionsEnabledOnServer(), true)
  })

  it('disables product options when NEXT_PUBLIC flag is false', () => {
    process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS = 'false'
    delete process.env.ENABLE_PRODUCT_OPTIONS

    assert.equal(isProductOptionsEnabled(), false)
    assert.equal(isProductOptionsEnabledOnServer(), false)
  })

  it('allows server-only override via ENABLE_PRODUCT_OPTIONS', () => {
    process.env.NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS = 'true'
    process.env.ENABLE_PRODUCT_OPTIONS = 'false'

    assert.equal(isProductOptionsEnabled(), true)
    assert.equal(isProductOptionsEnabledOnServer(), false)
  })

  it('rejects add-to-cart selections when feature is disabled on server', () => {
    process.env.ENABLE_PRODUCT_OPTIONS = 'false'

    const gate = assertProductOptionsFeatureEnabled(1)
    assert.equal(gate.ok, false)
    if (gate.ok) return

    assert.equal(gate.code, PRODUCT_OPTIONS_DISABLED_CODE)
    assert.equal(gate.error, PRODUCT_OPTIONS_DISABLED_MESSAGE)
  })

  it('allows empty commercial option payloads when feature is disabled', () => {
    process.env.ENABLE_PRODUCT_OPTIONS = 'false'

    assert.deepEqual(assertProductOptionsFeatureEnabled(0), { ok: true })
  })
})

describe('product options feature flag UI wiring', () => {
  it('PDP hides selectors and omits add-to-cart payload when disabled', () => {
    const productInfoSource = readFileSync(
      resolve('src/features/storefront/products/product-info.tsx'),
      'utf8',
    )

    assert.match(productInfoSource, /isProductOptionsEnabled\(\)/)
    assert.match(productInfoSource, /productOptionsEnabled \? \(/)
    assert.match(
      productInfoSource,
      /productOptionsEnabled\s*\?\s*buildSelectedCommercialOptionsPayload/,
    )
    assert.match(
      productInfoSource,
      /productOptionsEnabled && selectedCommercialOptions\.length > 0/,
    )
  })

  it('admin product form hides Opciones tab when disabled', () => {
    const formSource = readFileSync(
      resolve('src/features/admin/products/product-form-dialog.tsx'),
      'utf8',
    )

    assert.match(formSource, /productOptionsEnabled \? 'grid-cols-4' : 'grid-cols-3'/)
    assert.match(formSource, /productOptionsEnabled \? \([\s\S]*TabsTrigger value="options"/)
    assert.match(formSource, /productOptionsEnabled \? \([\s\S]*ProductCommercialOptionsTab/)
  })

  it('catalog mapper strips optionGroups when server flag is disabled', () => {
    const catalogMapperSource = readFileSync(
      resolve('src/server/graphql/modules/catalog/catalog.mappers.ts'),
      'utf8',
    )

    assert.match(catalogMapperSource, /isProductOptionsEnabledOnServer\(\)/)
    assert.match(catalogMapperSource, /optionGroups: isProductOptionsEnabledOnServer\(\)/)
  })
})

describe('product options feature flag data safety', () => {
  it('keeps order/cart mappers stable when snapshots exist but UI flag is off', () => {
    const snapshot = [
      {
        groupId: 'group-1',
        groupSlug: 'apron-length',
        groupName: 'Largo',
        valueId: 'value-1',
        valueSlug: 'mas-10cm',
        valueLabel: '+10 cm',
        priceDeltaCents: 15000,
      },
    ]

    assert.deepEqual(normalizeCommercialOptionsSnapshot(snapshot), snapshot)
    assert.equal(
      normalizeAccountOrderItem({
        id: 'item-1',
        name: 'Mandil',
        sku: null,
        quantity: 1,
        unitPriceCents: 85000,
        customizationPriceCents: 0,
        optionPriceCents: 15000,
        totalPriceCents: 100000,
        commercialOptionsSnapshot: snapshot,
        productSnapshotJson: null,
        designSnapshotJson: null,
      }).commercialOptionsSnapshot[0]?.valueSlug,
      'mas-10cm',
    )
  })
})
