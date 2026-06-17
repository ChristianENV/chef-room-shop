'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Bell } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { routes } from '@/src/config/routes'

import { useMarkAllNotificationsReadMutation } from '../api/use-mark-all-notifications-read-mutation'
import { useMarkNotificationReadMutation } from '../api/use-mark-notification-read-mutation'
import { useMyNotificationsQuery } from '../api/use-my-notifications-query'
import {
  NOTIFICATIONS_POLL_INTERVAL_MS,
  useMyUnreadNotificationCountQuery,
} from '../api/use-my-unread-notification-count-query'
import { NotificationBadge } from './notification-badge'
import { NotificationItem } from './notification-item'
import {
  NotificationListEmpty,
  NotificationListError,
  NotificationListSkeleton,
} from './notification-list-states'
import type { Notification } from '../types'

const PANEL_LIMIT = 8

type NotificationPopoverProps = {
  isLoggedIn: boolean
  triggerClassName?: string
}

export function NotificationPopover({
  isLoggedIn,
  triggerClassName,
}: NotificationPopoverProps) {
  const router = useRouter()
  const [open, setOpen] = useState(false)

  const unreadQuery = useMyUnreadNotificationCountQuery({
    enabled: isLoggedIn,
    refetchInterval: isLoggedIn ? NOTIFICATIONS_POLL_INTERVAL_MS : false,
  })

  const notificationsQuery = useMyNotificationsQuery(
    { first: PANEL_LIMIT },
    {
      enabled: isLoggedIn && open,
      refetchOnMount: true,
    },
  )

  const markReadMutation = useMarkNotificationReadMutation()
  const markAllReadMutation = useMarkAllNotificationsReadMutation()

  if (!isLoggedIn) return null

  const unreadCount = unreadQuery.data ?? 0
  const notifications = notificationsQuery.data?.nodes ?? []
  const showLoading =
    open && (notificationsQuery.isLoading || (notificationsQuery.isFetching && notifications.length === 0))

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
          className={cn('relative h-9 w-9', triggerClassName)}
          aria-label={
            unreadCount > 0
              ? `Notificaciones (${unreadCount} sin leer)`
              : 'Notificaciones'
          }
          data-testid="customer-notifications-bell"
        >
          <Bell className="h-4 w-4" />
          <NotificationBadge count={unreadCount} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        sideOffset={8}
        className="w-[min(24rem,calc(100vw-2rem))] border border-white/10 bg-[#181B36] p-0 text-white shadow-xl shadow-black/30"
        data-testid="customer-notifications-panel"
      >
        <div className="border-b border-white/10 px-4 py-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="font-sans text-base font-semibold text-white">
                Notificaciones
              </h2>
              <p className="mt-0.5 font-serif text-xs text-white/55">
                Actualizaciones de tu cuenta
              </p>
            </div>
            {unreadCount > 0 && (
              <span className="rounded-full bg-[#5A6FDD]/20 px-2 py-0.5 font-sans text-[11px] font-medium text-[#9DAAFF]">
                {unreadCount} sin leer
              </span>
            )}
          </div>
        </div>

        <div className="max-h-[min(360px,55vh)] overflow-y-auto px-3 py-3">
          {showLoading && <NotificationListSkeleton />}
          {notificationsQuery.isError && !showLoading && (
            <NotificationListError onRetry={() => void notificationsQuery.refetch()} />
          )}
          {!showLoading && !notificationsQuery.isError && notifications.length === 0 && (
            <NotificationListEmpty />
          )}
          {!showLoading && !notificationsQuery.isError && notifications.length > 0 && (
            <ul className="space-y-2">
              {notifications.map((notification) => (
                <li key={notification.id}>
                  <NotificationItem
                    notification={notification}
                    onSelect={handleSelect}
                    variant="panel"
                  />
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between gap-2 border-t border-white/10 px-4 py-3">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-sans text-xs text-white/75 hover:bg-white/10 hover:text-white"
            onClick={handleMarkAllRead}
            disabled={unreadCount === 0 || markAllReadMutation.isPending}
            data-testid="customer-notifications-mark-all-read"
          >
            Marcar todas como leídas
          </Button>
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 font-sans text-xs text-[#9DAAFF] hover:bg-white/10 hover:text-white"
            asChild
          >
            <Link
              href={routes.accountNotifications}
              onClick={() => setOpen(false)}
              data-testid="customer-notifications-view-all"
            >
              Ver todas
            </Link>
          </Button>
        </div>
      </PopoverContent>
    </Popover>
  )
}
