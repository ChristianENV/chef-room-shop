import assert from 'node:assert/strict'
import { after, describe, it } from 'node:test'

import { NotificationAudience, NotificationType } from '@prisma/client'

import {
  buildNotificationContext,
  buildTestUser,
  canRunNotificationDbTests,
  createUniqueTestUser,
  loadNotificationModules,
  loadPrisma,
  NotificationTestCleanup,
} from './helpers/notification-test-helpers'

const hasDatabase = canRunNotificationDbTests()

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
    const user = buildTestUser({ id: '11111111-1111-4111-8111-111111111111' })

    const where = buildReadableNotificationsWhere(user, new Date('2026-06-17T12:00:00.000Z'))

    assert.deepEqual(where, {
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: new Date('2026-06-17T12:00:00.000Z') } }] },
        { userId: user.id, audience: 'USER' },
      ],
    })
  })

  it('builds admin visibility where clause', async () => {
    const { buildReadableNotificationsWhere } = await loadNotificationModules()
    const admin = buildTestUser({
      id: '22222222-2222-4222-8222-222222222222',
      roles: ['ADMIN'],
    })
    const now = new Date('2026-06-17T12:00:00.000Z')

    const where = buildReadableNotificationsWhere(admin, now)

    assert.deepEqual(where, {
      AND: [
        { OR: [{ expiresAt: null }, { expiresAt: { gt: now } }] },
        {
          OR: [
            { userId: admin.id, audience: 'USER' },
            {
              audience: 'ADMIN',
              OR: [{ userId: admin.id }, { userId: null }],
            },
          ],
        },
      ],
    })
  })
})

describe('canUserReadNotification', () => {
  it('allows owners to read their USER notifications', async () => {
    const { canUserReadNotification } = await loadNotificationModules()
    const user = buildTestUser({ id: '11111111-1111-4111-8111-111111111111' })

    assert.equal(
      canUserReadNotification(user, {
        userId: user.id,
        audience: NotificationAudience.USER,
      }),
      true,
    )
  })

  it('denies other users from reading USER notifications', async () => {
    const { canUserReadNotification } = await loadNotificationModules()
    const owner = buildTestUser({ id: '11111111-1111-4111-8111-111111111111' })
    const other = buildTestUser({ id: '22222222-2222-4222-8222-222222222222' })

    assert.equal(
      canUserReadNotification(other, {
        userId: owner.id,
        audience: NotificationAudience.USER,
      }),
      false,
    )
  })

  it('allows admins to read targeted and broadcast ADMIN notifications', async () => {
    const { canUserReadNotification } = await loadNotificationModules()
    const admin = buildTestUser({
      id: '33333333-3333-4333-8333-333333333333',
      roles: ['ADMIN'],
    })

    assert.equal(
      canUserReadNotification(admin, {
        userId: admin.id,
        audience: NotificationAudience.ADMIN,
      }),
      true,
    )
    assert.equal(
      canUserReadNotification(admin, {
        userId: null,
        audience: NotificationAudience.ADMIN,
      }),
      true,
    )
  })

  it('denies customers from reading ADMIN notifications', async () => {
    const { canUserReadNotification } = await loadNotificationModules()
    const customer = buildTestUser({ id: '44444444-4444-4444-8444-444444444444' })

    assert.equal(
      canUserReadNotification(customer, {
        userId: null,
        audience: NotificationAudience.ADMIN,
      }),
      false,
    )
    assert.equal(
      canUserReadNotification(customer, {
        userId: '55555555-5555-4555-8555-555555555555',
        audience: NotificationAudience.ADMIN,
      }),
      false,
    )
  })
})

