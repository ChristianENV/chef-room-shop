#!/usr/bin/env tsx
/**
 * GLB optimizer — Chef Room Customizer
 *
 * Reduces GLB file size for web delivery using gltf-transform:
 *   dedup → prune → weld → reorder → quantize → meshopt compression
 *
 * Usage:
 *   pnpm tsx scripts/optimize-glb.ts <input.glb> <output.glb>
 *
 * Example (local mock):
 *   pnpm tsx scripts/optimize-glb.ts \
 *     public/models/customizer/mock-dress-combi/mock-dress-combi.glb \
 *     public/models/customizer/mock-dress-combi/mock-dress-combi-opt.glb
 *
 * Requirements:
 *   pnpm add -D @gltf-transform/core @gltf-transform/functions @gltf-transform/extensions meshoptimizer
 *
 * Tip: also try the CLI for a quick one-liner:
 *   npx @gltf-transform/cli optimize input.glb output.glb --compress meshopt
 */

import { NodeIO } from '@gltf-transform/core'
import { KHRONOS_EXTENSIONS } from '@gltf-transform/extensions'
import {
  dedup,
  prune,
  weld,
  reorder,
  quantize,
} from '@gltf-transform/functions'
import { MeshoptEncoder, MeshoptDecoder } from 'meshoptimizer'
import { EXTMeshoptCompression } from '@gltf-transform/extensions'
import path from 'node:path'
import fs from 'node:fs'

const [, , inputArg, outputArg] = process.argv

if (!inputArg || !outputArg) {
  console.error('Usage: pnpm tsx scripts/optimize-glb.ts <input.glb> <output.glb>')
  process.exit(1)
}

const inputPath = path.resolve(inputArg)
const outputPath = path.resolve(outputArg)

if (!fs.existsSync(inputPath)) {
  console.error(`Input file not found: ${inputPath}`)
  process.exit(1)
}

const inputSizeKb = Math.round(fs.statSync(inputPath).size / 1024)
console.log(`\n🔧 Optimizing: ${path.basename(inputPath)} (${inputSizeKb} KB)`)
console.log(`→ Output: ${outputPath}\n`)

// Initialize meshoptimizer WASM
await MeshoptDecoder.ready
await MeshoptEncoder.ready

const io = new NodeIO().registerExtensions(KHRONOS_EXTENSIONS)
const document = await io.read(inputPath)

console.log('  [1/5] dedup — removing duplicate buffers/textures/accessors...')
await document.transform(dedup())

console.log('  [2/5] prune — removing unused nodes/materials/textures...')
await document.transform(prune())

console.log('  [3/5] weld — merging duplicate vertices...')
await document.transform(weld({ tolerance: 1e-4 }))

console.log('  [4/5] reorder — optimizing vertex cache (meshopt)...')
await document.transform(reorder({ encoder: MeshoptEncoder }))

console.log('  [5/5] quantize — compressing vertex attributes...')
await document.transform(quantize())

// Apply meshopt compression extension
const meshoptExtension = document.createExtension(EXTMeshoptCompression)
  .setRequired(true)
  .setEncoderOptions({ method: EXTMeshoptCompression.EncoderMethod.QUANTIZE })

// Silence the unused variable lint warning — extension is registered on the document
void meshoptExtension

console.log('\n  📦 Writing output...')
await io.write(outputPath, document)

const outputSizeKb = Math.round(fs.statSync(outputPath).size / 1024)
const savedPct = Math.round((1 - outputSizeKb / inputSizeKb) * 100)

console.log(`\n✅ Done!`)
console.log(`   Input : ${inputSizeKb.toLocaleString()} KB`)
console.log(`   Output: ${outputSizeKb.toLocaleString()} KB`)
console.log(`   Saved : ~${savedPct}%\n`)

console.log('Next steps:')
console.log('  1. Verify in https://gltf.report that materials/textures look correct.')
console.log('  2. Upload to R2: set NEXT_PUBLIC_CUSTOMIZER_MOCK_GLB_URL in .env.local.')
console.log(
  '  3. Confirm R2 bucket has CORS rule for GET/HEAD on *.glb (see docs/customizer-3d-model-pipeline.md).\n',
)
