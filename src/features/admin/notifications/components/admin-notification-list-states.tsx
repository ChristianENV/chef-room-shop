import { Bell, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

export function AdminNotificationBadge({
  count,
  className,
}: {
  count: number
  className?: string
}) {
  if (count <= 0) return null

  return (
    <span
      className={cn(
        'absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-0.5 text-[10px] font-semibold text-destructive-foreground',
        className,
      )}
      data-testid="admin-notifications-badge"
      aria-hidden
    >
      {count > 99 ? '99+' : count}
    </span>
  )
}

export function AdminNotificationListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="rounded-lg border border-border bg-card p-3">
          <Skeleton className="h-4 w-1/4" />
          <Skeleton className="mt-2 h-4 w-3/4" />
          <Skeleton className="mt-2 h-3 w-full" />
        </li>
      ))}
    </ul>
  )
}

export function AdminNotificationListEmpty() {
  return (
    <div className="px-2 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 font-sans text-sm font-semibold text-foreground">
        Sin notificaciones de admin
      </h3>
      <p className="mt-2 font-serif text-sm text-muted-foreground">
        Los avisos operativos del panel aparecerán aquí.
      </p>
    </div>
  )
}

export function AdminNotificationListError({ onRetry }: { onRetry: () => void }) {
  return (
    <div className="px-2 py-8 text-center">
      <p className="font-serif text-sm text-muted-foreground">
        No pudimos cargar las notificaciones de admin.
      </p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        <RefreshCw className="mr-2 h-4 w-4" />
        Reintentar
      </Button>
    </div>
  )
}
