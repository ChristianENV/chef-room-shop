'use client'

import Link from 'next/link'
import { ArrowLeft, FileText } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

import { AdminOrdersError } from '../components/admin-orders-error'
import { AdminOrderDetailSkeleton } from '../components/admin-orders-loading'
import { AdminOrderDetailBody } from './admin-order-detail-body'
import { AdminOrderDetailCancelDialog } from './admin-order-detail-cancel-dialog'
import { AdminOrderDetailHeader } from './admin-order-detail-header'
import { useAdminOrderDetail, type AdminOrderDetailTab } from './use-admin-order-detail'

type AdminOrderDetailPageViewProps = {
  orderNumber: string
  initialTab?: AdminOrderDetailTab
}

export function AdminOrderDetailPageView({
  orderNumber,
  initialTab = 'details',
}: AdminOrderDetailPageViewProps) {
  const detail = useAdminOrderDetail({
    orderNumber,
    enabled: true,
  })

  if (detail.detailQuery.isLoading) {
    return <AdminOrderDetailSkeleton />
  }

  if (detail.detailQuery.isError) {
    return (
      <AdminOrdersError
        message="No pudimos cargar el detalle de la orden."
        onRetry={() => void detail.detailQuery.refetch()}
      />
    )
  }

  if (!detail.order) {
    return (
      <div className="rounded-lg border border-dashed border-border p-8 text-center">
        <p className="font-sans text-lg font-semibold">Orden no encontrada</p>
        <p className="mt-2 font-serif text-sm text-muted-foreground">
          Verifica el número de pedido o vuelve al listado.
        </p>
        <Button asChild className="mt-6 font-sans">
          <Link href={routes.adminOrders}>Volver a órdenes</Link>
        </Button>
      </div>
    )
  }

  return (
    <div
      className="mx-auto w-full max-w-screen-2xl space-y-6"
      data-testid="admin-order-detail-page"
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <Button asChild variant="outline" size="sm" className="w-fit font-sans">
          <Link href={routes.adminOrders}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Volver a órdenes
          </Link>
        </Button>
        <Button
          type="button"
          variant="default"
          size="sm"
          className="w-fit font-sans"
          onClick={() => {
            document.getElementById('admin-order-production')?.scrollIntoView({
              behavior: 'smooth',
            })
          }}
        >
          <FileText className="mr-2 h-4 w-4" />
          Ir a ficha de producción
        </Button>
      </div>

      <AdminOrderDetailHeader detail={detail} variant="page" />

      <AdminOrderDetailBody
        detail={detail}
        variant="page"
        initialTab={initialTab}
        contentEnabled
      />

      <AdminOrderDetailCancelDialog detail={detail} />
    </div>
  )
}
