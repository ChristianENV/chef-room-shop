'use client'

import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routes } from '@/src/config/routes'

import { AdminOrdersError } from './components/admin-orders-error'
import { AdminOrderDetailSkeleton } from './components/admin-orders-loading'
import { AdminOrderDetailBody } from './order-detail/admin-order-detail-body'
import { AdminOrderDetailCancelDialog } from './order-detail/admin-order-detail-cancel-dialog'
import {
  useAdminOrderDetail,
  type AdminOrderDetailTab,
} from './order-detail/use-admin-order-detail'

export type OrderDetailDialogProps = {
  orderNumber: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: AdminOrderDetailTab
  onOpenCancelDialog?: boolean
}

export function OrderDetailDialog({
  orderNumber,
  open,
  onOpenChange,
  initialTab = 'details',
  onOpenCancelDialog,
}: OrderDetailDialogProps) {
  const detail = useAdminOrderDetail({
    orderNumber: orderNumber ?? '',
    enabled: open && Boolean(orderNumber),
    onOpenCancelDialog,
  })

  const title =
    orderNumber && detail.order
      ? `Pedido ${detail.order.orderNumber}`
      : orderNumber
        ? `Pedido ${orderNumber}`
        : 'Detalle de pedido'

  return (
    <>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          if (!next) detail.resetTransientState()
          onOpenChange(next)
        }}
      >
        <DialogContent
          data-testid="admin-order-detail-dialog"
          className="flex max-h-[min(92vh,900px)] max-w-[min(96vw,72rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-6xl"
          showCloseButton
        >
          <DialogHeader className="space-y-3 border-b border-border px-6 py-4 text-left">
            <div className="flex flex-wrap items-start justify-between gap-3 pr-8">
              <div>
                <DialogTitle className="font-sans text-lg">{title}</DialogTitle>
                <DialogDescription className="font-serif">
                  Vista rápida operativa. Abre la página completa para trabajo prolongado.
                </DialogDescription>
              </div>
              {orderNumber ? (
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="font-sans"
                  data-testid="admin-order-detail-full-page-link"
                >
                  <Link href={routes.adminOrderDetail(orderNumber)}>
                    <ExternalLink className="mr-2 h-4 w-4" />
                    Abrir página completa
                  </Link>
                </Button>
              ) : null}
            </div>
            {detail.order ? (
              <div className="flex flex-wrap items-center gap-2">
                <span className="rounded-md border border-border px-2 py-1 font-sans text-xs">
                  {detail.order.statusLabel}
                </span>
                <span className="rounded-md border border-border px-2 py-1 font-sans text-xs">
                  {detail.order.paymentStatusLabel}
                </span>
              </div>
            ) : null}
            {detail.actionMessage ? (
              <p className="font-serif text-sm text-success">{detail.actionMessage}</p>
            ) : null}
            {detail.actionError ? (
              <p className="font-serif text-sm text-destructive">{detail.actionError}</p>
            ) : null}
          </DialogHeader>

          <div className="min-h-0 flex-1 overflow-y-auto">
            {detail.detailQuery.isLoading ? (
              <div className="p-6">
                <AdminOrderDetailSkeleton />
              </div>
            ) : detail.detailQuery.isError ? (
              <div className="p-6">
                <AdminOrdersError
                  message="No pudimos cargar el detalle de la orden."
                  onRetry={() => void detail.detailQuery.refetch()}
                />
              </div>
            ) : !detail.order ? (
              <div className="p-6">
                <p className="font-serif text-sm text-muted-foreground">Orden no encontrada.</p>
              </div>
            ) : (
              <AdminOrderDetailBody
                key={`${orderNumber}-${initialTab}`}
                detail={detail}
                variant="modal"
                initialTab={initialTab}
                contentEnabled={open}
              />
            )}
          </div>
        </DialogContent>
      </Dialog>

      <AdminOrderDetailCancelDialog detail={detail} />
    </>
  )
}
