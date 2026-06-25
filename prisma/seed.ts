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
import { seedSticoDraftProduct } from './seed-stico-product'

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

const COLORS = [
  { slug: 'chef-blue', name: 'Azul Chef Room', hex: '#2B3280' },
  { slug: 'white', name: 'Blanco', hex: '#FFFFFF' },
  { slug: 'black', name: 'Negro', hex: '#111111' },
  { slug: 'warm-gray', name: 'Gris cálido', hex: '#E2E0DB' },
] as const

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

  for (const color of COLORS) {
    await prisma.color.upsert({
      where: { slug: color.slug },
      update: { name: color.name, hex: color.hex },
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
  await seedCustomization()
  await seedSticoDraftProduct(prisma)
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
