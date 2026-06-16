import { config } from 'dotenv'
import { resolve } from 'node:path'
import { defineConfig, env } from 'prisma/config'

const root = process.cwd()
config({ path: resolve(root, '.env.local') })
config({ path: resolve(root, '.env') })

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
    seed: 'tsx prisma/seed.ts',
  },
  datasource: {
    url: env('DATABASE_URL'),
  },
})
