'use client'

import { 
  DollarSign, 
  Package, 
  Palette, 
  ShoppingCart, 
  TrendingUp,
  Users
} from 'lucide-react'
import { AdminLayout } from '@/components/layout/admin-layout'
import {
  MetricCard,
  AdminChartCard,
  ChartPlaceholder,
  RecentOrdersTable,
  ProductionQueue,
  RecentDesigns,
  type AdminOrder,
  type ProductionItem,
  type RecentDesign,
} from '@/components/admin'

// TODO: Replace with TanStack Query for real-time dashboard data
// TODO: Replace with GraphQL queries for dashboard metrics
const MOCK_METRICS = {
  ventasDia: {
    value: '$24,850',
    change: { value: 12.5, type: 'increase' as const },
  },
  ventasMes: {
    value: '$487,320',
    change: { value: 8.2, type: 'increase' as const },
  },
  ordenesPendientes: {
    value: 23,
    subtitle: '5 urgentes',
  },
  disenosCreados: {
    value: 156,
    change: { value: 24, type: 'increase' as const },
  },
  carritosAbandonados: {
    value: 47,
    change: { value: -5, type: 'decrease' as const },
  },
  ticketPromedio: {
    value: '$1,890',
    change: { value: 3.2, type: 'increase' as const },
  },
}

const MOCK_RECENT_ORDERS: AdminOrder[] = [
  {
    id: 'order-1',
    orderNumber: 'CR-2024-001567',
    customerName: 'Carlos Rodriguez',
    customerEmail: 'carlos@email.com',
    status: 'en-produccion',
    paymentStatus: 'completado',
    total: 4194,
    itemCount: 3,
    date: '2024-11-28',
    hasCustomization: true,
  },
  {
    id: 'order-2',
    orderNumber: 'CR-2024-001566',
    customerName: 'Maria Gonzalez',
    customerEmail: 'maria@email.com',
    status: 'pagado',
    paymentStatus: 'completado',
    total: 2598,
    itemCount: 2,
    date: '2024-11-28',
    hasCustomization: true,
  },
  {
    id: 'order-3',
    orderNumber: 'CR-2024-001565',
    customerName: 'Juan Martinez',
    customerEmail: 'juan@email.com',
    status: 'enviado',
    paymentStatus: 'completado',
    total: 1299,
    itemCount: 1,
    date: '2024-11-27',
    hasCustomization: false,
  },
  {
    id: 'order-4',
    orderNumber: 'CR-2024-001564',
    customerName: 'Ana Lopez',
    customerEmail: 'ana@email.com',
    status: 'pendiente',
    paymentStatus: 'pendiente',
    total: 3497,
    itemCount: 4,
    date: '2024-11-27',
    hasCustomization: true,
  },
  {
    id: 'order-5',
    orderNumber: 'CR-2024-001563',
    customerName: 'Roberto Sanchez',
    customerEmail: 'roberto@email.com',
    status: 'entregado',
    paymentStatus: 'completado',
    total: 1898,
    itemCount: 2,
    date: '2024-11-26',
    hasCustomization: true,
  },
]

const MOCK_PRODUCTION_ITEMS: ProductionItem[] = [
  {
    id: 'prod-1',
    orderNumber: 'CR-2024-001567',
    productName: 'Filipina Slim Fit Negra',
    productType: 'filipina',
    quantity: 3,
    customizationType: 'iniciales',
    customizationText: 'CR',
    estimatedDelivery: '2024-12-10',
    status: 'en-produccion',
    priority: 'normal',
  },
  {
    id: 'prod-2',
    orderNumber: 'CR-2024-001566',
    productName: 'Mandil Profesional Chef',
    productType: 'mandil',
    quantity: 2,
    customizationType: 'logo',
    estimatedDelivery: '2024-12-08',
    status: 'nuevo',
    priority: 'urgente',
  },
  {
    id: 'prod-3',
    orderNumber: 'CR-2024-001560',
    productName: 'Filipina Executive Blanca',
    productType: 'filipina',
    quantity: 1,
    customizationType: 'nombre',
    customizationText: 'Chef Maria',
    estimatedDelivery: '2024-12-05',
    status: 'listo',
    priority: 'normal',
  },
  {
    id: 'prod-4',
    orderNumber: 'CR-2024-001558',
    productName: 'Pantalon Chef Cargo',
    productType: 'pantalon',
    quantity: 2,
    customizationType: 'ninguno',
    estimatedDelivery: '2024-12-03',
    status: 'en-produccion',
    priority: 'normal',
  },
]

