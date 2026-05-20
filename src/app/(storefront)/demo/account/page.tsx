import { AccountLayout } from '@/src/features/storefront/layout'
import { ContentCard, DataGrid } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Package, Eye, Download, Truck } from 'lucide-react'

const mockOrders = [
  {
    id: 'ORD-2024-001',
    date: '15 Ene 2024',
    status: 'delivered',
    items: 2,
    total: '$2,847.00',
  },
  {
    id: 'ORD-2024-002',
    date: '22 Feb 2024',
    status: 'shipped',
    items: 1,
    total: '$1,299.00',
  },
  {
    id: 'ORD-2024-003',
    date: '10 Mar 2024',
    status: 'processing',
    items: 3,
    total: '$3,499.00',
  },
]

const statusConfig = {
  delivered: { label: 'Entregado', variant: 'default' as const, color: 'bg-success text-white' },
  shipped: { label: 'En Camino', variant: 'default' as const, color: 'bg-accent text-white' },
  processing: { label: 'Procesando', variant: 'default' as const, color: 'bg-warning text-foreground' },
}

export default function AccountLayoutDemo() {
  return (
    <AccountLayout
      title="Mis Pedidos"
      description="Historial y seguimiento de tus compras"
      userName="Juan Perez"
    >
      <div className="space-y-6">
        {/* Stats */}
        <DataGrid columns={3}>
          <ContentCard className="text-center">
            <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <Package className="h-6 w-6 text-primary" />
            </div>
            <p className="mt-3 font-sans text-2xl font-bold text-foreground">12</p>
            <p className="font-serif text-sm text-muted-foreground">Pedidos Totales</p>
          </ContentCard>
          <ContentCard className="text-center">
            <div className="rounded-full bg-success/10 p-3 w-fit mx-auto">
              <Truck className="h-6 w-6 text-success" />
            </div>
            <p className="mt-3 font-sans text-2xl font-bold text-foreground">10</p>
            <p className="font-serif text-sm text-muted-foreground">Entregados</p>
          </ContentCard>
          <ContentCard className="text-center">
            <div className="rounded-full bg-accent/10 p-3 w-fit mx-auto">
              <Package className="h-6 w-6 text-accent" />
            </div>
            <p className="mt-3 font-sans text-2xl font-bold text-foreground">2</p>
            <p className="font-serif text-sm text-muted-foreground">En Proceso</p>
          </ContentCard>
        </DataGrid>

        {/* Orders List */}
        <ContentCard
          title="Pedidos Recientes"
          action={
            <Button variant="outline" size="sm">
              Ver Todos
            </Button>
          }
        >
          <div className="space-y-4">
            {mockOrders.map((order) => {
              const status = statusConfig[order.status as keyof typeof statusConfig]
              
              return (
                <div
                  key={order.id}
                  className="flex flex-col gap-4 rounded-lg border border-border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <p className="font-sans text-sm font-semibold text-foreground">
                        {order.id}
                      </p>
                      <Badge className={status.color}>{status.label}</Badge>
                    </div>
                    <p className="mt-1 font-serif text-sm text-muted-foreground">
                      {order.date} - {order.items} producto{order.items > 1 ? 's' : ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 sm:justify-end">
                    <p className="font-sans font-semibold text-foreground">{order.total}</p>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="icon">
                        <Eye className="h-4 w-4" />
                        <span className="sr-only">Ver detalles</span>
                      </Button>
                      <Button variant="ghost" size="icon">
                        <Download className="h-4 w-4" />
                        <span className="sr-only">Descargar factura</span>
                      </Button>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </ContentCard>

        {/* Recent Designs */}
        <ContentCard
          title="Disenos Guardados"
          description="Tus personalizaciones guardadas"
        >
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="rounded-lg border border-border p-4">
                <div className="aspect-square rounded-md bg-secondary" />
                <p className="mt-3 font-sans text-sm font-medium text-foreground">
                  Filipina Personalizada #{i}
                </p>
                <p className="font-serif text-xs text-muted-foreground">
                  Guardado hace {i} dias
                </p>
                <Button variant="outline" size="sm" className="mt-3 w-full">
                  Editar Diseno
                </Button>
              </div>
            ))}
          </div>
        </ContentCard>
      </div>
    </AccountLayout>
  )
}
