'use client'

import { useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

import { useMarkAllNotificationsReadMutation } from '../api/use-mark-all-notifications-read-mutation'
import { useMarkNotificationReadMutation } from '../api/use-mark-notification-read-mutation'
import { useMyNotificationsQuery } from '../api/use-my-notifications-query'
import {
  NOTIFICATIONS_POLL_INTERVAL_MS,
  useMyUnreadNotificationCountQuery,
} from '../api/use-my-unread-notification-count-query'
import { NotificationItem } from './notification-item'
import {
  NotificationPageListEmpty,
  NotificationPageListSkeleton,
} from './notification-list-states'
import { NotificationListError } from './notification-list-states'
import type { Notification } from '../types'

type FilterMode = 'all' | 'unread'

export function NotificationsPageContent() {
  const router = useRouter()
  const [filter, setFilter] = useState<FilterMode>('all')

  const unreadQuery = useMyUnreadNotificationCountQuery({
    enabled: true,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  })

  const notificationsQuery = useMyNotificationsQuery(
    { first: 50, unreadOnly: filter === 'unread' },
    { enabled: true },
  )

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  const notifications = notificationsQuery.data?.nodes ?? []
  const unreadCount = unreadQuery.data ?? 0

  const filterButtons = useMemo(
    () => [
      { id: 'all' as const, label: 'Todas' },
      { id: 'unread' as const, label: 'Sin leer' },
    ],
    [],
  )

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id)
    }

    if (notification.href) {
      router.push(notification.href)
    }
  }

  return (
    <div data-testid="account-notifications-page">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2">
          {filterButtons.map((option) => (
            <Button
              key={option.id}
              type="button"
              size="sm"
              variant={filter === option.id ? 'default' : 'outline'}
              className={cn('font-sans')}
              onClick={() => setFilter(option.id)}
            >
              {option.label}
            </Button>
          ))}
        </div>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="font-sans"
          disabled={unreadCount === 0 || markAllReadMutation.isPending}
          onClick={() => markAllReadMutation.mutate()}
          data-testid="customer-notifications-mark-all-read"
        >
          Marcar todas como leídas
        </Button>
      </div>

      {notificationsQuery.isLoading && <NotificationPageListSkeleton />}

      {notificationsQuery.isError && (
        <NotificationListError
          variant="page"
          onRetry={() => void notificationsQuery.refetch()}
        />
      )}

      {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notifications.length === 0 && <NotificationPageListEmpty />}

      {!notificationsQuery.isLoading &&
        !notificationsQuery.isError &&
        notifications.length > 0 && (
          <ul className="space-y-3">
            {notifications.map((notification) => (
              <li key={notification.id}>
                <NotificationItem
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
