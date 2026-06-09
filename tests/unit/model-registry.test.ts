import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  CHEF_JACKET_REGISTRY_KEY,
  getCustomizerModelForProduct,
  getRegistryTransformForProductType,
} from '@/src/features/storefront/customizer/3d/model-registry'

describe('getRegistryTransformForProductType', () => {
  it('returns chef-jacket scale for filipina product type', () => {
    const transform = getRegistryTransformForProductType('filipina')
    assert.equal(transform.scale, 0.02)
    assert.deepEqual(transform.position, [0, -2.55, 0])
  })

  it('falls back to chef-jacket transform for unknown types', () => {
    const transform = getRegistryTransformForProductType('unknown-garment')
    assert.equal(transform.scale, 0.02)
  })
})

describe('getCustomizerModelForProduct', () => {
  it('applies registry transform for DB model URLs regardless of host', () => {
    const model = getCustomizerModelForProduct({
      productTypeSlug: 'filipina',
      model3d: {
        id: 'model-1',
        url: 'https://pub-example.r2.dev/products/foo/chef-jacket.gltf',
        publicId: 'products/foo/chef-jacket.gltf',
        fileName: 'chef-jacket.gltf',
        sizeBytes: 1024,
        format: 'gltf',
        materialHintsJson: null,
        meshHintsJson: null,
        anchorsJson: null,
      },
    })

    assert.ok(model)
    assert.equal(model!.registryKey, CHEF_JACKET_REGISTRY_KEY)
    assert.equal(model!.scale, 0.02)
    assert.ok(
      model!.modelUrl.startsWith('/r2/') || model!.modelUrl.startsWith('https://'),
    )
  })
})
