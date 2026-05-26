'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  User,
  MapPin,
  CreditCard,
  Package,
  Factory,
  XCircle,
  FileText,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import type { AdminOrder } from '../types'
import { AdminShipmentCard } from '@/src/features/admin/shipping/components/admin-shipment-card'
import { CustomizationSnapshot } from '../customization-snapshot'
import { OrderTimeline } from '../order-timeline'
import { ProductionSheetPreview } from '../production-sheet-preview'
import { mapAdminOrderToDetail } from '../mappers/admin-orders-ui.mapper'
import type { AdminOrderDetailState } from './use-admin-order-detail'
import type { AdminOrderDetailTab } from './use-admin-order-detail'

const paymentStatusColor: Record<string, string> = {
  pendiente: 'text-warning',
  completado: 'text-success',
  fallido: 'text-destructive',
  reembolsado: 'text-muted-foreground',
}

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

  const detailsPanel = (
    <DetailsPanel
      detail={detail}
      order={order}
      bffOrder={bffOrder}
      contentEnabled={contentEnabled}
      onOpenProductionTab={() => setActiveTab('production')}
    />
  )

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

  if (variant === 'page') {
    return (
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold">
              <Package className="h-4 w-4" />
              Productos ({order.items.length})
            </h3>
            {itemsPanel}
          </section>
          <section className="rounded-lg border border-border bg-card p-6">
            <h3 className="mb-4 font-sans text-sm font-semibold">Timeline</h3>
            {timelinePanel}
          </section>
          <section
            id="admin-order-production"
            className="rounded-lg border border-border bg-card p-6"
          >
            <h3 className="mb-4 flex items-center gap-2 font-sans text-sm font-semibold">
              <FileText className="h-4 w-4" />
              Ficha de producción
            </h3>
            {productionPanel}
          </section>
        </div>
        <div className="space-y-6 lg:sticky lg:top-6 lg:self-start">
          <section className="rounded-lg border border-border bg-card p-6">{detailsPanel}</section>
        </div>
      </div>
    )
  }

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

type DetailsPanelProps = {
  detail: AdminOrderDetailState
  order: NonNullable<ReturnType<typeof mapAdminOrderToDetail>>
  bffOrder: AdminOrder
  contentEnabled: boolean
  onOpenProductionTab?: () => void
}

