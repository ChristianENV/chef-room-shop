import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { CHEF_JACKET_GLTF_LOCAL } from '@/src/config/public-models'
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
  it('prefers product.model3d.url for filipina over local fallback', () => {
    const previousBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = 'https://pub-example.r2.dev'

    const remoteUrl =
      'https://pub-example.r2.dev/products/foo/models/bar/model.glb'

    const model = getCustomizerModelForProduct({
      productTypeSlug: 'filipina',
      model3d: {
        id: 'model-1',
        url: remoteUrl,
        publicId: 'products/foo/models/bar/model.glb',
        fileName: 'model.glb',
        sizeBytes: 1024,
        format: 'glb',
        materialHintsJson: null,
        meshHintsJson: null,
        anchorsJson: null,
      },
    })

    assert.ok(model)
    assert.equal(model!.registryKey, CHEF_JACKET_REGISTRY_KEY)
    assert.equal(model!.scale, 0.02)
    assert.equal(model!.resolutionKind, 'r2')
    assert.match(model!.modelUrl, /^\/r2\/products\/foo\/models\/bar\/model\.glb/)

    if (previousBase === undefined) {
      delete process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
    } else {
      process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = previousBase
    }
  })

  it('uses dev local fallback for filipina when no remote model in development', () => {
    const model = getCustomizerModelForProduct({
      productTypeSlug: 'filipina',
      model3d: null,
    })

    if (process.env.NODE_ENV === 'development') {
      assert.ok(model)
      assert.equal(model!.resolutionKind, 'local-fallback')
      assert.equal(model!.modelUrl, CHEF_JACKET_GLTF_LOCAL)
      return
    }

    assert.ok(model === null || model.resolutionKind === 'env-fallback')
  })
})
