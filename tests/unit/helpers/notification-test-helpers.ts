import { config } from 'dotenv'

import type { CurrentUser } from '@/src/server/auth/types'
import type { GraphQLContext } from '@/src/server/graphql/context'
import type { PrismaClient } from '@prisma/client'

config({ path: '.env.local' })

export { canRunDbIntegrationTests, canRunNotificationDbTests } from './db-integration'

export async function loadPrisma(): Promise<{ prisma: PrismaClient }> {
  await import('./mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

export async function loadNotificationModules() {
  await import('./mock-server-only')
  const [service, mappers] = await Promise.all([
    import('@/src/server/notifications/notification.service'),
    import('@/src/server/notifications/notification.mappers'),
  ])

  return { ...service, ...mappers }
}

export function buildTestUser(
  overrides: Partial<CurrentUser> & Pick<CurrentUser, 'id'>,
): CurrentUser {
  return {
    id: overrides.id,
    email: overrides.email ?? `${overrides.id}@example.com`,
    emailVerified: overrides.emailVerified ?? true,
    name: overrides.name ?? 'Test User',
    firstName: overrides.firstName ?? null,
    lastName: overrides.lastName ?? null,
    phone: overrides.phone ?? null,
    image: overrides.image ?? null,
    customerTier: overrides.customerTier ?? 'REGULAR',
    roles: overrides.roles ?? ['CUSTOMER'],
    permissions: overrides.permissions ?? [],
  }
}

export function buildNotificationContext(
  prisma: GraphQLContext['prisma'],
  user: CurrentUser | null,
): GraphQLContext {
  return {
    prisma,
    currentUser: user,
    ipAddress: null,
    userAgent: null,
  }
}

export class NotificationTestCleanup {
  readonly notificationIds: string[] = []
  readonly userIds: string[] = []

  trackNotification(id: string): void {
    this.notificationIds.push(id)
  }

  trackNotifications(ids: string[]): void {
    this.notificationIds.push(...ids)
  }

  trackUser(id: string): void {
    this.userIds.push(id)
  }

  async dispose(): Promise<void> {
    const { prisma } = await loadPrisma()

    if (this.notificationIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: this.notificationIds } },
      })
    }

    if (this.userIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: { in: this.userIds } },
      })
      await prisma.user.deleteMany({ where: { id: { in: this.userIds } } })
    }

    await prisma.$disconnect()
  }
}

export async function createUniqueTestUser(
  prisma: PrismaClient,
  label: string,
  cleanup: NotificationTestCleanup,
) {
  const user = await prisma.user.create({
    data: {
      name: label,
      email: `notif-${label}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}@example.com`,
      emailVerified: true,
    },
  })
  cleanup.trackUser(user.id)
  return user
}
