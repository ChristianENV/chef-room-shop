/**
 * Chef Room database seed (catalog, RBAC, customization reference data).
 *
 * Auth users are created via Better Auth when SEED_ADMIN_* env vars are set.
 */
import { config } from 'dotenv'

config({ path: '.env.local' })
config({ path: '.env' })

import { RoleSlug, UserStatus } from '@prisma/client'

import { buildAuth } from '../src/server/auth/build-auth'
import { createPrismaClient } from '../src/server/db/create-prisma'
import { seedCanonicalProducts } from './seed-canonical-products'

const prisma = createPrismaClient()

const PERMISSIONS = [
  { slug: 'products.read', name: 'Ver productos' },
  { slug: 'products.write', name: 'Gestionar productos' },
  { slug: 'orders.read', name: 'Ver pedidos' },
  { slug: 'orders.write', name: 'Gestionar pedidos' },
  { slug: 'customization.read', name: 'Ver personalización' },
  { slug: 'customization.write', name: 'Gestionar personalización' },
  { slug: 'users.read', name: 'Ver usuarios' },
  { slug: 'users.write', name: 'Gestionar usuarios' },
  { slug: 'payments.read', name: 'Ver pagos' },
  { slug: 'shipping.read', name: 'Ver envíos' },
  { slug: 'analytics.read', name: 'Ver analítica' },
  { slug: 'settings.manage', name: 'Gestionar configuración' },
] as const

const ADMIN_PERMISSION_SLUGS = [
  'products.read',
  'products.write',
  'orders.read',
  'orders.write',
  'customization.read',
  'customization.write',
  'users.read',
  'shipping.read',
  'analytics.read',
] as const

const ROLES: {
  slug: RoleSlug
  name: string
  description: string
  permissionSlugs: readonly string[]
}[] = [
  {
    slug: RoleSlug.CUSTOMER,
    name: 'Cliente',
    description: 'Comprador de la tienda',
    permissionSlugs: [],
  },
  {
    slug: RoleSlug.ADMIN,
    name: 'Administrador',
    description: 'Operaciones del panel admin',
    permissionSlugs: ADMIN_PERMISSION_SLUGS,
  },
  {
    slug: RoleSlug.SUPERADMIN,
    name: 'Super administrador',
    description: 'Acceso completo al sistema',
    permissionSlugs: PERMISSIONS.map((p) => p.slug),
  },
]

const PRODUCT_TYPES = [
  {
    slug: 'chef-jacket',
    shopSlug: 'filipinas',
    nameEs: 'Filipinas',
    nameEn: 'Chef jackets',
    sortOrder: 10,
    isActive: true,
    showInNav: true,
  },
  {
    slug: 'apron',
    shopSlug: 'mandiles',
    nameEs: 'Mandiles',
    nameEn: 'Aprons',
    sortOrder: 20,
    isActive: true,
    showInNav: true,
  },
  {
    slug: 'pants',
    shopSlug: 'pantalones',
    nameEs: 'Pantalones',
    nameEn: 'Pants',
    sortOrder: 30,
    isActive: true,
    showInNav: true,
  },
  {
    slug: 'shoes',
    shopSlug: 'zapatos',
    nameEs: 'Zapatos',
    nameEn: 'Shoes',
    sortOrder: 40,
    isActive: true,
    showInNav: true,
  },
] as const

const APPAREL_SIZES = [
  { slug: 'xs', name: 'XS', sortOrder: 1 },
  { slug: 's', name: 'S', sortOrder: 2 },
  { slug: 'm', name: 'M', sortOrder: 3 },
  { slug: 'l', name: 'L', sortOrder: 4 },
  { slug: 'xl', name: 'XL', sortOrder: 5 },
  { slug: 'xxl', name: 'XXL', sortOrder: 6 },
] as const

const SHOE_SIZES = [
  { slug: '22', name: '22', sortOrder: 220 },
  { slug: '23', name: '23', sortOrder: 230 },
  { slug: '24', name: '24', sortOrder: 240 },
  { slug: '25', name: '25', sortOrder: 250 },
  { slug: '26', name: '26', sortOrder: 260 },
  { slug: '27', name: '27', sortOrder: 270 },
  { slug: '28', name: '28', sortOrder: 280 },
  { slug: '29', name: '29', sortOrder: 290 },
  { slug: '30', name: '30', sortOrder: 300 },
] as const

const SIZES = [...APPAREL_SIZES, ...SHOE_SIZES] as const

