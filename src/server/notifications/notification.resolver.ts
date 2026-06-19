import type { NotificationAudience } from '@prisma/client'

import type { GraphQLContext } from '@/src/server/graphql/context'

import {
  getMyNotifications,
  getMyUnreadNotificationCount,
  markAllNotificationsRead,
  markNotificationRead,
} from './notification.service'
import type { MyNotificationsFilters } from './notification.types'

type MyNotificationsArgs = {
  input?: Partial<MyNotificationsFilters> | null
}

type MarkNotificationReadArgs = {
  id: string
}

type MyUnreadCountArgs = {
  audience?: NotificationAudience | null
}

type MarkAllNotificationsReadArgs = {
  audience?: NotificationAudience | null
}

export const notificationsResolvers = {
  Query: {
    myNotifications: (_parent: unknown, args: MyNotificationsArgs, context: GraphQLContext) =>
      getMyNotifications(context, args.input),

    myUnreadNotificationCount: (
      _parent: unknown,
      args: MyUnreadCountArgs,
      context: GraphQLContext,
    ) => getMyUnreadNotificationCount(context, args.audience),
  },

  Mutation: {
    markNotificationRead: (
      _parent: unknown,
      args: MarkNotificationReadArgs,
      context: GraphQLContext,
    ) => markNotificationRead(context, args.id),

    markAllNotificationsRead: (
      _parent: unknown,
      args: MarkAllNotificationsReadArgs,
      context: GraphQLContext,
    ) => markAllNotificationsRead(context, args.audience),
  },
}
