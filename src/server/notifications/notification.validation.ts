import { NotificationAudience, NotificationType } from '@prisma/client'
import { z } from 'zod'

const metadataJsonSchema = z.record(z.string(), z.unknown()).nullable().optional()

export const createNotificationInputSchema = z.object({
  userId: z.string().uuid().nullable().optional(),
  audience: z.nativeEnum(NotificationAudience),
  type: z.nativeEnum(NotificationType),
  title: z.string().trim().min(1).max(200),
  message: z.string().trim().min(1).max(2000),
  href: z.string().trim().max(500).nullable().optional(),
  metadataJson: metadataJsonSchema,
  expiresAt: z.coerce.date().nullable().optional(),
})

export const createUserNotificationInputSchema = createNotificationInputSchema
  .omit({ audience: true })
  .extend({
    userId: z.string().uuid(),
  })

export const createAdminNotificationInputSchema =
  createNotificationInputSchema.omit({ audience: true })

export const myNotificationsInputSchema = z.object({
  first: z.number().int().min(1).max(100).default(20),
  unreadOnly: z.boolean().default(false),
})

export const notificationIdSchema = z.string().uuid()
