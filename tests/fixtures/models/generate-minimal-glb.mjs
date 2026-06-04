/**
 * Generates a minimal valid GLB file for E2E fixture use.
 *
 * The output is a spec-compliant GLB 2.0:
 *   - glTF magic bytes (0x46 0x54 0x6C 0x67)
 *   - version 2
 *   - one JSON chunk with {"asset":{"version":"2.0"}}
 *
 * Total size: ~48 bytes. No geometry, no materials.
 *
 * Usage:
 *   node tests/fixtures/models/generate-minimal-glb.mjs
 */
import { writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dir = path.dirname(fileURLToPath(import.meta.url))

// JSON payload (must be padded to a multiple of 4 with trailing spaces).
const jsonStr = '{"asset":{"version":"2.0"}}'
const padded = jsonStr.padEnd(Math.ceil(jsonStr.length / 4) * 4, ' ')
const jsonBytes = Buffer.from(padded, 'utf8')

// Chunk layout: length(4) + type(4) + data(N)
const JSON_CHUNK_TYPE = 0x4e4f534a // "JSON"
const jsonChunkHeader = Buffer.allocUnsafe(8)
jsonChunkHeader.writeUInt32LE(jsonBytes.length, 0)
jsonChunkHeader.writeUInt32LE(JSON_CHUNK_TYPE, 4)

// GLB header: magic(4) + version(4) + totalLength(4)
const GLB_MAGIC = 0x46546c67 // "glTF"
const totalLength = 12 + 8 + jsonBytes.length
const header = Buffer.allocUnsafe(12)
header.writeUInt32LE(GLB_MAGIC, 0)
header.writeUInt32LE(2, 4)         // version 2
header.writeUInt32LE(totalLength, 8)

const glb = Buffer.concat([header, jsonChunkHeader, jsonBytes])

const outPath = path.join(__dir, 'minimal-valid.glb')
writeFileSync(outPath, glb)
console.log(`Generated ${outPath} (${glb.length} bytes)`)