function DetailsPanel({
  detail,
  order,
  bffOrder,
  contentEnabled,
  onOpenProductionTab,
}: DetailsPanelProps) {
  const {
    isMutating,
    internalNote,
    setInternalNote,
    handleAddNote,
    handleMoveToProduction,
    handleMarkReady,
    openCancelDialog,
    copyToClipboard,
    setActionMessage,
    setActionError,
  } = detail

  return (
    <>
      <div>
        <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
          <User className="h-4 w-4" />
          Cliente
        </h3>
        <div className="rounded-lg border border-border p-4">
          <p className="font-sans font-medium">{order.customer.name}</p>
          <p className="mt-1 font-serif text-sm text-muted-foreground">{order.customer.email}</p>
          <p className="font-serif text-sm text-muted-foreground">{order.customer.phone}</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
            <MapPin className="h-4 w-4" />
            Dirección de envío
          </h3>
          <div className="rounded-lg border border-border p-4 font-serif text-sm text-muted-foreground">
            <p className="font-sans font-medium text-foreground">
              {order.shippingAddress.firstName} {order.shippingAddress.lastName}
            </p>
            <p className="mt-1">
              {order.shippingAddress.street}
              {order.shippingAddress.interiorNumber
                ? `, ${order.shippingAddress.interiorNumber}`
                : ''}
            </p>
            <p>
              {order.shippingAddress.city}, {order.shippingAddress.state}{' '}
              {order.shippingAddress.postalCode}
            </p>
            <p>{order.shippingAddress.country}</p>
          </div>
        </div>
        {order.billingAddress ? (
          <div>
            <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
              <CreditCard className="h-4 w-4" />
              Facturación
            </h3>
            <div className="rounded-lg border border-border p-4 font-serif text-sm text-muted-foreground">
              <p className="font-sans font-medium text-foreground">
                {order.billingAddress.firstName} {order.billingAddress.lastName}
              </p>
              <p className="mt-1">{order.billingAddress.street}</p>
              <p>
                {order.billingAddress.city}, {order.billingAddress.state}
              </p>
            </div>
          </div>
        ) : null}
      </div>

      <div>
        <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
          <CreditCard className="h-4 w-4" />
          Pago
        </h3>
        <div className="space-y-3 rounded-lg border border-border p-4">
          <div className="flex justify-between">
            <span className="font-serif text-sm text-muted-foreground">Estado</span>
            <span
              className={cn(
                'font-sans font-medium',
                paymentStatusColor[order.paymentStatus],
              )}
            >
              {order.paymentStatusLabel}
            </span>
          </div>
          {order.paymentMethod ? (
            <div className="flex justify-between">
              <span className="font-serif text-sm text-muted-foreground">Método</span>
              <span className="font-sans text-sm">{order.paymentMethod}</span>
            </div>
          ) : null}
          {order.paymentReference ? (
            <div className="flex justify-between gap-2">
              <span className="font-serif text-sm text-muted-foreground">Referencia</span>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs">{order.paymentReference}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6"
                  onClick={() => copyToClipboard(order.paymentReference!)}
                >
                  <Copy className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : null}
        </div>
      </div>

      <AdminShipmentCard
        orderNumber={order.orderNumber}
        order={bffOrder}
        enabled={contentEnabled}
        onSuccessMessage={(msg) => {
          setActionMessage(msg)
          setActionError(null)
        }}
        onErrorMessage={(msg) => {
          setActionError(msg)
          setActionMessage(null)
        }}
      />

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold">Desglose</h3>
        <div className="space-y-2 rounded-lg border border-border p-4">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal</span>
            <span>{formatCurrencyMXN(order.subtotal)}</span>
          </div>
          {order.customizationTotal > 0 ? (
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Personalización</span>
              <span>{formatCurrencyMXN(order.customizationTotal)}</span>
            </div>
          ) : null}
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Envío</span>
            <span>
              {order.shipping === 0 ? 'Gratis' : formatCurrencyMXN(order.shipping)}
            </span>
          </div>
          {order.discount > 0 ? (
            <div className="flex justify-between text-sm text-success">
              <span>Descuento</span>
              <span>-{formatCurrencyMXN(order.discount)}</span>
            </div>
          ) : null}
          <Separator />
          <div className="flex justify-between font-semibold">
            <span>Total</span>
            <span>{formatCurrencyMXN(order.total)}</span>
          </div>
        </div>
      </div>

      {order.notes ? (
        <div className="rounded-lg border border-border bg-muted/30 p-4">
          <p className="font-sans text-sm font-semibold">Notas internas</p>
          <p className="mt-2 whitespace-pre-wrap font-serif text-sm text-muted-foreground">
            {order.notes}
          </p>
        </div>
      ) : null}

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold">Agregar nota</h3>
        <Textarea
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Nota para el equipo de operaciones..."
          rows={3}
        />
        <Button
          size="sm"
          className="mt-2"
          disabled={!internalNote.trim() || isMutating}
          onClick={() => void handleAddNote()}
        >
          Guardar nota
        </Button>
      </div>

      <div>
        <h3 className="mb-3 font-sans text-sm font-semibold">Acciones rápidas</h3>
        <div className="flex flex-wrap gap-2">
          {order.canMoveToProduction ? (
            <Button size="sm" disabled={isMutating} onClick={() => void handleMoveToProduction()}>
              <Factory className="mr-2 h-4 w-4" />
              Mover a producción
            </Button>
          ) : null}
          {order.canMarkReadyToShip ? (
            <Button size="sm" disabled={isMutating} onClick={() => void handleMarkReady()}>
              <Package className="mr-2 h-4 w-4" />
              Lista para envío
            </Button>
          ) : null}
          {onOpenProductionTab ? (
            <Button size="sm" variant="outline" onClick={onOpenProductionTab}>
              <FileText className="mr-2 h-4 w-4" />
              Ficha de producción
            </Button>
          ) : null}
          {order.canCancel ? (
            <Button
              variant="destructive"
              size="sm"
              disabled={isMutating}
              onClick={openCancelDialog}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Cancelar
            </Button>
          ) : null}
        </div>
      </div>
    </>
  )
}

function ItemsPanel({
  order,
}: {
  order: NonNullable<ReturnType<typeof mapAdminOrderToDetail>>
}) {
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
          {item.hasCustomization ? (
            <CustomizationSnapshot item={item} className="mt-4" />
          ) : null}
        </div>
      ))}
    </>
  )
}
