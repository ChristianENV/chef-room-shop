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

export const notificationsResolvers = {
  Query: {
    myNotifications: (
      _parent: unknown,
      args: MyNotificationsArgs,
      context: GraphQLContext,
    ) => getMyNotifications(context, args.input),

    myUnreadNotificationCount: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => getMyUnreadNotificationCount(context),
  },

  Mutation: {
    markNotificationRead: (
      _parent: unknown,
      args: MarkNotificationReadArgs,
      context: GraphQLContext,
    ) => markNotificationRead(context, args.id),

    markAllNotificationsRead: (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext,
    ) => markAllNotificationsRead(context),
  },
}
