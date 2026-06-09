import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import { describe, it } from 'node:test'

const MODEL_DIR = path.join(
  process.cwd(),
  'public/models/customizer/chef-jacket',
)

describe('chef-jacket glTF bundle references', () => {
  it('references exist on disk with exact filenames', () => {
    const gltfPath = path.join(MODEL_DIR, 'chef-jacket.gltf')
    const raw = fs.readFileSync(gltfPath, 'utf8')
    const gltf = JSON.parse(raw) as {
      buffers?: Array<{ uri?: string }>
      images?: Array<{ uri?: string }>
    }

    const uris = [
      ...(gltf.buffers ?? []).map((buffer) => buffer.uri).filter(Boolean),
      ...(gltf.images ?? []).map((image) => image.uri).filter(Boolean),
    ] as string[]

    assert.deepEqual(
      uris.sort(),
      [
        'chef-jacket-diffuse.png',
        'chef-jacket-metallicroughness.png',
        'chef-jacket-normal.png',
        'chef-jacket.bin',
      ].sort(),
    )

    for (const uri of uris) {
      const filePath = path.join(MODEL_DIR, uri)
      assert.ok(fs.existsSync(filePath), `missing referenced file: ${uri}`)
    }
  })
})
