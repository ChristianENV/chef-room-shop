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
  it('prefers product.model3d.url for filipina over R2 fallback', () => {
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

  it('uses R2 proxy URL for filipina when no product model3d and R2 is configured', () => {
    const previousBase = process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
    const previousMock = process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL
    const previousUseMock = process.env.NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = 'https://pub-example.r2.dev'
    process.env.NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB = 'true'
    delete process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL

    const model = getCustomizerModelForProduct({
      productTypeSlug: 'filipina',
      model3d: null,
    })

    assert.ok(model)
    assert.match(
      model!.modelUrl,
      /^\/r2\/public\/images\/models\/customizer\/chef-jacket\/chef-jacket\.gltf/,
    )
    assert.equal(model!.resolutionKind, 'r2')

    if (previousBase === undefined) {
      delete process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL
    } else {
      process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL = previousBase
    }
    if (previousMock === undefined) {
      delete process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL
    } else {
      process.env.NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL = previousMock
    }
    if (previousUseMock === undefined) {
      delete process.env.NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB
    } else {
      process.env.NEXT_PUBLIC_CUSTOMIZER_USE_MOCK_GLB = previousUseMock
    }
  })
})
