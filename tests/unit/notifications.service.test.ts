import { config } from 'dotenv'
import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

config({ path: '.env.local' })

function canRunDbIntegrationTests(): boolean {
  const url = process.env.DATABASE_URL?.trim()
  if (!url) return false
  if (url.includes('localhost:5432/chef_room')) return false
  return true
}

const hasDatabase = canRunDbIntegrationTests()

async function loadPrismaModules() {
  await import('./helpers/mock-server-only')
  const prismaModule = await import('@/src/server/db/prisma')
  return { prisma: prismaModule.prisma }
}

async function loadNotificationModules() {
  await import('./helpers/mock-server-only')
  const [service, mappers] = await Promise.all([
    import('@/src/server/notifications/notification.service'),
    import('@/src/server/notifications/notification.mappers'),
  ])

  return { ...service, ...mappers }
}

import type { CurrentUser } from '@/src/server/auth/types'
import type { GraphQLContext } from '@/src/server/graphql/context'
import { NotificationAudience, NotificationType } from '@prisma/client'

function buildUser(overrides: Partial<CurrentUser> & Pick<CurrentUser, 'id'>): CurrentUser {
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

function buildContext(
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

describe('notification mappers', () => {
  it('sanitizes sensitive metadata keys', async () => {
    const { sanitizeNotificationMetadata } = await loadNotificationModules()

    const result = sanitizeNotificationMetadata({
      orderNumber: 'CR-1001',
      token: 'secret-token',
      apiKey: 'abc',
      password: 'hidden',
    })

    assert.deepEqual(result, { orderNumber: 'CR-1001' })
  })

  it('builds customer visibility where clause', async () => {
    const { buildReadableNotificationsWhere } = await loadNotificationModules()
    const user = buildUser({ id: '11111111-1111-4111-8111-111111111111' })

    const where = buildReadableNotificationsWhere(user, new Date('2026-06-17T12:00:00.000Z'))

    assert.deepEqual(where, {
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date('2026-06-17T12:00:00.000Z') } }] },
        { userId: user.id, audience: 'USER' },
      ],
    })
  })
})

