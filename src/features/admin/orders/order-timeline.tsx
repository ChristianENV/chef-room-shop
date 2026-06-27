'use client'

import { cn } from '@/lib/utils'
import { Clock, CreditCard, Factory, Package, Truck, CheckCircle, XCircle } from 'lucide-react'

import type {
  AdminOrderStatusFilter,
  AdminOrdersUiTimelineEvent,
} from './types/admin-orders-ui.types'

interface OrderTimelineProps {
  events: AdminOrdersUiTimelineEvent[]
  className?: string
}

const statusIconMap: Record<AdminOrderStatusFilter, React.ComponentType<{ className?: string }>> = {
  'pendiente-pago': Clock,
  pagado: CreditCard,
  'en-produccion': Factory,
  'listo-envio': Package,
  enviado: Truck,
  entregado: CheckCircle,
  cancelado: XCircle,
}

const statusColorMap: Record<AdminOrderStatusFilter, string> = {
  'pendiente-pago': 'bg-warning text-warning-foreground',
  pagado: 'bg-success text-success-foreground',
  'en-produccion': 'bg-accent text-accent-foreground',
  'listo-envio': 'bg-primary text-primary-foreground',
  enviado: 'bg-muted text-muted-foreground',
  entregado: 'bg-success text-success-foreground',
  cancelado: 'bg-destructive text-destructive-foreground',
}

function formatDateTime(dateString: string): { date: string; time: string } {
  const d = new Date(dateString)
  return {
    date: d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function OrderTimeline({ events, className }: OrderTimelineProps) {
  if (events.length === 0) {
    return (
      <p className="font-serif text-sm text-muted-foreground">
        Aún no hay eventos registrados para esta orden.
      </p>
    )
  }

  return (
    <div className={cn('relative', className)}>
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />
      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = statusIconMap[event.status] ?? Clock
          const colorClass = statusColorMap[event.status] ?? 'bg-muted text-muted-foreground'
          const { date, time } = formatDateTime(event.timestamp)
          const isLast = index === events.length - 1

          return (
            <div key={event.id} className="relative flex gap-4 pl-10">
              <div
                className={cn(
                  'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full',
                  colorClass,
                )}
              >
                <Icon className="h-4 w-4" />
              </div>
              <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">{event.event}</p>
                    {event.user ? (
                      <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                        Por: {event.user}
                      </p>
                    ) : null}
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="font-sans text-xs font-medium text-foreground">{date}</p>
                    <p className="font-mono text-xs text-muted-foreground">{time}</p>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
