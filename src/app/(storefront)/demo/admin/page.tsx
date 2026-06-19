import { AdminLayout } from '@/src/features/admin/layout'
import { StatCard, ContentCard, DataGrid } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  DollarSign,
  Package,
  ShoppingCart,
  Users,
  TrendingUp,
  Eye,
  MoreHorizontal,
  Plus,
} from 'lucide-react'

const mockRecentOrders = [
  {
    id: 'ORD-001',
    customer: 'Juan Perez',
    total: '$2,847.00',
    status: 'processing',
    date: '15 Mar 2024',
  },
  {
    id: 'ORD-002',
    customer: 'Maria Garcia',
    total: '$1,299.00',
    status: 'shipped',
    date: '14 Mar 2024',
  },
  {
    id: 'ORD-003',
    customer: 'Carlos Lopez',
    total: '$899.00',
    status: 'delivered',
    date: '13 Mar 2024',
  },
  {
    id: 'ORD-004',
    customer: 'Ana Martinez',
    total: '$3,499.00',
    status: 'processing',
    date: '12 Mar 2024',
  },
  {
    id: 'ORD-005',
    customer: 'Roberto Diaz',
    total: '$449.00',
    status: 'delivered',
    date: '11 Mar 2024',
  },
]

const statusConfig = {
  processing: { label: 'Procesando', color: 'bg-warning text-foreground' },
  shipped: { label: 'Enviado', color: 'bg-accent text-white' },
  delivered: { label: 'Entregado', color: 'bg-success text-white' },
}

export default function AdminLayoutDemo() {
  return (
    <AdminLayout breadcrumb={[{ label: 'Dashboard' }]} environment="DEV" notificationCount={5}>
      <div className="space-y-6">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">Dashboard</h1>
            <p className="mt-1 font-serif text-muted-foreground">
              Bienvenido de vuelta. Aqui esta el resumen de hoy.
            </p>
          </div>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo Producto
          </Button>
        </div>

        {/* Stats Grid */}
        <DataGrid columns={4}>
          <StatCard
            label="Ventas del Mes"
            value="$124,500"
            change={{ value: '12.5%', trend: 'up' }}
            icon={<DollarSign className="h-5 w-5" />}
          />
          <StatCard
            label="Pedidos"
            value="234"
            change={{ value: '8.2%', trend: 'up' }}
            icon={<ShoppingCart className="h-5 w-5" />}
          />
          <StatCard
            label="Productos Activos"
            value="89"
            change={{ value: '3 nuevos', trend: 'neutral' }}
            icon={<Package className="h-5 w-5" />}
          />
          <StatCard
            label="Clientes Nuevos"
            value="156"
            change={{ value: '18.9%', trend: 'up' }}
            icon={<Users className="h-5 w-5" />}
          />
        </DataGrid>

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Recent Orders */}
          <ContentCard
            title="Pedidos Recientes"
            action={
              <Button variant="ghost" size="sm">
                Ver Todos
              </Button>
            }
            className="lg:col-span-2"
            noPadding
          >
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="font-sans">Pedido</TableHead>
                  <TableHead className="font-sans">Cliente</TableHead>
                  <TableHead className="font-sans">Estado</TableHead>
                  <TableHead className="font-sans text-right">Total</TableHead>
                  <TableHead className="font-sans w-[50px]"></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {mockRecentOrders.map((order) => {
                  const status = statusConfig[order.status as keyof typeof statusConfig]
                  return (
                    <TableRow key={order.id}>
                      <TableCell className="font-sans font-medium">{order.id}</TableCell>
                      <TableCell className="font-serif">{order.customer}</TableCell>
                      <TableCell>
                        <Badge className={status.color}>{status.label}</Badge>
                      </TableCell>
                      <TableCell className="font-sans font-semibold text-right">
                        {order.total}
                      </TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </ContentCard>

          {/* Top Products */}
          <ContentCard title="Productos Top">
            <div className="space-y-4">
              {[
                { name: 'Filipina Chef Premium', sales: 145, revenue: '$188,355' },
                { name: 'Mandil Clasico', sales: 98, revenue: '$43,902' },
                { name: 'Pantalon Chef', sales: 76, revenue: '$53,164' },
                { name: 'Gorro Chef', sales: 64, revenue: '$12,736' },
              ].map((product, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-secondary font-sans text-sm font-semibold text-muted-foreground">
                    {index + 1}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-sans text-sm font-medium text-foreground truncate">
                      {product.name}
                    </p>
                    <p className="font-serif text-xs text-muted-foreground">
                      {product.sales} ventas
                    </p>
                  </div>
                  <p className="font-sans text-sm font-semibold text-foreground">
                    {product.revenue}
                  </p>
                </div>
              ))}
            </div>
          </ContentCard>
        </div>

        {/* Quick Actions */}
        <ContentCard title="Acciones Rapidas">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { label: 'Agregar Producto', icon: Package, color: 'bg-primary' },
              { label: 'Ver Pedidos', icon: ShoppingCart, color: 'bg-accent' },
              { label: 'Analiticas', icon: TrendingUp, color: 'bg-success' },
              { label: 'Ver Tienda', icon: Eye, color: 'bg-secondary' },
            ].map((action, index) => (
              <Button key={index} variant="outline" className="h-auto flex-col gap-2 p-4">
                <div className={`rounded-lg p-2 ${action.color} text-white`}>
                  <action.icon className="h-5 w-5" />
                </div>
                <span className="font-sans text-sm">{action.label}</span>
              </Button>
            ))}
          </div>
        </ContentCard>
      </div>
    </AdminLayout>
  )
}
