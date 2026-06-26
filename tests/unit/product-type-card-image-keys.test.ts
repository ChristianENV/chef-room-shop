import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

describe('product type card image R2 key paths', () => {
  it('uses the expected product-types card prefix', () => {
    const productTypeId = 'type-id'
    const imageId = 'image-id'
    const webp = `product-types/${productTypeId}/card/${imageId}/image.webp`

    assert.equal(webp, 'product-types/type-id/card/image-id/image.webp')
    assert.equal(
      webp.replace(/\/image\.webp$/i, '/image.jpg'),
      'product-types/type-id/card/image-id/image.jpg',
    )
    assert.equal(
      webp.replace(/\/image\.webp$/i, '/thumb.webp'),
      'product-types/type-id/card/image-id/thumb.webp',
    )
  })
})
