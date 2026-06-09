import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import {
  appendCustomizerModelCacheBust,
  getCustomizerChefJacketGltfUrl,
} from '@/src/config/public-models'
import { toSameOriginR2Url } from '@/src/lib/assets/same-origin-r2-url'

describe('toSameOriginR2Url', () => {
  it('rewrites R2 HTTPS URLs to /r2 proxy paths', () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL =
      'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev'

    const url = toSameOriginR2Url(
      'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/products/foo/image.webp',
    )

    assert.equal(url, '/r2/products/foo/image.webp')
  })
})

describe('appendCustomizerModelCacheBust', () => {
  it('appends v query param to /r2 paths', () => {
    assert.match(
      appendCustomizerModelCacheBust('/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf'),
      /\?v=2$|&v=2$/,
    )
  })
})

describe('getCustomizerChefJacketGltfUrl', () => {
  it('returns the local chef-jacket glTF path', () => {
    process.env.NEXT_PUBLIC_R2_PUBLIC_BASE_URL =
      'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev'

    const url = getCustomizerChefJacketGltfUrl()
    assert.equal(url, '/models/customizer/chef-jacket/chef-jacket.gltf')
  })
})