import { SEED_ALL_COLORS } from './seed-colors.data'

const CUSTOMIZATION_AREAS = [
  { slug: 'chest', nameEs: 'Pecho', nameEn: 'Chest', sortOrder: 1 },
  { slug: 'back', nameEs: 'Espalda', nameEn: 'Back', sortOrder: 2 },
  { slug: 'left-sleeve', nameEs: 'Manga izquierda', nameEn: 'Left sleeve', sortOrder: 3 },
  { slug: 'right-sleeve', nameEs: 'Manga derecha', nameEn: 'Right sleeve', sortOrder: 4 },
  { slug: 'pocket', nameEs: 'Bolsillo', nameEn: 'Pocket', sortOrder: 5 },
] as const

const CUSTOMIZATION_OPTIONS = [
  { slug: 'embroidery', nameEs: 'Bordado', nameEn: 'Embroidery', priceCents: 19900 },
  { slug: 'print', nameEs: 'Estampado', nameEn: 'Print', priceCents: 14900 },
  { slug: 'patch', nameEs: 'Patch', nameEn: 'Patch', priceCents: 9900 },
  { slug: 'logo', nameEs: 'Logo', nameEn: 'Logo', priceCents: 24900 },
  { slug: 'text', nameEs: 'Texto', nameEn: 'Text', priceCents: 14900 },
] as const

async function seedPermissions() {
  const permissionIds = new Map<string, string>()

  for (const permission of PERMISSIONS) {
    const record = await prisma.permission.upsert({
      where: { slug: permission.slug },
      update: { name: permission.name },
      create: permission,
    })
    permissionIds.set(record.slug, record.id)
  }

  return permissionIds
}

async function seedRoles(permissionIds: Map<string, string>) {
  for (const role of ROLES) {
    const dbRole = await prisma.role.upsert({
      where: { slug: role.slug },
      update: { name: role.name, description: role.description },
      create: {
        slug: role.slug,
        name: role.name,
        description: role.description,
      },
    })

    for (const slug of role.permissionSlugs) {
      const permissionId = permissionIds.get(slug)
      if (!permissionId) continue

      await prisma.rolePermission.upsert({
        where: {
          roleId_permissionId: {
            roleId: dbRole.id,
            permissionId,
          },
        },
        update: {},
        create: {
          roleId: dbRole.id,
          permissionId,
        },
      })
    }
  }
}

async function upsertProductType(type: (typeof PRODUCT_TYPES)[number]) {
  if (type.shopSlug) {
    await prisma.productType.updateMany({
      where: {
        shopSlug: type.shopSlug,
        NOT: { slug: type.slug },
      },
      data: { shopSlug: null },
    })
  }

  await prisma.productType.upsert({
    where: { slug: type.slug },
    update: {
      shopSlug: type.shopSlug,
      nameEs: type.nameEs,
      nameEn: type.nameEn,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      showInNav: type.showInNav,
    },
    create: {
      slug: type.slug,
      shopSlug: type.shopSlug,
      nameEs: type.nameEs,
      nameEn: type.nameEn,
      sortOrder: type.sortOrder,
      isActive: type.isActive,
      showInNav: type.showInNav,
    },
  })
}

async function seedCatalog() {
  for (const type of PRODUCT_TYPES) {
    await upsertProductType(type)
  }

  for (const size of SIZES) {
    await prisma.size.upsert({
      where: { slug: size.slug },
      update: { name: size.name, sortOrder: size.sortOrder },
      create: size,
    })
  }

  for (const color of SEED_ALL_COLORS) {
    await prisma.color.upsert({
      where: { slug: color.slug },
      update: {
        name: color.name,
        hex: color.hex,
        isFabricColor: color.isFabricColor,
        isProductColor: color.isProductColor,
        isGeneralColor: color.isGeneralColor,
        isActive: color.isActive,
        sortOrder: color.sortOrder,
      },
      create: color,
    })
  }
}

async function seedCustomization() {
  for (const area of CUSTOMIZATION_AREAS) {
    await prisma.customizationArea.upsert({
      where: { slug: area.slug },
      update: {
        nameEs: area.nameEs,
        nameEn: area.nameEn,
        sortOrder: area.sortOrder,
      },
      create: area,
    })
  }

  for (const option of CUSTOMIZATION_OPTIONS) {
    await prisma.customizationOption.upsert({
      where: { slug: option.slug },
      update: {
        nameEs: option.nameEs,
        nameEn: option.nameEn,
        priceCents: option.priceCents,
      },
      create: option,
    })
  }
}

