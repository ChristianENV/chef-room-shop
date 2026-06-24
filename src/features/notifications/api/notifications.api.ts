import { fetchGraphQL } from '@/src/lib/graphql/fetch-graphql'

import {
  MARK_ALL_NOTIFICATIONS_READ_MUTATION,
  MARK_NOTIFICATION_READ_MUTATION,
} from '../graphql/notifications.mutations'
import {
  MY_NOTIFICATIONS_QUERY,
  MY_UNREAD_NOTIFICATION_COUNT_QUERY,
} from '../graphql/notifications.queries'
import type {
  MarkAllNotificationsReadPayload,
  MyNotificationsInput,
  Notification,
  NotificationAudience,
  NotificationConnection,
} from '../types'

type MyNotificationsData = { myNotifications: NotificationConnection }
type MyUnreadNotificationCountData = { myUnreadNotificationCount: number }
type MarkNotificationReadData = { markNotificationRead: Notification }
type MarkAllNotificationsReadData = {
  markAllNotificationsRead: MarkAllNotificationsReadPayload
}

export async function getMyNotifications(
  input?: MyNotificationsInput,
): Promise<NotificationConnection> {
  const data = await fetchGraphQL<MyNotificationsData, MyNotificationsInput | undefined>({
    query: MY_NOTIFICATIONS_QUERY,
    variables: input,
  })

  return data.myNotifications
}

export async function getMyUnreadNotificationCount(
  audience?: NotificationAudience,
): Promise<number> {
  const data = await fetchGraphQL<
    MyUnreadNotificationCountData,
    { audience?: NotificationAudience }
  >({
    query: MY_UNREAD_NOTIFICATION_COUNT_QUERY,
    variables: { audience },
  })

  return data.myUnreadNotificationCount
}

export async function markNotificationRead(id: string): Promise<Notification> {
  const data = await fetchGraphQL<MarkNotificationReadData, { id: string }>({
    query: MARK_NOTIFICATION_READ_MUTATION,
    variables: { id },
  })

  return data.markNotificationRead
}

export async function markAllNotificationsRead(
  audience?: NotificationAudience,
): Promise<MarkAllNotificationsReadPayload> {
  const data = await fetchGraphQL<
    MarkAllNotificationsReadData,
    { audience?: NotificationAudience }
  >({
    query: MARK_ALL_NOTIFICATIONS_READ_MUTATION,
    variables: { audience },
  })

  return data.markAllNotificationsRead
}
