'use client'

import { MapPin, Package, Receipt, FileText } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { formatCurrencyMXN } from '@/src/lib/formatters'
import { AdminShipmentCard } from '@/src/features/admin/shipping/components/admin-shipment-card'

import { CustomizationSnapshot } from '../customization-snapshot'
import { OrderTimeline } from '../order-timeline'
import { ProductionSheetPreview } from '../production-sheet-preview'
import { AdminOrderCustomerInfoCard } from './admin-order-customer-info-card'
import { AdminOrderDetailSectionCard } from './admin-order-detail-section-card'
import { AdminOrderFinancialSummary } from './admin-order-financial-summary'
import { AdminOrderPaymentCard } from './admin-order-payment-card'
import { AdminOrderQuickActionsCard } from './admin-order-quick-actions-card'
import { AdminOrderSummaryStrip } from './admin-order-summary-strip'
import type { AdminOrderDetailState } from './use-admin-order-detail'

type AdminOrderDetailPageBodyProps = {
  detail: AdminOrderDetailState
  contentEnabled: boolean
}

export function AdminOrderDetailPageBody({
  detail,
  contentEnabled,
}: AdminOrderDetailPageBodyProps) {
  const { order, bffOrder } = detail
  if (!order || !bffOrder) return null

  const scrollToProduction = () => {
    document.getElementById('admin-order-production')?.scrollIntoView({ behavior: 'smooth' })
  }

  return (
    <div className="space-y-6">
      <AdminOrderSummaryStrip order={order} />

      <AdminOrderDetailSectionCard
        title="Cliente y direcciones"
        description="Datos de contacto y destino del pedido"
        icon={MapPin}
      >
        <AdminOrderCustomerInfoCard order={order} />
      </AdminOrderDetailSectionCard>

      <AdminOrderDetailSectionCard
        title="Pago, envío y totales"
        description="Estado de pago, guía Skydropx y desglose financiero"
        icon={Receipt}
        contentClassName="p-0 sm:p-0"
      >
        <div className="grid gap-0 divide-y divide-border lg:grid-cols-3 lg:divide-x lg:divide-y-0">
          <div className="p-5 sm:p-6">
            <AdminOrderPaymentCard
              order={order}
              onCopyReference={(value) => void detail.copyToClipboard(value)}
            />
          </div>
          <div className="p-5 sm:p-6">
            <AdminShipmentCard
              orderNumber={order.orderNumber}
              order={bffOrder}
              enabled={contentEnabled}
              embedded
              onSuccessMessage={(msg) => {
                detail.setActionMessage(msg)
                detail.setActionError(null)
              }}
              onErrorMessage={(msg) => {
                detail.setActionError(msg)
                detail.setActionMessage(null)
              }}
            />
          </div>
          <div className="p-5 sm:p-6">
            <AdminOrderFinancialSummary order={order} />
          </div>
        </div>
      </AdminOrderDetailSectionCard>

      <div className="grid gap-6 lg:grid-cols-12">
        <aside className="order-1 space-y-6 lg:order-2 lg:col-span-4 lg:self-start">
          <div className="lg:sticky lg:top-24">
            <AdminOrderQuickActionsCard
              order={order}
              detail={detail}
              onOpenProduction={scrollToProduction}
            />
          </div>
        </aside>

        <div className="order-2 space-y-6 lg:order-1 lg:col-span-8">
          <AdminOrderDetailSectionCard title={`Productos (${order.items.length})`} icon={Package}>
            <div className="space-y-4">
              {order.items.map((item) => (
                <div
                  key={item.id}
                  className="rounded-lg border border-border/80 bg-muted/10 p-4 sm:p-5"
                >
                  <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-start">
                    <div className="min-w-0 flex-1">
                      <p className="font-sans text-base font-medium">{item.productName}</p>
                      <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.sku}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        <Badge variant="outline">Talla: {item.size}</Badge>
                        <Badge variant="secondary">x{item.quantity}</Badge>
                        {item.hasCustomization ? <Badge>Personalizado</Badge> : null}
                      </div>
                    </div>
                    <p className="shrink-0 font-sans text-lg font-semibold tabular-nums">
                      {formatCurrencyMXN(item.totalPrice)}
                    </p>
                  </div>
                  {item.hasCustomization ? (
                    <CustomizationSnapshot item={item} className="mt-4" />
                  ) : null}
                </div>
              ))}
            </div>
          </AdminOrderDetailSectionCard>

          <AdminOrderDetailSectionCard title="Timeline" description="Historial de la orden">
            <OrderTimeline events={order.timeline} className="max-w-none" />
          </AdminOrderDetailSectionCard>

          <AdminOrderDetailSectionCard
            id="admin-order-production"
            title="Ficha de producción"
            description="Vista para taller e impresión"
            icon={FileText}
            className="scroll-mt-24"
          >
            <div>
              <ProductionSheetPreview
                sheet={detail.productionSheet}
                isLoading={detail.productionSheetQuery.isLoading}
                isError={detail.productionSheetQuery.isError}
                onRetry={() => void detail.productionSheetQuery.refetch()}
              />
            </div>
          </AdminOrderDetailSectionCard>
        </div>
      </div>
    </div>
  )
}
