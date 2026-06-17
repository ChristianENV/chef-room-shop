import type { Prisma } from '@prisma/client'

import { canAccessAdmin } from '@/src/server/auth/permissions'
import type { CurrentUser } from '@/src/server/auth/types'

import type { NotificationGql, NotificationRecord } from './notification.types'

const SENSITIVE_METADATA_KEY_PATTERN =
  /^(password|secret|token|api[_-]?key|authorization|cookie|session|private[_-]?key)$/i

function toIso(date: Date | null | undefined): string | null {
  if (!date) return null
  return date.toISOString()
}

/**
 * Strips metadata keys that must not be exposed to clients.
 */
export function sanitizeNotificationMetadata(
  value: Prisma.JsonValue | null | undefined,
): unknown | null {
  if (value === null || value === undefined) return null
  if (typeof value !== 'object' || Array.isArray(value)) return value

  const sanitized: Record<string, unknown> = {}

  for (const [key, entry] of Object.entries(value)) {
    if (SENSITIVE_METADATA_KEY_PATTERN.test(key)) continue
    sanitized[key] = entry
  }

  return Object.keys(sanitized).length > 0 ? sanitized : null
}

export function mapNotificationToGql(
  notification: NotificationRecord,
): NotificationGql {
  return {
    id: notification.id,
    audience: notification.audience,
    type: notification.type,
    title: notification.title,
    message: notification.message,
    href: notification.href,
    metadataJson: sanitizeNotificationMetadata(notification.metadataJson),
    readAt: toIso(notification.readAt),
    expiresAt: toIso(notification.expiresAt),
    createdAt: toIso(notification.createdAt)!,
  }
}

export function buildNotExpiredWhere(now = new Date()): Prisma.NotificationWhereInput {
  return {
    OR: [{ expiresAt: null }, { expiresAt: { gt: now } }],
  }
}

/**
 * Visibility rules for in-app notifications.
 * Customers only see USER audience rows for their userId.
 * Admins also see ADMIN audience rows targeted to them or broadcast (userId null).
 */
export function buildReadableNotificationsWhere(
  user: CurrentUser,
  now = new Date(),
): Prisma.NotificationWhereInput {
  const notExpired = buildNotExpiredWhere(now)

  if (!canAccessAdmin(user)) {
    return {
      AND: [notExpired, { userId: user.id, audience: 'USER' }],
    }
  }

  return {
    AND: [
      notExpired,
      {
        OR: [
          { userId: user.id, audience: 'USER' },
          {
            audience: 'ADMIN',
            OR: [{ userId: user.id }, { userId: null }],
          },
        ],
      },
    ],
  }
}
