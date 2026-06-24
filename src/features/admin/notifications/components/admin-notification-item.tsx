'use client'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'

import { formatNotificationCreatedAt } from '@/src/features/notifications/lib/notification-format'
import type { Notification } from '@/src/features/notifications/types'

import { getAdminNotificationTypeLabel } from '../lib/admin-notification-type-label'

type AdminNotificationItemProps = {
  notification: Notification
  onSelect: (notification: Notification) => void
  variant?: 'panel' | 'page'
}

export function AdminNotificationItem({
  notification,
  onSelect,
  variant = 'panel',
}: AdminNotificationItemProps) {
  const isUnread = !notification.readAt
  const isPanel = variant === 'panel'

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        'w-full rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50',
        isPanel
          ? cn(
              'border-border bg-card px-3 py-3 hover:bg-secondary/50',
              isUnread && 'border-primary/25 bg-primary/5',
            )
          : cn(
              'border-border bg-card px-4 py-4 hover:bg-secondary/40',
              isUnread && 'border-primary/25 bg-primary/5',
            ),
      )}
      data-testid="admin-notification-item"
      data-notification-id={notification.id}
      data-unread={isUnread ? 'true' : 'false'}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-2 h-2 w-2 flex-shrink-0 rounded-full',
            isUnread ? 'bg-primary' : 'bg-transparent',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="mb-2 flex flex-wrap items-center gap-2">
            <Badge
              variant="secondary"
              className="font-sans text-[10px] font-medium uppercase tracking-wide"
            >
              {getAdminNotificationTypeLabel(notification.type)}
            </Badge>
            <time
              dateTime={notification.createdAt}
              className="font-serif text-[11px] text-muted-foreground"
            >
              {formatNotificationCreatedAt(notification.createdAt)}
            </time>
          </div>
          <p
            className={cn(
              'font-sans text-sm leading-snug text-foreground',
              isUnread && 'font-semibold',
            )}
          >
            {notification.title}
          </p>
          <p className="mt-1 font-serif text-sm leading-relaxed text-muted-foreground">
            {notification.message}
          </p>
        </div>
      </div>
    </button>
  )
}
