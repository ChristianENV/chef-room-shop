import { PrismaClient, RoleSlug, UserStatus, CustomerTier } from '@prisma/client'
import { buildAuth } from '../../src/server/auth/build-auth'

import { DEMO_PASSWORD } from './constants'

type AuthInstance = ReturnType<typeof buildAuth>

type SocialLink = {
  providerId: 'google' | 'facebook'
  accountId: string
}

type DemoUserSpec = {
  email: string
  firstName: string
  lastName: string
  phone: string
  marketingOptIn: boolean
  roles: RoleSlug[]
  customerTier?: CustomerTier
  social?: SocialLink[]
}

const ADMIN_SPECS: DemoUserSpec[] = [
  {
    email: 'cnoriegava@gmail.com',
    firstName: 'Christian',
    lastName: 'Noriega',
    phone: '+525512340001',
    marketingOptIn: false,
    roles: [RoleSlug.SUPERADMIN],
  },
  {
    email: 'cnoriegava+1@gmail.com',
    firstName: 'Admin',
    lastName: 'Chef Room',
    phone: '+525512340002',
    marketingOptIn: false,
    roles: [RoleSlug.ADMIN],
  },
  {
    email: 'cnoriegava+2@gmail.com',
    firstName: 'Operaciones',
    lastName: 'Chef Room',
    phone: '+525512340003',
    marketingOptIn: false,
    roles: [RoleSlug.ADMIN],
  },
  {
    email: 'cnoriegava+3@gmail.com',
    firstName: 'Ventas',
    lastName: 'Chef Room',
    phone: '+525512340004',
    marketingOptIn: false,
    roles: [RoleSlug.ADMIN],
  },
  {
    email: 'cnoriegava+4@gmail.com',
    firstName: 'Producción',
    lastName: 'Chef Room',
    phone: '+525512340005',
    marketingOptIn: false,
    roles: [RoleSlug.ADMIN],
  },
  {
    email: 'cnoriegava+5@gmail.com',
    firstName: 'Soporte',
    lastName: 'Chef Room',
    phone: '+525512340006',
    marketingOptIn: false,
    roles: [RoleSlug.ADMIN],
  },
]

const CUSTOMER_FIRST_NAMES = [
  'María',
  'José',
  'Ana',
  'Luis',
  'Sofía',
  'Carlos',
  'Elena',
  'Miguel',
  'Laura',
  'Diego',
  'Patricia',
  'Fernando',
  'Gabriela',
  'Ricardo',
  'Claudia',
  'Andrés',
  'Valeria',
  'Roberto',
  'Isabel',
  'Javier',
] as const

const CUSTOMER_LAST_NAMES = [
  'Hernández',
  'García',
  'López',
  'Martínez',
  'González',
  'Rodríguez',
  'Pérez',
  'Sánchez',
  'Ramírez',
  'Torres',
  'Flores',
  'Rivera',
  'Gómez',
  'Díaz',
  'Cruz',
  'Morales',
  'Reyes',
  'Gutiérrez',
  'Ortiz',
  'Chávez',
] as const

function buildCustomerSpecs(): DemoUserSpec[] {
  return Array.from({ length: 20 }, (_, index) => {
    const n = index + 1
    let social: SocialLink[] | undefined

    if (n >= 9 && n <= 14) {
      social = [{ providerId: 'google', accountId: `google-demo-user-${n}` }]
    } else if (n >= 15) {
      social = [{ providerId: 'facebook', accountId: `facebook-demo-user-${n}` }]
    }

    return {
      email: `cliente.demo+${n}@chefroom.test`,
      firstName: CUSTOMER_FIRST_NAMES[index]!,
      lastName: CUSTOMER_LAST_NAMES[index]!,
      phone: `+5255${String(1000000 + n).slice(-7)}`,
      marketingOptIn: n % 2 === 0,
      roles: [RoleSlug.CUSTOMER],
      customerTier: n === 1 ? CustomerTier.PREMIUM : CustomerTier.REGULAR,
      social,
    }
  })
}

async function ensureUserRole(
  prisma: PrismaClient,
  userId: string,
  roleSlug: RoleSlug,
): Promise<void> {
  const role = await prisma.role.findUniqueOrThrow({
    where: { slug: roleSlug },
  })
  await prisma.userRole.upsert({
    where: { userId_roleId: { userId, roleId: role.id } },
    update: {},
    create: { userId, roleId: role.id },
  })
}

async function ensureCredentialAccount(
  prisma: PrismaClient,
  userId: string,
  email: string,
): Promise<void> {
  const existing = await prisma.account.findFirst({
    where: { userId, providerId: 'credential' },
  })
  if (existing) return

  await prisma.account.create({
    data: {
      userId,
      providerId: 'credential',
      accountId: email,
    },
  })
}

async function ensureSocialAccounts(
  prisma: PrismaClient,
  userId: string,
  links: SocialLink[],
): Promise<void> {
  for (const link of links) {
    await prisma.account.upsert({
      where: {
        providerId_accountId: {
          providerId: link.providerId,
          accountId: link.accountId,
        },
      },
      update: { userId },
      create: {
        userId,
        providerId: link.providerId,
        accountId: link.accountId,
      },
    })
  }
}

/**
 * Creates or updates a demo user via Better Auth email sign-up + profile patch.
 */
async function ensureDemoUser(
  prisma: PrismaClient,
  auth: AuthInstance,
  spec: DemoUserSpec,
): Promise<string> {
  const email = spec.email.toLowerCase()
  const name = `${spec.firstName} ${spec.lastName}`.trim()

  let user = await prisma.user.findUnique({ where: { email } })

  if (!user) {
    await auth.api.signUpEmail({
      body: {
        email,
        password: DEMO_PASSWORD,
        name,
      },
    })
    user = await prisma.user.findUniqueOrThrow({ where: { email } })
  }

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name,
      firstName: spec.firstName,
      lastName: spec.lastName,
      phone: spec.phone,
      marketingOptIn: spec.marketingOptIn,
      status: UserStatus.ACTIVE,
      customerTier: spec.customerTier ?? CustomerTier.REGULAR,
      emailVerified: true,
    },
  })

  await ensureCredentialAccount(prisma, user.id, email)

  for (const roleSlug of spec.roles) {
    await ensureUserRole(prisma, user.id, roleSlug)
  }

  if (spec.social?.length) {
    await ensureSocialAccounts(prisma, user.id, spec.social)
  }

  return user.id
}

export type SeededUsersResult = {
  adminIds: string[]
  customerIds: string[]
  superAdminId: string
  accounts: number
}

/**
 * Seeds 5 admin + 20 customer demo users (idempotent).
 */
export async function seedDemoUsers(
  prisma: PrismaClient,
  auth: AuthInstance,
): Promise<SeededUsersResult> {
  const adminIds: string[] = []
  let superAdminId = ''

  for (const spec of ADMIN_SPECS) {
    const id = await ensureDemoUser(prisma, auth, spec)
    adminIds.push(id)
    if (spec.roles.includes(RoleSlug.SUPERADMIN)) {
      superAdminId = id
    }
  }

  const customerIds: string[] = []
  for (const spec of buildCustomerSpecs()) {
    customerIds.push(await ensureDemoUser(prisma, auth, spec))
  }

  const accounts = await prisma.account.count({
    where: {
      userId: { in: [...adminIds, ...customerIds] },
    },
  })

  return { adminIds, customerIds, superAdminId, accounts }
}
