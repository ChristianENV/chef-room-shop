'use client'

import { Card, CardContent } from '@/components/ui/card'
import {
  Clock,
  CreditCard,
  Factory,
  Package,
  Truck,
  CheckCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminOrderStatus } from '@/lib/types'

interface StatusCardData {
  status: AdminOrderStatus
  label: string
  count: number
  icon: React.ComponentType<{ className?: string }>
  color: string
  bgColor: string
}

interface OrdersStatusCardsProps {
  counts: Record<AdminOrderStatus, number>
  selectedStatus: AdminOrderStatus | null
  onStatusSelect: (status: AdminOrderStatus | null) => void
}

const statusCards: Omit<StatusCardData, 'count'>[] = [
  { status: 'pendiente-pago', label: 'Pendientes de pago', icon: Clock, color: 'text-warning', bgColor: 'bg-warning/10' },
  { status: 'pagado', label: 'Pagadas', icon: CreditCard, color: 'text-success', bgColor: 'bg-success/10' },
  { status: 'en-produccion', label: 'En produccion', icon: Factory, color: 'text-accent', bgColor: 'bg-accent/10' },
  { status: 'listo-envio', label: 'Listas para envio', icon: Package, color: 'text-primary', bgColor: 'bg-primary/10' },
  { status: 'enviado', label: 'Enviadas', icon: Truck, color: 'text-muted-foreground', bgColor: 'bg-muted' },
  { status: 'entregado', label: 'Entregadas', icon: CheckCircle, color: 'text-success', bgColor: 'bg-success/10' },
]

export function OrdersStatusCards({
  counts,
  selectedStatus,
  onStatusSelect,
}: OrdersStatusCardsProps) {
  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {statusCards.map((card) => {
        const Icon = card.icon
        const isSelected = selectedStatus === card.status
        const count = counts[card.status] || 0

        return (
          <Card
            key={card.status}
            className={cn(
              'cursor-pointer transition-all hover:shadow-md',
              isSelected && 'ring-2 ring-primary'
            )}
            onClick={() => onStatusSelect(isSelected ? null : card.status)}
          >
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className={cn('rounded-lg p-2', card.bgColor)}>
                  <Icon className={cn('h-5 w-5', card.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="font-sans text-2xl font-bold text-foreground">
                    {count}
                  </p>
                  <p className="truncate font-serif text-xs text-muted-foreground">
                    {card.label}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
