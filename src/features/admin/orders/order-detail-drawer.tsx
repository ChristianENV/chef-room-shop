'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
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

import type { AdminOrder } from './types'
import { useAdminOrderByNumberQuery } from './api/use-admin-order-by-number-query'
import { useAdminOrderProductionSheetQuery } from './api/use-admin-order-production-sheet-query'
import { useMoveAdminOrderToProductionMutation } from './api/use-move-admin-order-to-production-mutation'
import { useMarkAdminOrderReadyToShipMutation } from './api/use-mark-admin-order-ready-to-ship-mutation'
import { useCancelAdminOrderMutation } from './api/use-cancel-admin-order-mutation'
import { AdminShipmentCard } from '@/src/features/admin/shipping/components/admin-shipment-card'
import { useAddAdminOrderNoteMutation } from './api/use-add-admin-order-note-mutation'
import { AdminOrderDetailSkeleton } from './components/admin-orders-loading'
import { AdminOrdersError } from './components/admin-orders-error'
import { CustomizationSnapshot } from './customization-snapshot'
import { OrderTimeline } from './order-timeline'
import { ProductionSheetPreview } from './production-sheet-preview'
import {
  formatDateOnly,
  mapAdminOrderToDetail,
  mapAdminOrderToProductionSheet,
  mapStatusToBadgeVariant,
} from './mappers/admin-orders-ui.mapper'

interface OrderDetailDrawerProps {
  orderNumber: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
  initialTab?: 'details' | 'items' | 'timeline' | 'production'
  onOpenCancelDialog?: boolean
}

