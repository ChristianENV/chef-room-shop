import { GraphQLError } from 'graphql'

import { NotificationAudience } from '@prisma/client'
import type { Prisma, PrismaClient } from '@prisma/client'

import { canAccessAdmin } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'
import { requireAuthenticatedAccount } from '@/src/server/graphql/modules/account/account.auth'
import type { GraphQLContext } from '@/src/server/graphql/context'

import {
  buildReadableNotificationsWhere,
  mapNotificationToGql,
} from './notification.mappers'
import type {
  CreateAdminNotificationInput,
  CreateNotificationInput,
  CreateUserNotificationInput,
  MarkAllNotificationsReadPayloadGql,
  MyNotificationsFilters,
  NotificationConnectionGql,
  NotificationGql,
  NotificationRecord,
} from './notification.types'
import {
  createAdminNotificationInputSchema,
  createNotificationInputSchema,
  createUserNotificationInputSchema,
  myNotificationsInputSchema,
  notificationIdSchema,
} from './notification.validation'

function requireAuthenticatedUser(context: GraphQLContext): CurrentUser {
  requireAuthenticatedAccount(context)

  if (!context.currentUser) {
    throw new GraphQLError('Debes iniciar sesión para continuar.', {
      extensions: { code: 'UNAUTHENTICATED' },
    })
  }

  return context.currentUser
}

function notFoundError(): GraphQLError {
  return new GraphQLError('Notificación no encontrada.', {
    extensions: { code: 'NOT_FOUND' },
  })
}

function parseCreateInput<T>(
  schema: { parse: (input: unknown) => T },
  input: unknown,
): T {
  try {
    return schema.parse(input)
  } catch {
    throw new GraphQLError('Datos de notificación inválidos.', {
      extensions: { code: 'BAD_USER_INPUT' },
    })
  }
}

function toMetadataJson(
  value: Record<string, unknown> | null | undefined,
): Prisma.InputJsonValue | undefined {
  if (value === null || value === undefined) return undefined
  return value as Prisma.InputJsonValue
}

export async function createNotification(
  prisma: PrismaClient,
  input: CreateNotificationInput,
): Promise<NotificationRecord> {
  const data = parseCreateInput(createNotificationInputSchema, input)

  return prisma.notification.create({
    data: {
      userId: data.userId ?? null,
      audience: data.audience,
      type: data.type,
      title: data.title,
      message: data.message,
      href: data.href ?? null,
      metadataJson: toMetadataJson(data.metadataJson),
      expiresAt: data.expiresAt ?? null,
    },
  })
}

export async function createUserNotification(
  prisma: PrismaClient,
  input: CreateUserNotificationInput,
): Promise<NotificationRecord> {
  const data = parseCreateInput(createUserNotificationInputSchema, input)

  return createNotification(prisma, {
    ...data,
    audience: NotificationAudience.USER,
  })
}

export async function createAdminNotification(
  prisma: PrismaClient,
  input: CreateAdminNotificationInput,
): Promise<NotificationRecord> {
  const data = parseCreateInput(createAdminNotificationInputSchema, input)

  return createNotification(prisma, {
    ...data,
    audience: NotificationAudience.ADMIN,
  })
}

export async function getMyNotifications(
  context: GraphQLContext,
  input?: Partial<MyNotificationsFilters> | null,
): Promise<NotificationConnectionGql> {
  const user = requireAuthenticatedUser(context)
  const filters = myNotificationsInputSchema.parse(input ?? {})

  const baseWhere = buildReadableNotificationsWhere(user)
  const where = filters.unreadOnly
    ? { AND: [baseWhere, { readAt: null }] }
    : baseWhere

  const [rows, totalCount] = await Promise.all([
    context.prisma.notification.findMany({
      where,
      orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
      take: filters.first,
    }),
    context.prisma.notification.count({ where }),
  ])

  return {
    nodes: rows.map(mapNotificationToGql),
    totalCount,
  }
}

export async function getMyUnreadNotificationCount(
  context: GraphQLContext,
): Promise<number> {
  const user = requireAuthenticatedUser(context)
  const where = buildReadableNotificationsWhere(user)

  return context.prisma.notification.count({
    where: {
      AND: [where, { readAt: null }],
    },
  })
}

async function findReadableNotification(
  context: GraphQLContext,
  notificationId: string,
): Promise<NotificationRecord | null> {
  const user = requireAuthenticatedUser(context)
  const parsedId = notificationIdSchema.safeParse(notificationId)

  if (!parsedId.success) return null

  return context.prisma.notification.findFirst({
    where: {
      AND: [buildReadableNotificationsWhere(user), { id: parsedId.data }],
    },
  })
}

export async function markNotificationRead(
  context: GraphQLContext,
  notificationId: string,
): Promise<NotificationGql> {
  const notification = await findReadableNotification(context, notificationId)

  if (!notification) {
    throw notFoundError()
  }

  if (notification.readAt) {
    return mapNotificationToGql(notification)
  }

  const updated = await context.prisma.notification.update({
    where: { id: notification.id },
    data: { readAt: new Date() },
  })

  return mapNotificationToGql(updated)
}

export async function markAllNotificationsRead(
  context: GraphQLContext,
): Promise<MarkAllNotificationsReadPayloadGql> {
  const user = requireAuthenticatedUser(context)
  const where = buildReadableNotificationsWhere(user)

  const result = await context.prisma.notification.updateMany({
    where: {
      AND: [where, { readAt: null }],
    },
    data: { readAt: new Date() },
  })

  return { updatedCount: result.count }
}

/**
 * Ensures a customer cannot access admin-audience notifications via direct id lookup.
 * Exported for tests.
 */
export function canUserReadNotification(
  user: CurrentUser,
  notification: Pick<NotificationRecord, 'userId' | 'audience'>,
): boolean {
  if (notification.audience === 'USER') {
    return notification.userId === user.id
  }

  if (!canAccessAdmin(user)) return false

  return notification.userId === null || notification.userId === user.id
}
