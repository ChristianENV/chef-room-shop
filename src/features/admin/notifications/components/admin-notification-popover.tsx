'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { routes } from '@/src/config/routes'
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
  AdminNotificationBadge,
  AdminNotificationListEmpty,
  AdminNotificationListError,
  AdminNotificationListSkeleton,
} from './admin-notification-list-states'

const ADMIN_AUDIENCE = 'ADMIN' as const
const PANEL_LIMIT = 8

export function AdminNotificationPopover() {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const unreadQuery = useMyUnreadNotificationCountQuery({
    enabled: true,
    audience: ADMIN_AUDIENCE,
    refetchInterval: NOTIFICATIONS_POLL_INTERVAL_MS,
  })

  const notificationsQuery = useMyNotificationsQuery(
    { first: PANEL_LIMIT, audience: ADMIN_AUDIENCE },
    {
      enabled: open,
      refetchOnMount: true,
    },
  )

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation(ADMIN_AUDIENCE)

  const unreadCount = unreadQuery.data ?? 0
  const notifications = notificationsQuery.data?.nodes ?? []
  const showLoading =
    open &&
    (notificationsQuery.isLoading || (notificationsQuery.isFetching && notifications.length === 0))

  const handleSelect = (notification: Notification) => {
    if (!notification.readAt) {
      markReadMutation.mutate(notification.id)
    }

    if (notification.href) {
      setOpen(false)
      router.push(notification.href)
    }
  }

  const handleMarkAllRead = () => {
    if (unreadCount === 0) return
    markAllReadMutation.mutate()
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="relative"
          aria-label={
            unreadCount > 0
              ? `Notificaciones de admin (${unreadCount} sin leer)`
              : 'Notificaciones de admin'
          }
          data-testid="admin-notifications-bell"
        >
          <Bell className="h-5 w-5" />
          <AdminNotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] p-0"
        data-testid="admin-notifications-panel"
      >
        <div className="border-b border-border px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold text-foreground">Notificaciones</h2>
              <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                Avisos operativos del panel
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-primary/10 px-2 py-0.5 font-sans text-[11px] font-medium text-primary">
                {unreadCount} sin leer
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[min(360px,55vh)] overflow-y-auto px-3 py-3">
          {showLoading && <AdminNotificationListSkeleton />}
          {notificationsQuery.isError && !showLoading && (
            <AdminNotificationListError onRetry={() => void notificationsQuery.refetch()} />
          )}
          {!showLoading && !notificationsQuery.isError && notifications.length === 0 && (
            <AdminNotificationListEmpty />
          )}
          {!showLoading && !notificationsQuery.isError && notifications.length > 0 && (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <AdminNotificationItem
                    notification={notification}
                    onSelect={handleSelect}
                    variant="panel"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-border px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-sans text-xs"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            data-testid="admin-notifications-mark-all-read"
          >
            Marcar todas como leídas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-sans text-xs text-primary"
            asChild
          >
            <Link
              href={routes.adminNotifications}
              onClick={() => setOpen(false)}
              data-testid="admin-notifications-view-all"
            >
              Ver todas
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
