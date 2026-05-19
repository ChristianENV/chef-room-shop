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
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  Truck,
  XCircle,
  FileText,
  ExternalLink,
  Copy,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { CustomizationSnapshot } from './customization-snapshot'
import { OrderTimeline } from './order-timeline'
import { ProductionSheetPreview } from './production-sheet-preview'
import type { AdminOrder, AdminOrderStatus, AdminPaymentStatus } from '@/lib/types'

interface OrderDetailDrawerProps {
  order: AdminOrder | null
  open: boolean
  onOpenChange: (open: boolean) => void
  onStatusChange: (status: AdminOrderStatus) => void
  onAddTracking: (trackingNumber: string, carrier: string) => void
  onCancel: () => void
}

const orderStatusConfig: Record<AdminOrderStatus, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  'pendiente-pago': { label: 'Pendiente pago', variant: 'outline' },
  'pagado': { label: 'Pagado', variant: 'default' },
  'en-produccion': { label: 'En produccion', variant: 'secondary' },
  'listo-envio': { label: 'Listo envio', variant: 'default' },
  'enviado': { label: 'Enviado', variant: 'secondary' },
  'entregado': { label: 'Entregado', variant: 'default' },
  'cancelado': { label: 'Cancelado', variant: 'destructive' },
}

const paymentStatusConfig: Record<AdminPaymentStatus, { label: string; color: string }> = {
  'pendiente': { label: 'Pendiente', color: 'text-warning' },
  'completado': { label: 'Completado', color: 'text-success' },
  'fallido': { label: 'Fallido', color: 'text-destructive' },
  'reembolsado': { label: 'Reembolsado', color: 'text-muted-foreground' },
  'parcial': { label: 'Parcial', color: 'text-warning' },
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function OrderDetailDrawer({
  order,
  open,
  onOpenChange,
  onStatusChange,
  onAddTracking,
  onCancel,
}: OrderDetailDrawerProps) {
  const [trackingDialogOpen, setTrackingDialogOpen] = useState(false)
  const [trackingNumber, setTrackingNumber] = useState('')
  const [carrier, setCarrier] = useState('fedex')
  const [productionSheetItem, setProductionSheetItem] = useState<string | null>(null)

  if (!order) return null

  const orderStatus = orderStatusConfig[order.status]
  const paymentStatus = paymentStatusConfig[order.paymentStatus]

  const handleAddTracking = () => {
    if (trackingNumber.trim()) {
      onAddTracking(trackingNumber, carrier)
      setTrackingDialogOpen(false)
      setTrackingNumber('')
    }
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  return (
    <>
      <Sheet open={open} onOpenChange={onOpenChange}>
        <SheetContent className="w-full sm:max-w-2xl p-0">
          <SheetHeader className="px-6 py-4 border-b border-border">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="font-sans text-xl">
                  {order.orderNumber}
                </SheetTitle>
                <p className="mt-1 font-serif text-sm text-muted-foreground">
                  Creado el {formatDate(order.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant={orderStatus.variant}>{orderStatus.label}</Badge>
              </div>
            </div>
          </SheetHeader>

          <Tabs defaultValue="details" className="flex-1">
            <TabsList className="w-full justify-start rounded-none border-b border-border bg-transparent px-6">
              <TabsTrigger value="details" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Detalles
              </TabsTrigger>
              <TabsTrigger value="items" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Items ({order.items.length})
              </TabsTrigger>
              <TabsTrigger value="timeline" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                Timeline
              </TabsTrigger>
              {productionSheetItem && (
                <TabsTrigger value="production" className="rounded-none border-b-2 border-transparent data-[state=active]:border-primary">
                  Hoja Produccion
                </TabsTrigger>
              )}
            </TabsList>

            <ScrollArea className="h-[calc(100vh-200px)]">
              {/* Details Tab */}
              <TabsContent value="details" className="mt-0 p-6 space-y-6">
                {/* Customer Info */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                    <User className="h-4 w-4" />
                    Cliente
                  </h3>
                  <div className="rounded-lg border border-border p-4">
                    <p className="font-sans font-medium text-foreground">{order.customer.name}</p>
                    <p className="mt-1 font-serif text-sm text-muted-foreground">{order.customer.email}</p>
                    <p className="font-serif text-sm text-muted-foreground">{order.customer.phone}</p>
                    <div className="mt-2 flex items-center gap-4 text-xs text-muted-foreground">
                      <span>{order.customer.totalOrders} pedidos</span>
                      <span>Cliente desde {formatDate(order.customer.customerSince)}</span>
                    </div>
                  </div>
                </div>

                {/* Addresses */}
                <div className="grid gap-4 md:grid-cols-2">
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                      <MapPin className="h-4 w-4" />
                      Direccion de envio
                    </h3>
                    <div className="rounded-lg border border-border p-4">
                      <p className="font-sans font-medium text-foreground">
                        {order.shippingAddress.firstName} {order.shippingAddress.lastName}
                      </p>
                      <p className="mt-1 font-serif text-sm text-muted-foreground">
                        {order.shippingAddress.street} {order.shippingAddress.exteriorNumber}
                        {order.shippingAddress.interiorNumber && `, ${order.shippingAddress.interiorNumber}`}
                      </p>
                      <p className="font-serif text-sm text-muted-foreground">
                        {order.shippingAddress.neighborhood}, {order.shippingAddress.postalCode}
                      </p>
                      <p className="font-serif text-sm text-muted-foreground">
                        {order.shippingAddress.city}, {order.shippingAddress.state}
                      </p>
                      <p className="mt-1 font-serif text-sm text-muted-foreground">
                        {order.shippingAddress.phone}
                      </p>
                    </div>
                  </div>

                  {order.billingAddress && (
                    <div>
                      <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                        <CreditCard className="h-4 w-4" />
                        Direccion de facturacion
                      </h3>
                      <div className="rounded-lg border border-border p-4">
                        <p className="font-sans font-medium text-foreground">
                          {order.billingAddress.firstName} {order.billingAddress.lastName}
                        </p>
                        <p className="mt-1 font-serif text-sm text-muted-foreground">
                          {order.billingAddress.street} {order.billingAddress.exteriorNumber}
                        </p>
                        <p className="font-serif text-sm text-muted-foreground">
                          {order.billingAddress.city}, {order.billingAddress.state}
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Payment Info */}
                <div>
                  <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                    <CreditCard className="h-4 w-4" />
                    Informacion de pago
                  </h3>
                  <div className="rounded-lg border border-border p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-muted-foreground">Estado</span>
                      <span className={cn('font-sans font-medium', paymentStatus.color)}>
                        {paymentStatus.label}
                      </span>
                    </div>
                    {order.paymentMethod && (
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm text-muted-foreground">Metodo</span>
                        <span className="font-sans text-sm text-foreground capitalize">
                          {order.paymentMethod}
                        </span>
                      </div>
                    )}
                    {order.paymentReference && (
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm text-muted-foreground">Referencia</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs text-foreground">
                            {order.paymentReference}
                          </span>
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
                    )}
                  </div>
                </div>

                {/* Tracking Info */}
                {order.trackingNumber && (
                  <div>
                    <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold text-foreground">
                      <Truck className="h-4 w-4" />
                      Informacion de envio
                    </h3>
                    <div className="rounded-lg border border-border p-4">
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm text-muted-foreground">Numero de guia</span>
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm text-foreground">{order.trackingNumber}</span>
                          {order.trackingUrl && (
                            <Button variant="ghost" size="icon" className="h-6 w-6" asChild>
                              <a href={order.trackingUrl} target="_blank" rel="noopener noreferrer">
                                <ExternalLink className="h-3 w-3" />
                              </a>
                            </Button>
                          )}
                        </div>
                      </div>
                      {order.estimatedDelivery && (
                        <div className="mt-2 flex items-center justify-between">
                          <span className="font-serif text-sm text-muted-foreground">Entrega estimada</span>
                          <span className="font-sans text-sm text-foreground">
                            {formatDate(order.estimatedDelivery)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Price Breakdown */}
                <div>
                  <h3 className="mb-3 font-sans text-sm font-semibold text-foreground">
                    Desglose de precio
                  </h3>
                  <div className="rounded-lg border border-border p-4 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-muted-foreground">Subtotal</span>
                      <span className="font-sans text-sm text-foreground">{formatCurrency(order.subtotal)}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-serif text-sm text-muted-foreground">Envio</span>
                      <span className="font-sans text-sm text-foreground">
                        {order.shipping === 0 ? 'Gratis' : formatCurrency(order.shipping)}
                      </span>
                    </div>
                    {order.discount > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm text-muted-foreground">Descuento</span>
                        <span className="font-sans text-sm text-success">-{formatCurrency(order.discount)}</span>
                      </div>
                    )}
                    {order.tax > 0 && (
                      <div className="flex items-center justify-between">
                        <span className="font-serif text-sm text-muted-foreground">IVA</span>
                        <span className="font-sans text-sm text-foreground">{formatCurrency(order.tax)}</span>
                      </div>
                    )}
                    <Separator />
                    <div className="flex items-center justify-between">
                      <span className="font-sans font-semibold text-foreground">Total</span>
                      <span className="font-sans text-lg font-bold text-foreground">{formatCurrency(order.total)}</span>
                    </div>
                  </div>
                </div>

                {/* Admin Actions */}
                <div>
                  <h3 className="mb-3 font-sans text-sm font-semibold text-foreground">
                    Acciones
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {order.paymentStatus === 'pendiente' && (
                      <Button size="sm" onClick={() => onStatusChange('pagado')}>
                        <CreditCard className="mr-2 h-4 w-4" />
                        Marcar como pagado
                      </Button>
                    )}
                    {order.status === 'pagado' && (
                      <Button size="sm" onClick={() => onStatusChange('en-produccion')}>
                        <Factory className="mr-2 h-4 w-4" />
                        Mover a produccion
                      </Button>
                    )}
                    {order.status === 'en-produccion' && (
                      <Button size="sm" onClick={() => onStatusChange('listo-envio')}>
                        <Package className="mr-2 h-4 w-4" />
                        Marcar listo para envio
                      </Button>
                    )}
                    {order.status === 'listo-envio' && (
                      <Button size="sm" onClick={() => setTrackingDialogOpen(true)}>
                        <Truck className="mr-2 h-4 w-4" />
                        Agregar numero de guia
                      </Button>
                    )}
                    {order.status !== 'cancelado' && order.status !== 'entregado' && (
                      <Button variant="destructive" size="sm" onClick={onCancel}>
                        <XCircle className="mr-2 h-4 w-4" />
                        Cancelar orden
                      </Button>
                    )}
                  </div>
                </div>
              </TabsContent>

              {/* Items Tab */}
              <TabsContent value="items" className="mt-0 p-6 space-y-4">
                {order.items.map((item) => (
                  <div key={item.id} className="rounded-lg border border-border p-4">
                    <div className="flex gap-4">
                      <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
                        <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                          IMG
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-sans font-medium text-foreground">{item.productName}</p>
                            <p className="mt-0.5 font-mono text-xs text-muted-foreground">{item.sku}</p>
                          </div>
                          <p className="font-sans font-semibold text-foreground">
                            {formatCurrency(item.totalPrice)}
                          </p>
                        </div>
                        <div className="mt-2 flex flex-wrap items-center gap-2">
                          <Badge variant="outline">Talla: {item.size}</Badge>
                          <div className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5">
                            <div
                              className="h-3 w-3 rounded-full border border-border"
                              style={{ backgroundColor: item.colorHex }}
                            />
                            <span className="text-xs">{item.color}</span>
                          </div>
                          <Badge variant="secondary">x{item.quantity}</Badge>
                          <span className="font-serif text-xs text-muted-foreground">
                            @ {formatCurrency(item.unitPrice)} c/u
                          </span>
                        </div>
                        {item.hasCustomization && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="mt-3"
                            onClick={() => setProductionSheetItem(item.id)}
                          >
                            <FileText className="mr-2 h-4 w-4" />
                            Ver hoja de produccion
                          </Button>
                        )}
                      </div>
                    </div>

                    {/* Customization Snapshot */}
                    {item.hasCustomization && (
                      <CustomizationSnapshot item={item} className="mt-4" />
                    )}
                  </div>
                ))}
              </TabsContent>

              {/* Timeline Tab */}
              <TabsContent value="timeline" className="mt-0 p-6">
                <OrderTimeline events={order.timeline} />
              </TabsContent>

              {/* Production Sheet Tab */}
              {productionSheetItem && (
                <TabsContent value="production" className="mt-0 p-6">
                  {order.items
                    .filter((item) => item.id === productionSheetItem)
                    .map((item) => (
                      <ProductionSheetPreview
                        key={item.id}
                        order={order}
                        item={item}
                        onPrint={() => window.print()}
                      />
                    ))}
                </TabsContent>
              )}
            </ScrollArea>
          </Tabs>
        </SheetContent>
      </Sheet>

      {/* Add Tracking Dialog */}
      <Dialog open={trackingDialogOpen} onOpenChange={setTrackingDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-sans">Agregar numero de guia</DialogTitle>
            <DialogDescription className="font-serif">
              Ingresa el numero de guia y selecciona la paqueteria.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="tracking" className="font-sans">Numero de guia</Label>
              <Input
                id="tracking"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Ej: FDX123456789"
                className="font-mono"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="carrier" className="font-sans">Paqueteria</Label>
              <Select value={carrier} onValueChange={setCarrier}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fedex">FedEx</SelectItem>
                  <SelectItem value="dhl">DHL</SelectItem>
                  <SelectItem value="estafeta">Estafeta</SelectItem>
                  <SelectItem value="ups">UPS</SelectItem>
                  <SelectItem value="redpack">Redpack</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTrackingDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddTracking} disabled={!trackingNumber.trim()}>
              Guardar y enviar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
