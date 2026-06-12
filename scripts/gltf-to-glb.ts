#!/usr/bin/env tsx
/**
 * Converts a local glTF bundle (.gltf + .bin + textures) to a single .glb.
 *
 * Usage:
 *   pnpm gltf:to-glb <input.gltf> <output.glb>
 *
 * Example (do not commit output):
 *   pnpm gltf:to-glb public/images/models/customizer/chef-jacket/chef-jacket.gltf .tmp/models/chef-jacket.glb
 */
import fs from 'node:fs/promises'
import path from 'node:path'
import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'

const [, , inputArg, outputArg] = process.argv

if (!inputArg || !outputArg) {
  console.error('Usage: pnpm gltf:to-glb <input.gltf> <output.glb>')
  process.exit(1)
}

const inputPath = path.resolve(inputArg)
const outputPath = path.resolve(outputArg)

async function main() {
  const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS)
  const document = await io.read(inputPath)
  await fs.mkdir(path.dirname(outputPath), { recursive: true })
  await io.write(outputPath, document)

  const stat = await fs.stat(outputPath)
  console.info(`[gltf-to-glb] wrote ${outputPath} (${stat.size} bytes)`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
