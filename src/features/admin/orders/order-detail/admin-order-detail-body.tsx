'use client'

import { useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'

import type { AdminOrder } from '../types'
import { AdminShipmentCard } from '@/src/features/admin/shipping/components/admin-shipment-card'
import { CustomizationSnapshot } from '../customization-snapshot'
import { OrderTimeline } from '../order-timeline'
import { ProductionSheetPreview } from '../production-sheet-preview'
import { mapAdminOrderToDetail } from '../mappers/admin-orders-ui.mapper'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import { AdminOrderCustomerInfoCard } from './admin-order-customer-info-card'
import { AdminOrderDetailPageBody } from './admin-order-detail-page-body'
import { AdminOrderFinancialSummary } from './admin-order-financial-summary'
import { AdminOrderPaymentCard } from './admin-order-payment-card'
import { AdminOrderQuickActionsCard } from './admin-order-quick-actions-card'
import type { AdminOrderDetailState } from './use-admin-order-detail'
import type { AdminOrderDetailTab } from './use-admin-order-detail'

type AdminOrderDetailBodyProps = {
  detail: AdminOrderDetailState
  variant: 'modal' | 'page'
  initialTab?: AdminOrderDetailTab
  contentEnabled: boolean
}

export function AdminOrderDetailBody({
  detail,
  variant,
  initialTab = 'details',
  contentEnabled,
}: AdminOrderDetailBodyProps) {
  const [activeTab, setActiveTab] = useState<AdminOrderDetailTab>(initialTab)
  const { order, bffOrder } = detail
  if (!order || !bffOrder) return null

  if (variant === 'page') {
    return <AdminOrderDetailPageBody detail={detail} contentEnabled={contentEnabled} />
  }

  const itemsPanel = <ItemsPanel order={order} />
  const timelinePanel = <OrderTimeline events={order.timeline} />
  const productionPanel = (
    <ProductionSheetPreview
      sheet={detail.productionSheet}
      isLoading={detail.productionSheetQuery.isLoading}
      isError={detail.productionSheetQuery.isError}
      onRetry={() => void detail.productionSheetQuery.refetch()}
    />
  )

  const detailsPanel = (
    <ModalDetailsPanel
      detail={detail}
      order={order}
      bffOrder={bffOrder}
      contentEnabled={contentEnabled}
      onOpenProductionTab={() => setActiveTab('production')}
    />
  )

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as AdminOrderDetailTab)}>
      <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent">
        <TabsTrigger value="details">Detalles</TabsTrigger>
        <TabsTrigger value="items">Items ({order.items.length})</TabsTrigger>
        <TabsTrigger value="timeline">Timeline</TabsTrigger>
        <TabsTrigger value="production">Ficha producción</TabsTrigger>
      </TabsList>
      <ScrollArea className="max-h-[min(70vh,720px)]">
        <TabsContent value="details" className="mt-0 space-y-6 p-6">
          {detailsPanel}
        </TabsContent>
        <TabsContent value="items" className="mt-0 space-y-4 p-6">
          {itemsPanel}
        </TabsContent>
        <TabsContent value="timeline" className="mt-0 p-6">
          {timelinePanel}
        </TabsContent>
        <TabsContent value="production" className="mt-0 p-6">
          {productionPanel}
        </TabsContent>
      </ScrollArea>
    </Tabs>
  )
}

type ModalDetailsPanelProps = {
  detail: AdminOrderDetailState
  order: NonNullable<ReturnType<typeof mapAdminOrderToDetail>>
  bffOrder: AdminOrder
  contentEnabled: boolean
  onOpenProductionTab: () => void
}

function ModalDetailsPanel({
  detail,
  order,
  bffOrder,
  contentEnabled,
  onOpenProductionTab,
}: ModalDetailsPanelProps) {
  return (
    <div className="space-y-6">
      <AdminOrderCustomerInfoCard order={order} />
      <div className="grid gap-4 sm:grid-cols-2">
        <AdminOrderPaymentCard
          order={order}
          onCopyReference={(value) => void detail.copyToClipboard(value)}
        />
        <AdminOrderFinancialSummary order={order} />
      </div>
      <AdminShipmentCard
        orderNumber={order.orderNumber}
        order={bffOrder}
        enabled={contentEnabled}
        onSuccessMessage={(msg) => {
          detail.setActionMessage(msg)
          detail.setActionError(null)
        }}
        onErrorMessage={(msg) => {
          detail.setActionError(msg)
          detail.setActionMessage(null)
        }}
      />
      <AdminOrderQuickActionsCard
        order={order}
        detail={detail}
        onOpenProduction={onOpenProductionTab}
        embedded
      />
    </div>
  )
}

function ItemsPanel({ order }: { order: NonNullable<ReturnType<typeof mapAdminOrderToDetail>> }) {
  return (
    <>
      {order.items.map((item) => (
        <div key={item.id} className="rounded-lg border border-border p-4">
          <div className="flex justify-between gap-4">
            <div>
              <p className="font-sans font-medium">{item.productName}</p>
              <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                <Badge variant="outline">Talla: {item.size}</Badge>
                <Badge variant="secondary">x{item.quantity}</Badge>
                {item.hasCustomization ? <Badge>Personalizado</Badge> : null}
              </div>
            </div>
            <p className="font-sans font-semibold">{formatCurrencyMXN(item.totalPrice)}</p>
          </div>
          {item.hasCustomization ? <CustomizationSnapshot item={item} className="mt-4" /> : null}
        </div>
      ))}
    </>
  )
}
