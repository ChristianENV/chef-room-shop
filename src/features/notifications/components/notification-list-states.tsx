import { Bell, RefreshCw } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { Skeleton } from '@/components/ui/skeleton'

export function NotificationListSkeleton({ rows = 3 }: { rows?: number }) {
  return (
    <ul className="space-y-2" aria-hidden>
      {Array.from({ length: rows }).map((_, index) => (
        <li key={index} className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <Skeleton className="h-4 w-3/4 bg-white/10" />
          <Skeleton className="mt-2 h-3 w-full bg-white/10" />
          <Skeleton className="mt-2 h-3 w-1/3 bg-white/10" />
        </li>
      ))}
    </ul>
  )
}

export function NotificationListEmpty() {
  return (
    <div className="px-2 py-8 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white/[0.06]">
        <Bell className="h-5 w-5 text-white/50" aria-hidden />
      </div>
      <h3 className="mt-4 font-sans text-sm font-semibold text-white">
        Sin notificaciones
      </h3>
      <p className="mt-2 font-serif text-sm text-white/60">
        Te avisaremos aquí cuando haya novedades sobre tus pedidos y diseños.
      </p>
    </div>
  )
}

export function NotificationListError({
  onRetry,
  variant = 'panel',
}: {
  onRetry: () => void
  variant?: 'panel' | 'page'
}) {
  const isPanel = variant === 'panel'

  return (
    <div className={cn('px-2 py-8 text-center', !isPanel && 'rounded-xl border border-border bg-card')}>
      <p
        className={cn(
          'font-serif text-sm',
          isPanel ? 'text-white/70' : 'text-muted-foreground',
        )}
      >
        No pudimos cargar tus notificaciones.
      </p>
      <Button
        variant="outline"
        size="sm"
        className={cn(
          'mt-4',
          isPanel &&
            'border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white',
        )}
        onClick={onRetry}
      >
        <RefreshCw className="mr-2 h-4 w-4" />
        Reintentar
      </Button>
    </div>
  )
}

export function NotificationPageListSkeleton() {
  return (
    <ul className="space-y-3" aria-hidden>
      {Array.from({ length: 4 }).map((_, index) => (
        <li key={index} className="rounded-xl border border-border bg-card p-4">
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="mt-3 h-4 w-full" />
          <Skeleton className="mt-2 h-3 w-2/3" />
        </li>
      ))}
    </ul>
  )
}

export function NotificationPageListEmpty() {
  return (
    <div className="rounded-xl border border-border bg-card px-6 py-12 text-center">
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-secondary">
        <Bell className="h-5 w-5 text-muted-foreground" aria-hidden />
      </div>
      <h3 className="mt-4 font-sans text-base font-semibold text-foreground">
        Sin notificaciones
      </h3>
      <p className="mt-2 font-serif text-sm text-muted-foreground">
        Cuando tengas actualizaciones de pedidos o diseños, aparecerán aquí.
      </p>
    </div>
  )
}