const MOCK_RECENT_DESIGNS: RecentDesign[] = [
  {
    id: 'design-1',
    previewUrl: '/designs/preview-1.jpg',
    productName: 'Filipina Executive Blanca',
    productType: 'filipina',
    userName: 'Carlos Rodriguez',
    userEmail: 'carlos@email.com',
    status: 'comprado',
    estimatedValue: 1498,
    createdAt: '2024-11-28T14:30:00',
  },
  {
    id: 'design-2',
    previewUrl: '/designs/preview-2.jpg',
    productName: 'Mandil Bistro Premium',
    productType: 'mandil',
    userName: 'Maria Gonzalez',
    userEmail: 'maria@email.com',
    status: 'en-carrito',
    estimatedValue: 948,
    createdAt: '2024-11-28T12:15:00',
  },
  {
    id: 'design-3',
    previewUrl: '/designs/preview-3.jpg',
    productName: 'Filipina Slim Fit Negra',
    productType: 'filipina',
    userName: 'Juan Martinez',
    userEmail: 'juan@email.com',
    status: 'borrador',
    estimatedValue: 1398,
    createdAt: '2024-11-28T10:45:00',
  },
]

export default function AdminDashboardPage() {
  return (
    <AdminLayout notificationCount={5}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">
            Dashboard
          </h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Bienvenido al panel de administracion de Chef Room
          </p>
        </div>

        {/* KPI Cards */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          <MetricCard
            title="Ventas del Dia"
            value={MOCK_METRICS.ventasDia.value}
            icon={<DollarSign className="h-6 w-6" />}
            change={MOCK_METRICS.ventasDia.change}
          />
          <MetricCard
            title="Ventas del Mes"
            value={MOCK_METRICS.ventasMes.value}
            icon={<TrendingUp className="h-6 w-6" />}
            change={MOCK_METRICS.ventasMes.change}
          />
          <MetricCard
            title="Ordenes Pendientes"
            value={MOCK_METRICS.ordenesPendientes.value}
            icon={<Package className="h-6 w-6" />}
            subtitle={MOCK_METRICS.ordenesPendientes.subtitle}
          />
          <MetricCard
            title="Disenos Creados"
            value={MOCK_METRICS.disenosCreados.value}
            icon={<Palette className="h-6 w-6" />}
            change={MOCK_METRICS.disenosCreados.change}
          />
          <MetricCard
            title="Carritos Abandonados"
            value={MOCK_METRICS.carritosAbandonados.value}
            icon={<ShoppingCart className="h-6 w-6" />}
            change={MOCK_METRICS.carritosAbandonados.change}
          />
          <MetricCard
            title="Ticket Promedio"
            value={MOCK_METRICS.ticketPromedio.value}
            icon={<Users className="h-6 w-6" />}
            change={MOCK_METRICS.ticketPromedio.change}
          />
        </div>

        {/* Charts Row */}
        <div className="grid gap-4 lg:grid-cols-2">
          <AdminChartCard
            title="Ventas en el Tiempo"
            description="Ultimos 30 dias"
          >
            <ChartPlaceholder height={250} type="line" label="Ventas diarias" />
          </AdminChartCard>
          
          <AdminChartCard
            title="Ordenes por Estado"
            description="Distribucion actual"
          >
            <ChartPlaceholder height={250} type="donut" label="Estados de ordenes" />
          </AdminChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminChartCard
            title="Productos Mas Personalizados"
            description="Top 5 este mes"
          >
            <ChartPlaceholder height={200} type="bar" label="Por tipo de personalizacion" />
          </AdminChartCard>
          
          <AdminChartCard
            title="Colores Populares"
            description="Preferencias de clientes"
          >
            <ChartPlaceholder height={200} type="pie" label="Distribucion de colores" />
          </AdminChartCard>
        </div>

        {/* Recent Orders Table */}
        <RecentOrdersTable orders={MOCK_RECENT_ORDERS} />

        {/* Production Queue and Recent Designs */}
        <div className="grid gap-4 lg:grid-cols-2">
          <ProductionQueue items={MOCK_PRODUCTION_ITEMS} />
          <RecentDesigns designs={MOCK_RECENT_DESIGNS} />
        </div>
      </div>
    </AdminLayout>
  )
}
