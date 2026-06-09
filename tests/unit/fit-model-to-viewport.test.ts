import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import * as THREE from 'three'

import {
  buildModelFitKey,
  getBoundsRadius,
  getSafeModelBounds,
  isBoundsReadyForFit,
  MAX_FIT_MODEL_DIMENSION,
  MIN_FIT_CONTAINER_PX,
} from '@/src/features/storefront/customizer/3d/fit-model-to-viewport'

describe('isBoundsReadyForFit', () => {
  it('rejects empty bounds', () => {
    const bounds = getSafeModelBounds(new THREE.Group())
    assert.equal(bounds.valid, false)
    assert.equal(isBoundsReadyForFit(bounds, { width: 800, height: 600 }), false)
  })

  it('rejects absurdly large unscaled model bounds', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(120, 160, 40))
    const bounds = getSafeModelBounds(mesh)
    assert.equal(bounds.valid, true)
    assert.ok(Math.max(bounds.size.x, bounds.size.y, bounds.size.z) > MAX_FIT_MODEL_DIMENSION)
    assert.equal(isBoundsReadyForFit(bounds, { width: 800, height: 600 }), false)
  })

  it('accepts normalized jacket-sized bounds', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.4))
    const bounds = getSafeModelBounds(mesh)
    assert.equal(isBoundsReadyForFit(bounds, { width: 800, height: 600 }), true)
    assert.ok(getBoundsRadius(bounds) > 0)
  })

  it('rejects tiny container sizes', () => {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(0.8, 1.5, 0.4))
    const bounds = getSafeModelBounds(mesh)
    assert.equal(
      isBoundsReadyForFit(bounds, { width: MIN_FIT_CONTAINER_PX, height: 600 }),
      false,
    )
  })
})

describe('buildModelFitKey', () => {
  it('includes product slug, registry key, url, and transform version', () => {
    const key = buildModelFitKey({
      productSlug: 'demo-filipina',
      registryKey: 'chef-jacket',
      modelUrl: '/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf?v=2',
      transformVersion: '1',
    })

    assert.match(key, /^demo-filipina\|chef-jacket\|/)
    assert.match(key, /\|1$/)
  })
})