type OptionGroupData = {
  productTypeId: string
  slug: string
  name: string
  description?: string | null
  inputType: 'SINGLE_SELECT' | 'BOOLEAN'
  isRequired: boolean
  isActive: boolean
  sortOrder: number
  configJson?: any
  values: {
    slug: string
    label: string
    description?: string | null
    priceDeltaCents: number
    isDefault: boolean
    isActive: boolean
    sortOrder: number
    configJson?: any
  }[]
}

async function upsertOptionGroup(data: OptionGroupData) {
  let group = await prisma.productOptionGroup.findFirst({
    where: {
      slug: data.slug,
      productTypeId: data.productTypeId,
    },
  })

  if (!group) {
    group = await prisma.productOptionGroup.create({
      data: {
        productTypeId: data.productTypeId,
        slug: data.slug,
        name: data.name,
        description: data.description,
        inputType: data.inputType,
        isRequired: data.isRequired,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        configJson: data.configJson,
      },
    })
  } else {
    group = await prisma.productOptionGroup.update({
      where: { id: group.id },
      data: {
        name: data.name,
        description: data.description,
        inputType: data.inputType,
        isRequired: data.isRequired,
        isActive: data.isActive,
        sortOrder: data.sortOrder,
        configJson: data.configJson,
      },
    })
  }

  for (const valueData of data.values) {
    let value = await prisma.productOptionValue.findFirst({
      where: {
        optionGroupId: group.id,
        slug: valueData.slug,
      },
    })

    if (!value) {
      await prisma.productOptionValue.create({
        data: {
          optionGroupId: group.id,
          slug: valueData.slug,
          label: valueData.label,
          description: valueData.description,
          priceDeltaCents: valueData.priceDeltaCents,
          isDefault: valueData.isDefault,
          isActive: valueData.isActive,
          sortOrder: valueData.sortOrder,
          configJson: valueData.configJson,
        },
      })
    } else {
      await prisma.productOptionValue.update({
        where: { id: value.id },
        data: {
          label: valueData.label,
          description: valueData.description,
          priceDeltaCents: valueData.priceDeltaCents,
          isDefault: valueData.isDefault,
          isActive: valueData.isActive,
          sortOrder: valueData.sortOrder,
          configJson: valueData.configJson,
        },
      })
    }
  }
}

