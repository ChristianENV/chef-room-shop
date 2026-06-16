import { createPrismaClient } from '../src/server/db/create-prisma'

const prisma = createPrismaClient()

async function main() {
  const rows = await prisma.$queryRaw<{ table_name: string }[]>`
    SELECT table_name
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_type = 'BASE TABLE'
    ORDER BY table_name
  `

  console.log(`table_count: ${rows.length}`)
  if (rows.length > 0) {
    console.log(`tables: ${rows.map((r) => r.table_name).join(', ')}`)
  }
}

main()
  .catch((error) => {
    console.error(error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
