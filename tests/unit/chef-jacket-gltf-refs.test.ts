import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

const LOCAL_GLTF = path.join(
  process.cwd(),
  'public/models/customizer/chef-jacket/chef-jacket.gltf',
)

describe('chef-jacket glTF bundle references', () => {
  it('references exist on disk when local dev bundle is present', () => {
    if (!fs.existsSync(LOCAL_GLTF)) {
      return
    }

    const gltf = JSON.parse(fs.readFileSync(LOCAL_GLTF, 'utf8')) as {
      buffers?: Array<{ uri?: string }>
      images?: Array<{ uri?: string }>
    }

    const uris = [
      ...(gltf.buffers ?? []).map((b) => b.uri),
      ...(gltf.images ?? []).map((i) => i.uri),
    ].filter((uri): uri is string => Boolean(uri))

    for (const uri of uris) {
      const resolved = path.join(path.dirname(LOCAL_GLTF), uri)
      assert.ok(fs.existsSync(resolved), `missing referenced file: ${uri}`)
    }
  })
})
