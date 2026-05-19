'use client'

import { cn } from '@/lib/utils'
import {
  Clock,
  CreditCard,
  Factory,
  Package,
  Truck,
  CheckCircle,
  XCircle,
} from 'lucide-react'
import type { AdminOrderTimelineEvent, AdminOrderStatus } from '@/lib/types'

interface OrderTimelineProps {
  events: AdminOrderTimelineEvent[]
  className?: string
}

const statusIconMap: Record<AdminOrderStatus, React.ComponentType<{ className?: string }>> = {
  'pendiente-pago': Clock,
  'pagado': CreditCard,
  'en-produccion': Factory,
  'listo-envio': Package,
  'enviado': Truck,
  'entregado': CheckCircle,
  'cancelado': XCircle,
}

const statusColorMap: Record<AdminOrderStatus, string> = {
  'pendiente-pago': 'bg-warning text-warning-foreground',
  'pagado': 'bg-success text-white',
  'en-produccion': 'bg-accent text-accent-foreground',
  'listo-envio': 'bg-primary text-primary-foreground',
  'enviado': 'bg-muted text-muted-foreground',
  'entregado': 'bg-success text-white',
  'cancelado': 'bg-destructive text-destructive-foreground',
}

function formatDateTime(dateString: string): { date: string; time: string } {
  const d = new Date(dateString)
  return {
    date: d.toLocaleDateString('es-MX', { day: '2-digit', month: 'short', year: 'numeric' }),
    time: d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' }),
  }
}

export function OrderTimeline({ events, className }: OrderTimelineProps) {
  return (
    <div className={cn('relative', className)}>
      {/* Vertical Line */}
      <div className="absolute left-4 top-0 h-full w-0.5 bg-border" />

      <div className="space-y-6">
        {events.map((event, index) => {
          const Icon = statusIconMap[event.status]
          const colorClass = statusColorMap[event.status]
          const { date, time } = formatDateTime(event.timestamp)
          const isLast = index === events.length - 1

          return (
            <div key={event.id} className="relative flex gap-4 pl-10">
              {/* Icon Circle */}
              <div
                className={cn(
                  'absolute left-0 flex h-8 w-8 items-center justify-center rounded-full',
                  colorClass
                )}
              >
                <Icon className="h-4 w-4" />
              </div>

              {/* Content */}
              <div className={cn('flex-1 pb-6', isLast && 'pb-0')}>
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-sans text-sm font-medium text-foreground">
                      {event.event}
                    </p>
                    {event.user && (
                      <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                        Por: {event.user}
                      </p>
                    )}
                    {event.notes && (
                      <p className="mt-1 font-serif text-sm text-muted-foreground">
                        {event.notes}
                      </p>
                    )}
                  </div>
                  <div className="text-right">
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
