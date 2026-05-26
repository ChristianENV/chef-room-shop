'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  OrdersStatusCards,
  OrdersToolbar,
  OrdersTable,
  OrderDetailDialog,
} from '@/src/features/admin/orders'
import { routes } from '@/src/config/routes'
import { useAdminOrdersQuery } from '@/src/features/admin/orders/api/use-admin-orders-query'
import { useAdminOrderStatusSummaryQuery } from '@/src/features/admin/orders/api/use-admin-order-status-summary-query'
import { useMoveAdminOrderToProductionMutation } from '@/src/features/admin/orders/api/use-move-admin-order-to-production-mutation'
import { useMarkAdminOrderReadyToShipMutation } from '@/src/features/admin/orders/api/use-mark-admin-order-ready-to-ship-mutation'
import { AdminOrdersError } from '@/src/features/admin/orders/components/admin-orders-error'
import {
  buildAdminOrdersListVariables,
  mapAdminOrderToTableRow,
  mapAdminStatusSummaryToCards,
} from '@/src/features/admin/orders/mappers/admin-orders-ui.mapper'
import type {
  AdminOrderStatusFilter,
  AdminPaymentStatusFilter,
} from '@/src/features/admin/orders/types/admin-orders-ui.types'

export default function AdminOrdersPage() {
  const router = useRouter()
  const [selectedOrderNumber, setSelectedOrderNumber] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [dialogInitialTab, setDialogInitialTab] = useState<
    'details' | 'items' | 'timeline' | 'production'
  >('details')
  const [dialogCancelOnOpen, setDialogCancelOnOpen] = useState(false)
  const [actionOrderNumber, setActionOrderNumber] = useState<string | null>(null)

  const [searchQuery, setSearchQuery] = useState('')
  const deferredSearch = useDeferredValue(searchQuery)
  const [statusFilter, setStatusFilter] = useState<AdminOrderStatusFilter | 'all'>('all')
  const [paymentFilter, setPaymentFilter] = useState<AdminPaymentStatusFilter | 'all'>('all')
  const [productionOnly, setProductionOnly] = useState(false)
  const [cardStatusFilter, setCardStatusFilter] = useState<AdminOrderStatusFilter | null>(null)

  const listVariables = useMemo(
    () =>
      buildAdminOrdersListVariables({
        search: deferredSearch,
        statusFilter,
        paymentFilter,
        cardStatusFilter,
        productionOnly,
        limit: 50,
        offset: 0,
      }),
    [deferredSearch, statusFilter, paymentFilter, cardStatusFilter, productionOnly],
  )

  const ordersQuery = useAdminOrdersQuery(listVariables)
  const summaryQuery = useAdminOrderStatusSummaryQuery()
  const moveToProduction = useMoveAdminOrderToProductionMutation()
  const markReadyToShip = useMarkAdminOrderReadyToShipMutation()

  const statusCounts = useMemo(
    () =>
      summaryQuery.data ? mapAdminStatusSummaryToCards(summaryQuery.data) : undefined,
    [summaryQuery.data],
  )

  const tableRows = useMemo(
    () => (ordersQuery.data?.items ?? []).map(mapAdminOrderToTableRow),
    [ordersQuery.data?.items],
  )

  const openOrderDialog = (
    orderNumber: string,
    options?: {
      tab?: typeof dialogInitialTab
      cancel?: boolean
    },
  ) => {
    setSelectedOrderNumber(orderNumber)
    setDialogInitialTab(options?.tab ?? 'details')
    setDialogCancelOnOpen(!!options?.cancel)
    setDialogOpen(true)
  }

  const handleDialogOpenChange = (open: boolean) => {
    setDialogOpen(open)
    if (!open) {
      setDialogCancelOnOpen(false)
    }
  }

  const runTableAction = async (orderNumber: string, action: () => Promise<unknown>) => {
    setActionOrderNumber(orderNumber)
    try {
      await action()
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin-orders]', error)
      }
    } finally {
      setActionOrderNumber(null)
    }
  }

  return (
    <AdminPageConfig
      breadcrumb={[{ label: 'Órdenes' }]}
      notificationCount={statusCounts?.['pendiente-pago']}
    >
      <div className="space-y-6">
        <div>
          <h1 className="font-sans text-2xl font-bold text-foreground">Órdenes</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Gestiona pagos, producción, personalizaciones y envíos.
          </p>
        </div>

        <OrdersStatusCards
          counts={statusCounts}
          selectedStatus={cardStatusFilter}
          onStatusSelect={(status) => {
            setCardStatusFilter(status)
            if (status) setStatusFilter('all')
          }}
          isLoading={summaryQuery.isLoading}
          isError={summaryQuery.isError}
          onRetry={() => void summaryQuery.refetch()}
        />

        <OrdersToolbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          statusFilter={statusFilter}
          onStatusFilterChange={(value) => {
            setStatusFilter(value)
            setCardStatusFilter(null)
          }}
          paymentFilter={paymentFilter}
          onPaymentFilterChange={setPaymentFilter}
          productionOnly={productionOnly}
          onProductionOnlyChange={setProductionOnly}
        />

        {ordersQuery.isError ? (
          <AdminOrdersError onRetry={() => void ordersQuery.refetch()} />
        ) : (
          <OrdersTable
            rows={tableRows}
            loading={ordersQuery.isPending}
            onViewOrder={(orderNumber) => openOrderDialog(orderNumber)}
            onOpenFullPage={(orderNumber) => {
              router.push(routes.adminOrderDetail(orderNumber))
            }}
            onMoveToProduction={(orderNumber) =>
              void runTableAction(orderNumber, () =>
                moveToProduction.mutateAsync(orderNumber),
              )
            }
            onMarkReadyToShip={(orderNumber) =>
              void runTableAction(orderNumber, () => markReadyToShip.mutateAsync(orderNumber))
            }
            onAddTracking={(orderNumber) => openOrderDialog(orderNumber)}
            onCancelOrder={(orderNumber) =>
              openOrderDialog(orderNumber, { cancel: true })
            }
            onOpenProductionSheet={(orderNumber) =>
              openOrderDialog(orderNumber, { tab: 'production' })
            }
            actionOrderNumber={actionOrderNumber}
          />
        )}

        <OrderDetailDialog
          orderNumber={selectedOrderNumber}
          open={dialogOpen}
          onOpenChange={handleDialogOpenChange}
          initialTab={dialogInitialTab}
          onOpenCancelDialog={dialogCancelOnOpen}
        />
      </div>
    </AdminPageConfig>
  )
}
