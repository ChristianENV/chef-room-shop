import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  const [roles, permissions, productTypes, sizes, colors, areas, options] =
    await Promise.all([
      prisma.role.count(),
      prisma.permission.count(),
      prisma.productType.count(),
      prisma.size.count(),
      prisma.color.count(),
      prisma.customizationArea.count(),
      prisma.customizationOption.count(),
    ])

  console.log(
    JSON.stringify({
      roles,
      permissions,
      productTypes,
      sizes,
      colors,
      customizationAreas: areas,
      customizationOptions: options,
    }),
  )
}

main()
  .finally(async () => {
    await prisma.$disconnect()
  })
