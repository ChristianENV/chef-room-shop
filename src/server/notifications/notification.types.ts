import type {
  NotificationAudience,
  NotificationType,
  Prisma,
} from '@prisma/client'

export type NotificationRecord = Prisma.NotificationGetPayload<object>

export type NotificationGql = {
  id: string
  audience: NotificationAudience
  type: NotificationType
  title: string
  message: string
  href: string | null
  metadataJson: unknown | null
  readAt: string | null
  expiresAt: string | null
  createdAt: string
}

export type NotificationConnectionGql = {
  nodes: NotificationGql[]
  totalCount: number
}

export type MarkAllNotificationsReadPayloadGql = {
  updatedCount: number
}

export type CreateNotificationInput = {
  userId?: string | null
  audience: NotificationAudience
  type: NotificationType
  title: string
  message: string
  href?: string | null
  metadataJson?: Record<string, unknown> | null
  expiresAt?: Date | null
  dedupeKey?: string | null
}

export type CreateUserNotificationInput = Omit<
  CreateNotificationInput,
  'audience'
> & {
  userId: string
}

export type CreateAdminNotificationInput = Omit<
  CreateNotificationInput,
  'audience'
>

export type MyNotificationsFilters = {
  first: number
  unreadOnly: boolean
  audience?: NotificationAudience
}