async function seedProductOptions() {
  const productTypes = await prisma.productType.findMany({
    where: {
      slug: { in: ['chef-jacket', 'pants', 'apron'] },
    },
  })

  const chefJacketType = productTypes.find((pt) => pt.slug === 'chef-jacket')
  const pantsType = productTypes.find((pt) => pt.slug === 'pants')
  const apronType = productTypes.find((pt) => pt.slug === 'apron')

  if (!chefJacketType || !pantsType || !apronType) {
    throw new Error('Product types not found for product options seed')
  }

  // A. Chef jackets / Filipinas: Dry fit option
  await upsertOptionGroup({
    productTypeId: chefJacketType.id,
    slug: 'dry-fit-back',
    name: 'Dry fit en espalda',
    description: 'Añade dry fit en el panel trasero de la filipina',
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 10,
    configJson: {
      appliesToPanel: 'back',
      note: 'Dry fit only applies to back panel',
    },
    values: [
      {
        slug: 'sin-dry-fit',
        label: 'Sin dry fit',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'con-dry-fit',
        label: 'Con dry fit en espalda',
        description: 'Dry fit aplicado únicamente al panel trasero',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    ],
  })

  // B. Pants / Pantalón: Pockets option
  await upsertOptionGroup({
    productTypeId: pantsType.id,
    slug: 'pockets',
    name: 'Bolsas',
    description: 'Modelo con o sin bolsas cargo',
    inputType: 'SINGLE_SELECT',
    isRequired: true,
    isActive: true,
    sortOrder: 10,
    configJson: {
      notes: 'Cargo style includes side pockets and rear pockets',
    },
    values: [
      {
        slug: 'sin-bolsas-cargo',
        label: 'Sin bolsas cargo',
        description: 'Modelo simple sin bolsas adicionales',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'con-bolsas-cargo',
        label: 'Con bolsas cargo',
        description: 'Incluye bolsas laterales y traseras',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    ],
  })

  // C. Apron / Mandil: Embroidery option
  await upsertOptionGroup({
    productTypeId: apronType.id,
    slug: 'embroidery',
    name: 'Bordado',
    description: 'Añade bordado personalizado al mandil',
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 10,
    values: [
      {
        slug: 'sin-bordado',
        label: 'Sin bordado',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'con-bordado',
        label: 'Con bordado',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    ],
  })

  // C2. Apron / Mandil: Embroidery position
  await upsertOptionGroup({
    productTypeId: apronType.id,
    slug: 'embroidery-position',
    name: 'Posición del bordado',
    description: 'Ubicación del bordado en el mandil',
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 20,
    values: [
      {
        slug: 'derecha',
        label: 'Derecha',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'izquierda',
        label: 'Izquierda',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    ],
  })

  // C3. Apron / Mandil: Embroidery size
  await upsertOptionGroup({
    productTypeId: apronType.id,
    slug: 'embroidery-size',
    name: 'Tamaño del bordado',
    description: 'Tamaño del bordado personalizado',
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 30,
    values: [
      {
        slug: 'chica',
        label: 'Chica',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'mediana',
        label: 'Mediana',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 2,
      },
      {
        slug: 'grande',
        label: 'Grande',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 3,
      },
    ],
  })

  // C4. Apron / Mandil: Apron length
  await upsertOptionGroup({
    productTypeId: apronType.id,
    slug: 'apron-length',
    name: 'Largo del mandil',
    description: 'Largo estándar o extendido del mandil',
    inputType: 'SINGLE_SELECT',
    isRequired: false,
    isActive: true,
    sortOrder: 40,
    values: [
      {
        slug: 'normal',
        label: 'Largo normal',
        priceDeltaCents: 0,
        isDefault: true,
        isActive: true,
        sortOrder: 1,
      },
      {
        slug: 'mas-10cm',
        label: '+10 cm',
        description: 'Mandil 10 cm más largo',
        priceDeltaCents: 0,
        isDefault: false,
        isActive: true,
        sortOrder: 2,
      },
    ],
  })

  console.log('Product options seeded successfully.')
}

/**
 * Optional DEV admin via Better Auth sign-up API (password stored on Account, not User).
 */
async function seedDevAdmin() {
  const email = process.env.SEED_ADMIN_EMAIL?.trim().toLowerCase()
  const password = process.env.SEED_ADMIN_PASSWORD
  const firstName = process.env.SEED_ADMIN_FIRST_NAME?.trim() || 'Admin'
  const lastName = process.env.SEED_ADMIN_LAST_NAME?.trim() || 'Chef Room'

  if (!email || !password) {
    return
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    console.warn('SEED_ADMIN_* set but BETTER_AUTH_SECRET is missing — skip DEV admin seed.')
    return
  }

  const adminRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.ADMIN },
  })

  if (!adminRole) {
    throw new Error('ADMIN role missing — run role seed first')
  }

  const auth = buildAuth(prisma, { disableEmailCallbacks: true })
  const name = `${firstName} ${lastName}`.trim()

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    await auth.api.signUpEmail({
      body: {
        email,
        password,
        name,
      },
    })
    user = await prisma.user.findUniqueOrThrow({ where: { email } })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName,
      lastName,
      name,
      status: UserStatus.ACTIVE,
      emailVerified: true,
    },
  })

  const existingRole = await prisma.userRole.findUnique({
    where: { userId_roleId: { userId: user.id, roleId: adminRole.id } },
  })

  if (!existingRole) {
    await prisma.userRole.create({
      data: { userId: user.id, roleId: adminRole.id },
    })
  }

  const customerRole = await prisma.role.findUnique({
    where: { slug: RoleSlug.CUSTOMER },
  })

  if (customerRole) {
    const hasCustomer = await prisma.userRole.findUnique({
      where: {
        userId_roleId: { userId: user.id, roleId: customerRole.id },
      },
    })
    if (!hasCustomer) {
      await prisma.userRole.create({
        data: { userId: user.id, roleId: customerRole.id },
      })
    }
  }

  console.log(`DEV admin user ensured for ${email}`)
}

async function main() {
  console.log('Seeding Chef Room database...')

  const permissionIds = await seedPermissions()
  await seedRoles(permissionIds)
  await seedCatalog()
  await seedProductOptions()
  await seedCustomization()
  await seedCanonicalProducts(prisma)
  await seedDevAdmin()

  console.log('Seed completed.')
}

main()
  .catch((error) => {
    console.error('Seed failed:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