describe('notifications service', { skip: !hasDatabase }, () => {
  const cleanup = { notificationIds: [] as string[], userIds: [] as string[] }

  after(async () => {
    const { prisma } = await loadPrismaModules()

    if (cleanup.notificationIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { id: { in: cleanup.notificationIds } },
      })
    }

    if (cleanup.userIds.length > 0) {
      await prisma.notification.deleteMany({
        where: { userId: { in: cleanup.userIds } },
      })
      await prisma.user.deleteMany({ where: { id: { in: cleanup.userIds } } })
    }

    await prisma.$disconnect()
  })

  it('authenticated user can fetch own notifications', async () => {
    const { prisma } = await loadPrismaModules()
    const {
      createUserNotification,
      getMyNotifications,
    } = await loadNotificationModules()

    const user = await prisma.user.create({
      data: {
        name: 'Notifications User',
        email: `notif-user-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const notification = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.ORDER_CREATED,
      title: 'Pedido creado',
      message: 'Tu pedido fue registrado.',
    })
    cleanup.notificationIds.push(notification.id)

    const context = buildContext(prisma, buildUser({ id: user.id }))
    const result = await getMyNotifications(context)

    assert.equal(result.totalCount, 1)
    assert.equal(result.nodes[0]?.id, notification.id)
    assert.equal(result.nodes[0]?.title, 'Pedido creado')
  })

  it('user cannot read another user notifications', async () => {
    const { prisma } = await loadPrismaModules()
    const {
      createUserNotification,
      getMyNotifications,
      markNotificationRead,
    } = await loadNotificationModules()

    const owner = await prisma.user.create({
      data: {
        name: 'Owner',
        email: `notif-owner-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    const other = await prisma.user.create({
      data: {
        name: 'Other',
        email: `notif-other-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(owner.id, other.id)

    const notification = await createUserNotification(prisma, {
      userId: owner.id,
      type: NotificationType.SYSTEM,
      title: 'Privada',
      message: 'Solo para el dueño.',
    })
    cleanup.notificationIds.push(notification.id)

    const otherContext = buildContext(prisma, buildUser({ id: other.id }))
    const list = await getMyNotifications(otherContext)

    assert.equal(list.totalCount, 0)

    await assert.rejects(
      () => markNotificationRead(otherContext, notification.id),
      (error: Error & { extensions?: { code?: string } }) => {
        return error.extensions?.code === 'NOT_FOUND'
      },
    )
  })

  it('unread count works', async () => {
    const { prisma } = await loadPrismaModules()
    const {
      createUserNotification,
      getMyUnreadNotificationCount,
      markNotificationRead,
    } = await loadNotificationModules()

    const user = await prisma.user.create({
      data: {
        name: 'Unread User',
        email: `notif-unread-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const first = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.PAYMENT_PENDING,
      title: 'Pago pendiente',
      message: 'Completa tu pago.',
    })
    const second = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.PAYMENT_CONFIRMED,
      title: 'Pago confirmado',
      message: 'Gracias.',
    })
    cleanup.notificationIds.push(first.id, second.id)

    const context = buildContext(prisma, buildUser({ id: user.id }))

    assert.equal(await getMyUnreadNotificationCount(context), 2)

    await markNotificationRead(context, first.id)

    assert.equal(await getMyUnreadNotificationCount(context), 1)
  })

  it('mark one notification read is idempotent', async () => {
    const { prisma } = await loadPrismaModules()
    const { createUserNotification, markNotificationRead } = await loadNotificationModules()

    const user = await prisma.user.create({
      data: {
        name: 'Read User',
        email: `notif-read-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const notification = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.DESIGN_SAVED,
      title: 'Diseño guardado',
      message: 'Listo.',
    })
    cleanup.notificationIds.push(notification.id)

    const context = buildContext(prisma, buildUser({ id: user.id }))
    const first = await markNotificationRead(context, notification.id)
    const second = await markNotificationRead(context, notification.id)

    assert.ok(first.readAt)
    assert.equal(first.readAt, second.readAt)
  })

  it('mark all notifications read works', async () => {
    const { prisma } = await loadPrismaModules()
    const {
      createUserNotification,
      getMyUnreadNotificationCount,
      markAllNotificationsRead,
    } = await loadNotificationModules()

    const user = await prisma.user.create({
      data: {
        name: 'Read All User',
        email: `notif-read-all-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const first = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: 'Uno',
      message: 'Uno',
    })
    const second = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: 'Dos',
      message: 'Dos',
    })
    cleanup.notificationIds.push(first.id, second.id)

    const context = buildContext(prisma, buildUser({ id: user.id }))
    const payload = await markAllNotificationsRead(context)

    assert.equal(payload.updatedCount, 2)
    assert.equal(await getMyUnreadNotificationCount(context), 0)
  })

  it('expired notifications are excluded by default', async () => {
    const { prisma } = await loadPrismaModules()
    const { createUserNotification, getMyNotifications } = await loadNotificationModules()

    const user = await prisma.user.create({
      data: {
        name: 'Expired User',
        email: `notif-expired-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(user.id)

    const active = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: 'Activa',
      message: 'Visible',
    })
    const expired = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.SYSTEM,
      title: 'Expirada',
      message: 'Oculta',
      expiresAt: new Date(Date.now() - 60_000),
    })
    cleanup.notificationIds.push(active.id, expired.id)

    const context = buildContext(prisma, buildUser({ id: user.id }))
    const result = await getMyNotifications(context)

    assert.equal(result.totalCount, 1)
    assert.equal(result.nodes[0]?.id, active.id)
  })

  it('customer cannot see admin audience notifications', async () => {
    const { prisma } = await loadPrismaModules()
    const {
      createAdminNotification,
      createUserNotification,
      getMyNotifications,
    } = await loadNotificationModules()

    const customer = await prisma.user.create({
      data: {
        name: 'Customer',
        email: `notif-customer-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    const admin = await prisma.user.create({
      data: {
        name: 'Admin',
        email: `notif-admin-${Date.now()}@example.com`,
        emailVerified: true,
      },
    })
    cleanup.userIds.push(customer.id, admin.id)

    const userNotification = await createUserNotification(prisma, {
      userId: customer.id,
      type: NotificationType.ORDER_CREATED,
      title: 'Tu pedido',
      message: 'OK',
    })
    const adminNotification = await createAdminNotification(prisma, {
      userId: admin.id,
      type: NotificationType.ADMIN_NEW_ORDER,
      title: 'Nuevo pedido',
      message: 'Revisar panel',
    })
    cleanup.notificationIds.push(userNotification.id, adminNotification.id)

    const customerContext = buildContext(
      prisma,
      buildUser({ id: customer.id, roles: ['CUSTOMER'] }),
    )
    const customerResult = await getMyNotifications(customerContext)

    assert.equal(customerResult.totalCount, 1)
    assert.equal(customerResult.nodes[0]?.audience, NotificationAudience.USER)

    const adminContext = buildContext(
      prisma,
      buildUser({ id: admin.id, roles: ['ADMIN'] }),
    )
    const adminResult = await getMyNotifications(adminContext)

    assert.equal(adminResult.totalCount, 1)
    assert.equal(adminResult.nodes[0]?.audience, NotificationAudience.ADMIN)
  })
})
