'use client'

import { cn } from '@/lib/utils'

import { formatNotificationCreatedAt } from '../lib/notification-format'
import type { Notification } from '../types'

type NotificationItemProps = {
  notification: Notification
  onSelect: (notification: Notification) => void
  variant?: 'panel' | 'page'
}

export function NotificationItem({
  notification,
  onSelect,
  variant = 'panel',
}: NotificationItemProps) {
  const isUnread = !notification.readAt
  const isPanel = variant === 'panel'

  return (
    <button
      type="button"
      onClick={() => onSelect(notification)}
      className={cn(
        'w-full rounded-lg border text-left transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#5A6FDD]/60',
        isPanel
          ? cn(
              'border-white/10 bg-white/[0.03] px-3 py-3 hover:bg-white/[0.06]',
              isUnread && 'border-[#5A6FDD]/35 bg-[#5A6FDD]/10',
            )
          : cn(
              'border-border bg-card px-4 py-4 hover:bg-secondary/40',
              isUnread && 'border-primary/25 bg-primary/5',
            ),
      )}
      data-testid="customer-notification-item"
      data-notification-id={notification.id}
      data-unread={isUnread ? 'true' : 'false'}
    >
      <div className="flex items-start gap-3">
        <span
          className={cn(
            'mt-1.5 h-2 w-2 flex-shrink-0 rounded-full',
            isUnread ? 'bg-[#5A6FDD]' : 'bg-transparent',
          )}
          aria-hidden
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <p
              className={cn(
                'font-sans text-sm leading-snug',
                isPanel ? 'text-white' : 'text-foreground',
                isUnread && 'font-semibold',
              )}
            >
              {notification.title}
            </p>
            <time
              dateTime={notification.createdAt}
              className={cn(
                'shrink-0 font-serif text-[11px]',
                isPanel ? 'text-white/50' : 'text-muted-foreground',
              )}
            >
              {formatNotificationCreatedAt(notification.createdAt)}
            </time>
          </div>
          <p
            className={cn(
              'mt-1 font-serif text-sm leading-relaxed',
              isPanel ? 'text-white/70' : 'text-muted-foreground',
            )}
          >
            {notification.message}
          </p>
        </div>
      </div>
    </button>
  )
}
