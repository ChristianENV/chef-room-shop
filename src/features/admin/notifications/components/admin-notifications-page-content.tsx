'use client'

import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'

import { useMarkAllNotificationsReadMutation } from '@/src/features/notifications/api/use-mark-all-notifications-read-mutation'
import { useMarkNotificationReadMutation } from '@/src/features/notifications/api/use-mark-notification-read-mutation'
import { useMyNotificationsQuery } from '@/src/features/notifications/api/use-my-notifications-query'
import {
  NOTIFICATIONS_POLL_INTERVAL_MS,
  useMyUnreadNotificationCountQuery,
} from '@/src/features/notifications/api/use-my-unread-notification-count-query'
import type { Notification } from '@/src/features/notifications/types'

import { AdminNotificationItem } from './admin-notification-item'
import {
  AdminNotificationListEmpty,
  AdminNotificationListError,
  AdminNotificationListSkeleton,
} from './admin-notification-list-states'

const ADMIN_AUDIENCE = 'ADMIN' as const

export function AdminNotificationsPageContent() {
  const router = useRouter()

  const unreadQuery = useMyUnreadNotificationCountQuery({
    enabled: true,
    audience: ADMIN_AUDIENCE,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  })

  const notificationsQuery = useMyNotificationsQuery(
    { first: 50, audience: ADMIN_AUDIENCE },
    { enabled: true },
  )

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation(ADMIN_AUDIENCE)

  const notifications = notificationsQuery.data?.nodes ?? []
  const unreadCount = unreadQuery.data ?? 0

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id)
    }

    if (notification.href) {
      router.push(notification.href)
    }
  }

  return (
    <div data-testid="admin-notifications-page">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="font-serif text-sm text-muted-foreground">
          Avisos operativos para el equipo de administración.
        </p>
        <Button
          type="button"
          variant="outline"
          size="sm"
          className="font-sans"
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
          data-testid="admin-notifications-mark-all-read"
        >
          Marcar todas como leídas
        </Button>
      </div>

      {notificationsQuery.isLoading && <AdminNotificationListSkeleton rows={4} />}

      {notificationsQuery.isError && (
        <AdminNotificationListError onRetry={() => void notificationsQuery.refetch()} />
      )}

      {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notifications.length === 0 && <AdminNotificationListEmpty />}

      {!notificationsQuery.isLoading && !notificationsQuery.isError && notifications.length > 0 && (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id}>
              <AdminNotificationItem
                notification={notification}
                onSelect={handleSelect}
                variant="page"
              />
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
