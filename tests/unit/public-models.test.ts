import assert from 'node:assert/strict'
import { describe, it } from 'node:test'

import { appendCustomizerModelCacheBust } from '@/src/config/public-models'

describe('appendCustomizerModelCacheBust', () => {
  it('appends v query param to https model URLs', () => {
    const url = appendCustomizerModelCacheBust(
      'https://pub-4aca0106e69a495ba9342302f65b5413.r2.dev/public/images/models/customizer/chef-jacket/chef-jacket.gltf',
    )

    assert.match(url, /[?&]v=2$/)
  })

  it('appends v query param to /r2 proxy paths', () => {
    const url = appendCustomizerModelCacheBust(
      '/r2/public/images/models/customizer/chef-jacket/chef-jacket.gltf',
    )

    assert.match(url, /[?&]v=2$/)
  })

  it('leaves local paths unchanged', () => {
    assert.equal(
      appendCustomizerModelCacheBust('/models/customizer/chef-jacket/chef-jacket.gltf'),
      '/models/customizer/chef-jacket/chef-jacket.gltf',
    )
  })
})
