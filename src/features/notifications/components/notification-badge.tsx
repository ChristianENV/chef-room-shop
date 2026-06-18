import { cn } from '@/lib/utils'

type NotificationBadgeProps = {
  count: number
  className?: string
  testId?: string
}

export function NotificationBadge({
  count,
  className,
  testId = 'customer-notifications-badge',
}: NotificationBadgeProps) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5A6FDD] px-0.5 text-[10px] font-bold text-white',
        className,
      )}
      data-testid={testId}
      aria-hidden
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}
