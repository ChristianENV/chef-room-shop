/**
 * Runs Prisma CLI with .env.local loaded (Next.js convention).
 * Usage: node scripts/run-prisma.mjs validate|generate|migrate deploy|...
 */
import { spawnSync } from 'node:child_process'
import { resolve } from 'node:path'

import { config } from 'dotenv'

const root = process.cwd()
config({ path: resolve(root, '.env.local') })
config({ path: resolve(root, '.env') })

const args = process.argv.slice(2)
if (args.length === 0) {
  console.error('Usage: node scripts/run-prisma.mjs <prisma-args...>')
  process.exit(1)
}

const prismaCmd =
  process.platform === 'win32'
    ? resolve(root, 'node_modules', '.bin', 'prisma.cmd')
    : resolve(root, 'node_modules', '.bin', 'prisma')

const result = spawnSync(prismaCmd, args, {
  stdio: 'inherit',
  env: process.env,
  shell: process.platform === 'win32',
})

process.exit(result.status ?? 1)