describe('notifications service', { skip: !hasDatabase }, () => {
  const cleanup = new NotificationTestCleanup()

  after(async () => {
    await cleanup.dispose()
  })

  it('authenticated user can fetch own notifications', async () => {
    const { prisma } = await loadPrisma()
    const { createUserNotification, getMyNotifications } = await loadNotificationModules()

    const user = await createUniqueTestUser(prisma, 'user', cleanup)

    const notification = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.ORDER_CREATED,
      title: 'Pedido creado',
      message: 'Tu pedido fue registrado.',
    })
    cleanup.trackNotification(notification.id)

    const context = buildNotificationContext(prisma, buildTestUser({ id: user.id }))
    const result = await getMyNotifications(context)

    assert.equal(result.totalCount, 1)
    assert.equal(result.nodes[0]?.id, notification.id)
    assert.equal(result.nodes[0]?.title, 'Pedido creado')
  })

  it('user cannot read another user notifications', async () => {
    const { prisma } = await loadPrisma()
    const {
      createUserNotification,
      getMyNotifications,
      markNotificationRead,
    } = await loadNotificationModules()

    const owner = await createUniqueTestUser(prisma, 'owner', cleanup)
    const other = await createUniqueTestUser(prisma, 'other', cleanup)

    const notification = await createUserNotification(prisma, {
      userId: owner.id,
      type: NotificationType.SYSTEM,
      title: 'Privada',
      message: 'Solo para el dueño.',
    })
    cleanup.trackNotification(notification.id)

    const otherContext = buildNotificationContext(prisma, buildTestUser({ id: other.id }))
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
    const { prisma } = await loadPrisma()
    const {
      createUserNotification,
      getMyUnreadNotificationCount,
      markNotificationRead,
    } = await loadNotificationModules()

    const user = await createUniqueTestUser(prisma, 'unread', cleanup)

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
    cleanup.trackNotifications([first.id, second.id])

    const context = buildNotificationContext(prisma, buildTestUser({ id: user.id }))

    assert.equal(await getMyUnreadNotificationCount(context), 2)

    await markNotificationRead(context, first.id)

    assert.equal(await getMyUnreadNotificationCount(context), 1)
  })

  it('mark one notification read is idempotent', async () => {
    const { prisma } = await loadPrisma()
    const { createUserNotification, markNotificationRead } = await loadNotificationModules()

    const user = await createUniqueTestUser(prisma, 'read', cleanup)

    const notification = await createUserNotification(prisma, {
      userId: user.id,
      type: NotificationType.DESIGN_SAVED,
      title: 'Diseño guardado',
      message: 'Listo.',
    })
    cleanup.trackNotification(notification.id)

    const context = buildNotificationContext(prisma, buildTestUser({ id: user.id }))
    const first = await markNotificationRead(context, notification.id)
    const second = await markNotificationRead(context, notification.id)

    assert.ok(first.readAt)
    assert.equal(first.readAt, second.readAt)
  })

  it('mark all notifications read works', async () => {
    const { prisma } = await loadPrisma()
    const {
      createUserNotification,
      getMyUnreadNotificationCount,
      markAllNotificationsRead,
    } = await loadNotificationModules()

    const user = await createUniqueTestUser(prisma, 'read-all', cleanup)

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
    cleanup.trackNotifications([first.id, second.id])

    const context = buildNotificationContext(prisma, buildTestUser({ id: user.id }))
    const payload = await markAllNotificationsRead(context)

    assert.equal(payload.updatedCount, 2)
    assert.equal(await getMyUnreadNotificationCount(context), 0)
  })

  it('expired notifications are excluded by default', async () => {
    const { prisma } = await loadPrisma()
    const { createUserNotification, getMyNotifications } = await loadNotificationModules()

    const user = await createUniqueTestUser(prisma, 'expired', cleanup)

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
    cleanup.trackNotifications([active.id, expired.id])

    const context = buildNotificationContext(prisma, buildTestUser({ id: user.id }))
    const result = await getMyNotifications(context)

    assert.equal(result.totalCount, 1)
    assert.equal(result.nodes[0]?.id, active.id)
  })

  it('customer cannot see admin audience notifications', async () => {
    const { prisma } = await loadPrisma()
    const {
      createAdminNotification,
      createUserNotification,
      getMyNotifications,
    } = await loadNotificationModules()

    const customer = await createUniqueTestUser(prisma, 'customer', cleanup)
    const admin = await createUniqueTestUser(prisma, 'admin', cleanup)

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
    cleanup.trackNotifications([userNotification.id, adminNotification.id])

    const customerContext = buildNotificationContext(
      prisma,
      buildTestUser({ id: customer.id, roles: ['CUSTOMER'] }),
    )
    const customerResult = await getMyNotifications(customerContext)
    const customerIds = customerResult.nodes.map((row) => row.id)

    assert.ok(customerIds.includes(userNotification.id))
    assert.ok(!customerIds.includes(adminNotification.id))
    assert.equal(
      customerResult.nodes.filter((row) => row.audience === NotificationAudience.ADMIN).length,
      0,
    )

    const adminContext = buildNotificationContext(
      prisma,
      buildTestUser({ id: admin.id, roles: ['ADMIN'] }),
    )
    const adminResult = await getMyNotifications(adminContext, {
      audience: NotificationAudience.ADMIN,
    })
    const adminIds = adminResult.nodes.map((row) => row.id)

    assert.ok(adminIds.includes(adminNotification.id))
    assert.ok(!adminIds.includes(userNotification.id))
    assert.equal(
      adminResult.nodes.find((row) => row.id === adminNotification.id)?.audience,
      NotificationAudience.ADMIN,
    )
  })

  it('admin sees broadcast admin notifications', async () => {
    const { prisma } = await loadPrisma()
    const { createAdminNotification, getMyNotifications } = await loadNotificationModules()

    const admin = await createUniqueTestUser(prisma, 'broadcast-admin', cleanup)
    const broadcast = await createAdminNotification(prisma, {
      userId: null,
      type: NotificationType.ADMIN_PAYMENT_RECEIVED,
      title: 'Pago recibido',
      message: 'Broadcast',
      dedupeKey: `test-broadcast:${admin.id}:${Date.now()}`,
    })
    cleanup.trackNotification(broadcast.id)

    const adminContext = buildNotificationContext(
      prisma,
      buildTestUser({ id: admin.id, roles: ['ADMIN'] }),
    )
    const result = await getMyNotifications(adminContext, {
      audience: NotificationAudience.ADMIN,
    })

    assert.ok(result.nodes.some((row) => row.id === broadcast.id))
  })

  it('admin does not see unrelated user notifications', async () => {
    const { prisma } = await loadPrisma()
    const { createUserNotification, getMyNotifications } = await loadNotificationModules()

    const admin = await createUniqueTestUser(prisma, 'visibility-admin', cleanup)
    const customer = await createUniqueTestUser(prisma, 'visibility-customer', cleanup)

    const customerNotification = await createUserNotification(prisma, {
      userId: customer.id,
      type: NotificationType.ORDER_CREATED,
      title: 'Pedido ajeno',
      message: 'No visible para admin.',
    })
    cleanup.trackNotification(customerNotification.id)

    const adminContext = buildNotificationContext(
      prisma,
      buildTestUser({ id: admin.id, roles: ['ADMIN'] }),
    )
    const result = await getMyNotifications(adminContext)

    assert.ok(!result.nodes.some((row) => row.id === customerNotification.id))
  })

  it('customer cannot see admin broadcast notifications', async () => {
    const { prisma } = await loadPrisma()
    const { createAdminNotification, getMyNotifications } = await loadNotificationModules()

    const customer = await createUniqueTestUser(prisma, 'broadcast-customer', cleanup)
    const broadcast = await createAdminNotification(prisma, {
      userId: null,
      type: NotificationType.ADMIN_NEW_ORDER,
      title: 'Nuevo pedido global',
      message: 'Solo admins',
      dedupeKey: `test-customer-broadcast:${customer.id}:${Date.now()}`,
    })
    cleanup.trackNotification(broadcast.id)

    const customerContext = buildNotificationContext(
      prisma,
      buildTestUser({ id: customer.id, roles: ['CUSTOMER'] }),
    )
    const result = await getMyNotifications(customerContext)

    assert.ok(!result.nodes.some((row) => row.id === broadcast.id))
    assert.equal(
      result.nodes.filter((row) => row.audience === NotificationAudience.ADMIN).length,
      0,
    )
  })
})
