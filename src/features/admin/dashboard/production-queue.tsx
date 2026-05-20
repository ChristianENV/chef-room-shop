'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Clock, Package, Palette, Shirt } from 'lucide-react'
import { routes } from '@/src/config/routes'

// TODO: Replace with TanStack Query for real-time production queue
export interface ProductionItem {
  id: string
  orderNumber: string
  productName: string
  productType: 'filipina' | 'mandil' | 'pantalon'
  quantity: number
  customizationType: 'nombre' | 'logo' | 'iniciales' | 'ninguno'
  customizationText?: string
  estimatedDelivery: string
  status: 'nuevo' | 'en-produccion' | 'listo'
  priority: 'normal' | 'urgente'
}

const productTypeIcons: Record<ProductionItem['productType'], React.ComponentType<{ className?: string }>> = {
  filipina: Shirt,
  mandil: Package,
  pantalon: Package,
}

const statusConfig: Record<ProductionItem['status'], { label: string; className: string }> = {
  nuevo: { label: 'Nuevo', className: 'bg-primary/10 text-primary' },
  'en-produccion': { label: 'En Produccion', className: 'bg-warning/10 text-warning' },
  listo: { label: 'Listo', className: 'bg-success/10 text-success' },
}

interface ProductionQueueProps {
  items: ProductionItem[]
  className?: string
}

export function ProductionQueue({ items, className }: ProductionQueueProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-MX', {
      day: 'numeric',
      month: 'short',
    })
  }

  return (
    <Card className={cn('border-border bg-card', className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="font-sans text-base font-semibold">
          Cola de Produccion
        </CardTitle>
        <Badge variant="secondary" className="font-sans">
          {items.length} items
        </Badge>
      </CardHeader>
      <CardContent className="space-y-3">
        {items.length === 0 ? (
          <p className="py-8 text-center font-serif text-sm text-muted-foreground">
            No hay órdenes en producción por ahora.
          </p>
        ) : null}
        {items.map((item) => {
          const Icon = productTypeIcons[item.productType]
          const status = statusConfig[item.status]

          return (
            <div
              key={item.id}
              className={cn(
                'flex items-start gap-3 rounded-lg border border-border bg-secondary/30 p-3',
                item.priority === 'urgente' && 'border-warning/50'
              )}
            >
              <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="h-5 w-5 text-primary" />
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm font-medium text-foreground truncate">
                    {item.productName}
                  </span>
                  {item.priority === 'urgente' && (
                    <Badge variant="destructive" className="font-sans text-xs">
                      Urgente
                    </Badge>
                  )}
                </div>
                
                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                  <span className="font-serif text-xs text-muted-foreground">
                    {item.orderNumber}
                  </span>
                  <span className="font-serif text-xs text-muted-foreground">
                    x{item.quantity}
                  </span>
                  {item.customizationType !== 'ninguno' && (
                    <span className="flex items-center gap-1 font-serif text-xs text-primary">
                      <Palette className="h-3 w-3" />
                      {item.customizationType}
                      {item.customizationText && `: ${item.customizationText}`}
                    </span>
                  )}
                </div>
                
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-1 text-muted-foreground">
                    <Clock className="h-3 w-3" />
                    <span className="font-serif text-xs">
                      Entrega: {formatDate(item.estimatedDelivery)}
                    </span>
                  </div>
                  <span className={cn('rounded-full px-2 py-0.5 font-sans text-xs font-medium', status.className)}>
                    {status.label}
                  </span>
                </div>
              </div>
            </div>
          )
        })}
        
        <Button variant="outline" className="w-full font-sans" asChild>
          <Link href={routes.adminOrders}>Ver cola completa</Link>
        </Button>
      </CardContent>
    </Card>
  )
}