export function OrderDetailDrawer({
  orderNumber,
  open,
  onOpenChange,
  initialTab = 'details',
  onOpenCancelDialog,
}: OrderDetailDrawerProps) {
  const [cancelDialogDismissed, setCancelDialogDismissed] = useState(false)
  const [cancelDialogExplicit, setCancelDialogExplicit] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const detailQuery = useAdminOrderByNumberQuery(orderNumber ?? '', open && !!orderNumber)
  const productionSheetQuery = useAdminOrderProductionSheetQuery(
    orderNumber ?? '',
    open && !!orderNumber,
  )

  const moveToProduction = useMoveAdminOrderToProductionMutation()
  const markReady = useMarkAdminOrderReadyToShipMutation()
  const cancelOrder = useCancelAdminOrderMutation()
  const addNote = useAddAdminOrderNoteMutation()

  const bffOrder = detailQuery.data
  const order = bffOrder ? mapAdminOrderToDetail(bffOrder) : null
  const productionSheet = productionSheetQuery.data
    ? mapAdminOrderToProductionSheet(productionSheetQuery.data)
    : undefined

  const isMutating =
    moveToProduction.isPending ||
    markReady.isPending ||
    cancelOrder.isPending ||
    addNote.isPending

  const cancelDialogOpen =
    open && !cancelDialogDismissed && (onOpenCancelDialog || cancelDialogExplicit)

  const handleMutationError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'No pudimos completar la acción.'
    setActionError(message)
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin-orders]', error)
    }
  }

  const handleMoveToProduction = async () => {
    if (!orderNumber) return
    setActionError(null)
    try {
      await moveToProduction.mutateAsync(orderNumber)
      setActionMessage('Pedido enviado a producción.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleMarkReady = async () => {
    if (!orderNumber) return
    setActionError(null)
    try {
      await markReady.mutateAsync(orderNumber)
      setActionMessage('Pedido marcado como listo para envío.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleCancel = async () => {
    if (!orderNumber) return
    setActionError(null)
    try {
      await cancelOrder.mutateAsync({
        orderNumber,
        reason: cancelReason.trim() || undefined,
      })
      setCancelDialogDismissed(true)
      setCancelDialogExplicit(false)
      setCancelReason('')
      setActionMessage('Orden cancelada. No se realizó reembolso automático.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleAddNote = async () => {
    if (!orderNumber || !internalNote.trim()) return
    setActionError(null)
    try {
      await addNote.mutateAsync({ orderNumber, note: internalNote.trim() })
      setInternalNote('')
      setActionMessage('Nota agregada correctamente.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
  }

  const paymentStatusColor: Record<string, string> = {
    pendiente: 'text-warning',
    completado: 'text-success',
    fallido: 'text-destructive',
    reembolsado: 'text-muted-foreground',
  }

  return (
    <>
      <Sheet
        open={open}
        onOpenChange={(next) => {
          if (!next) {
            setCancelDialogDismissed(false)
            setCancelDialogExplicit(false)
            setActionMessage(null)
            setActionError(null)
          }
          onOpenChange(next)
        }}
      >
        <SheetContent className="w-full p-0 sm:max-w-2xl" key={orderNumber ?? 'closed'}>
          {!order && (
            <SheetHeader className="sr-only">
              <SheetTitle>
                {orderNumber ? `Pedido ${orderNumber}` : 'Detalle de pedido'}
              </SheetTitle>
            </SheetHeader>
          )}
          {detailQuery.isLoading ? (
            <AdminOrderDetailSkeleton />
          ) : detailQuery.isError ? (
            <div className="p-6">
              <AdminOrdersError
                message="No pudimos cargar el detalle de la orden."
                onRetry={() => void detailQuery.refetch()}
              />
            </div>
          ) : !order ? (
            <div className="p-6">
              <p className="font-serif text-sm text-muted-foreground">Orden no encontrada.</p>
            </div>
          ) : (
            <>
              <SheetHeader className="border-b border-border px-6 py-4">
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <SheetTitle className="font-sans text-xl">{order.orderNumber}</SheetTitle>
                    <p className="mt-1 font-serif text-sm text-muted-foreground">
                      Creado el {formatDateOnly(order.createdAt)}
                    </p>
                  </div>
                  <Badge variant={mapStatusToBadgeVariant(bffOrder?.status ?? order.status)}>
                    {order.statusLabel}
                  </Badge>
                </div>
                {actionMessage ? (
                  <p className="mt-2 font-serif text-sm text-success">{actionMessage}</p>
                ) : null}
                {actionError ? (
                  <p className="mt-2 font-serif text-sm text-destructive">{actionError}</p>
                ) : null}
              </SheetHeader>

              <OrderDetailDrawerTabs
                key={`${orderNumber}-${initialTab}`}
                initialTab={initialTab}
                order={order}
                bffOrder={bffOrder!}
                drawerOpen={open}
                paymentStatusColor={paymentStatusColor}
                isMutating={isMutating}
                internalNote={internalNote}
                onInternalNoteChange={setInternalNote}
                onAddNote={() => void handleAddNote()}
                onMoveToProduction={() => void handleMoveToProduction()}
                onMarkReady={() => void handleMarkReady()}
                onOpenCancel={() => {
                  setCancelDialogDismissed(false)
                  setCancelDialogExplicit(true)
                }}
                onCopy={copyToClipboard}
                onShippingSuccess={setActionMessage}
                onShippingError={setActionError}
                productionSheet={productionSheet}
                productionSheetLoading={productionSheetQuery.isLoading}
                productionSheetError={productionSheetQuery.isError}
                onProductionSheetRetry={() => void productionSheetQuery.refetch()}
              />
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog
        open={cancelDialogOpen}
        onOpenChange={(next) => {
          if (!next) {
            setCancelDialogDismissed(true)
            setCancelDialogExplicit(false)
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Cancelar orden</DialogTitle>
            <DialogDescription className="font-serif">
              Esta acción no realiza reembolso automático. Indica el motivo si aplica.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            value={cancelReason}
            onChange={(e) => setCancelReason(e.target.value)}
            placeholder="Motivo de cancelación (opcional)"
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setCancelDialogDismissed(true)}>
              Volver
            </Button>
            <Button
              variant="destructive"
              onClick={() => void handleCancel()}
              disabled={isMutating}
            >
              Confirmar cancelación
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

type OrderDetailDrawerTabsProps = {
  initialTab: 'details' | 'items' | 'timeline' | 'production'
  order: NonNullable<ReturnType<typeof mapAdminOrderToDetail>>
  bffOrder: AdminOrder
  drawerOpen: boolean
  paymentStatusColor: Record<string, string>
  isMutating: boolean
  internalNote: string
  onInternalNoteChange: (value: string) => void
  onAddNote: () => void
  onMoveToProduction: () => void
  onMarkReady: () => void
  onOpenCancel: () => void
  onCopy: (text: string) => void
  onShippingSuccess: (message: string | null) => void
  onShippingError: (message: string | null) => void
  productionSheet: ReturnType<typeof mapAdminOrderToProductionSheet> | undefined
  productionSheetLoading: boolean
  productionSheetError: boolean
  onProductionSheetRetry: () => void
}

function OrderDetailDrawerTabs({
  initialTab,
  order,
  bffOrder,
  drawerOpen,
  paymentStatusColor,
  isMutating,
  internalNote,
  onInternalNoteChange,
  onAddNote,
  onMoveToProduction,
  onMarkReady,
  onOpenCancel,
  onCopy,
  onShippingSuccess,
  onShippingError,
  productionSheet,
  productionSheetLoading,
  productionSheetError,
  onProductionSheetRetry,
}: OrderDetailDrawerTabsProps) {
  const [activeTab, setActiveTab] = useState(initialTab)

  return (
    <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as typeof activeTab)}>
                <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
                  <TabsTrigger value="details">Detalles</TabsTrigger>
                  <TabsTrigger value="items">Items ({order.items.length})</TabsTrigger>
                  <TabsTrigger value="timeline">Timeline</TabsTrigger>
                  <TabsTrigger value="production">Ficha producción</TabsTrigger>
                </TabsList>

                <ScrollArea className="h-[calc(100vh-200px)]">
                  <TabsContent value="details" className="mt-0 space-y-6 p-6">
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
                                onClick={() => onCopy(order.paymentReference!)}
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
                      enabled={drawerOpen}
                      onSuccessMessage={(msg) => {
                        onShippingSuccess(msg)
                        onShippingError(null)
                      }}
                      onErrorMessage={(msg) => {
                        onShippingError(msg)
                        onShippingSuccess(null)
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
                        onChange={(e) => onInternalNoteChange(e.target.value)}
                        placeholder="Nota para el equipo de operaciones..."
                        rows={3}
                      />
                      <Button
                        size="sm"
                        className="mt-2"
                        disabled={!internalNote.trim() || isMutating}
                        onClick={onAddNote}
                      >
                        Guardar nota
                      </Button>
                    </div>

                    <div>
                      <h3 className="mb-3 font-sans text-sm font-semibold">Acciones</h3>
                      <div className="flex flex-wrap gap-2">
                        {order.canMoveToProduction ? (
                          <Button
                            size="sm"
                            disabled={isMutating}
                            onClick={onMoveToProduction}
                          >
                            <Factory className="mr-2 h-4 w-4" />
                            Mover a producción
                          </Button>
                        ) : null}
                        {order.canMarkReadyToShip ? (
                          <Button
                            size="sm"
                            disabled={isMutating}
                            onClick={onMarkReady}
                          >
                            <Package className="mr-2 h-4 w-4" />
                            Lista para envío
                          </Button>
                        ) : null}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => setActiveTab('production')}
                        >
                          <FileText className="mr-2 h-4 w-4" />
                          Ficha de producción
                        </Button>
                        {order.canCancel ? (
                          <Button
                            variant="destructive"
                            size="sm"
                            disabled={isMutating}
                            onClick={onOpenCancel}
                          >
                            <XCircle className="mr-2 h-4 w-4" />
                            Cancelar
                          </Button>
                        ) : null}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="items" className="mt-0 space-y-4 p-6">
                    {order.items.map((item) => (
                      <div key={item.id} className="rounded-lg border border-border p-4">
                        <div className="flex justify-between gap-4">
                          <div>
                            <p className="font-sans font-medium">{item.productName}</p>
                            <p className="font-mono text-xs text-muted-foreground">{item.sku}</p>
                            <div className="mt-2 flex flex-wrap gap-2">
                              <Badge variant="outline">Talla: {item.size}</Badge>
                              <Badge variant="secondary">x{item.quantity}</Badge>
                              {item.hasCustomization ? (
                                <Badge>Personalizado</Badge>
                              ) : null}
                            </div>
                          </div>
                          <p className="font-sans font-semibold">
                            {formatCurrencyMXN(item.totalPrice)}
                          </p>
                        </div>
                        {item.hasCustomization ? (
                          <CustomizationSnapshot item={item} className="mt-4" />
                        ) : null}
                      </div>
                    ))}
                  </TabsContent>

                  <TabsContent value="timeline" className="mt-0 p-6">
                    <OrderTimeline events={order.timeline} />
                  </TabsContent>

                  <TabsContent value="production" className="mt-0 p-6">
                    <ProductionSheetPreview
                      sheet={productionSheet}
                      isLoading={productionSheetLoading}
                      isError={productionSheetError}
                      onRetry={onProductionSheetRetry}
                    />
                  </TabsContent>
                </ScrollArea>
    </Tabs>
  )
}
