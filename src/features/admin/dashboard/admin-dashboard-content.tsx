'use client'

import { DollarSign, Package, Palette, ShoppingCart, TrendingUp, Users } from 'lucide-react'

import { RecentDesigns } from '@/src/features/admin/designs/recent-designs'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { RecentOrdersTable } from '@/src/features/admin/orders/recent-orders-table'
import { AdminChartCard, ChartPlaceholder } from '@/src/features/admin/dashboard/admin-chart-card'
import { MetricCard } from '@/src/features/admin/dashboard/metric-card'
import { ProductionQueue } from '@/src/features/admin/dashboard/production-queue'
import { AdminDashboardMetricsSkeleton } from '@/src/features/admin/dashboard/components/admin-dashboard-metrics-skeleton'
import { AdminDashboardSectionError } from '@/src/features/admin/dashboard/components/admin-dashboard-section-error'
import { AdminDashboardSectionSkeleton } from '@/src/features/admin/dashboard/components/admin-dashboard-section-skeleton'
import { getAdminDashboardErrorMessage } from '@/src/features/admin/dashboard/api/admin-dashboard-errors'
import { useAdminDashboardMetricsQuery } from '@/src/features/admin/dashboard/api/use-admin-dashboard-metrics-query'
import { useAdminProductionQueueQuery } from '@/src/features/admin/dashboard/api/use-admin-production-queue-query'
import { useAdminRecentDesignsQuery } from '@/src/features/admin/dashboard/api/use-admin-recent-designs-query'
import { useAdminRecentOrdersQuery } from '@/src/features/admin/dashboard/api/use-admin-recent-orders-query'
import {
  mapMetricsToUi,
  mapProductionQueueItemToUi,
  mapRecentDesignToUi,
  mapRecentOrderToUi,
} from '@/src/features/admin/dashboard/mappers/admin-dashboard-ui.mapper'

const LIST_LIMIT = 8

export function AdminDashboardContent() {
  const metricsQuery = useAdminDashboardMetricsQuery()
  const ordersQuery = useAdminRecentOrdersQuery(LIST_LIMIT)
  const queueQuery = useAdminProductionQueueQuery(LIST_LIMIT)
  const designsQuery = useAdminRecentDesignsQuery(LIST_LIMIT)

  const metrics = metricsQuery.data ? mapMetricsToUi(metricsQuery.data) : null
  const orders = (ordersQuery.data ?? []).map(mapRecentOrderToUi)
  const queueItems = (queueQuery.data ?? []).map(mapProductionQueueItemToUi)
  const designs = (designsQuery.data ?? []).map(mapRecentDesignToUi)

  return (
    <AdminPageConfig notificationCount={metricsQuery.data?.pendingOrders}>
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold tracking-tight text-foreground">Dashboard</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Bienvenido al panel de administracion de Chef Room
          </p>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
          {metricsQuery.isLoading ? (
            <AdminDashboardMetricsSkeleton />
          ) : metricsQuery.isError || !metrics ? (
            <div className="col-span-full">
              <AdminDashboardSectionError
                message={getAdminDashboardErrorMessage(
                  metricsQuery.error,
                  'No pudimos cargar las métricas del dashboard.',
                )}
                onRetry={() => void metricsQuery.refetch()}
              />
            </div>
          ) : (
            <>
              <MetricCard
                title="Ventas del Dia"
                value={metrics.ventasDia}
                icon={<DollarSign className="h-6 w-6" />}
              />
              <MetricCard
                title="Ventas del Mes"
                value={metrics.ventasMes}
                icon={<TrendingUp className="h-6 w-6" />}
              />
              <MetricCard
                title="Ordenes Pendientes"
                value={metrics.ordenesPendientes}
                icon={<Package className="h-6 w-6" />}
                subtitle={metrics.ordenesPendientesSubtitle}
              />
              <MetricCard
                title="Disenos Creados"
                value={metrics.disenosCreados}
                icon={<Palette className="h-6 w-6" />}
              />
              <MetricCard
                title="Carritos Abandonados"
                value={metrics.carritosAbandonados}
                icon={<ShoppingCart className="h-6 w-6" />}
              />
              <MetricCard
                title="Ticket Promedio"
                value={metrics.ticketPromedio}
                icon={<Users className="h-6 w-6" />}
              />
            </>
          )}
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminChartCard title="Ventas en el Tiempo" description="Ultimos 30 dias">
            <ChartPlaceholder height={250} type="line" label="Ventas diarias" />
          </AdminChartCard>
          <AdminChartCard title="Ordenes por Estado" description="Distribucion actual">
            <ChartPlaceholder height={250} type="donut" label="Estados de ordenes" />
          </AdminChartCard>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <AdminChartCard title="Productos Mas Personalizados" description="Top 5 este mes">
            <ChartPlaceholder height={200} type="bar" label="Por tipo de personalizacion" />
          </AdminChartCard>
          <AdminChartCard title="Colores Populares" description="Preferencias de clientes">
            <ChartPlaceholder height={200} type="pie" label="Distribucion de colores" />
          </AdminChartCard>
        </div>

        {ordersQuery.isLoading ? (
          <AdminDashboardSectionSkeleton title="Órdenes recientes" lines={5} />
        ) : ordersQuery.isError ? (
          <AdminDashboardSectionError
            message={getAdminDashboardErrorMessage(
              ordersQuery.error,
              'No pudimos cargar las órdenes recientes.',
            )}
            onRetry={() => void ordersQuery.refetch()}
          />
        ) : (
          <RecentOrdersTable orders={orders} />
        )}

        <div className="grid gap-4 lg:grid-cols-2">
          {queueQuery.isLoading ? (
            <AdminDashboardSectionSkeleton title="Cola de producción" lines={4} />
          ) : queueQuery.isError ? (
            <AdminDashboardSectionError
              message={getAdminDashboardErrorMessage(
                queueQuery.error,
                'No pudimos cargar la cola de producción.',
              )}
              onRetry={() => void queueQuery.refetch()}
              compact
            />
          ) : (
            <ProductionQueue items={queueItems} />
          )}

          {designsQuery.isLoading ? (
            <AdminDashboardSectionSkeleton title="Diseños recientes" lines={3} />
          ) : designsQuery.isError ? (
            <AdminDashboardSectionError
              message={getAdminDashboardErrorMessage(
                designsQuery.error,
                'No pudimos cargar los diseños recientes.',
              )}
              onRetry={() => void designsQuery.refetch()}
              compact
            />
          ) : (
            <RecentDesigns designs={designs} />
          )}
        </div>
      </div>
    </AdminPageConfig>
  )
}
