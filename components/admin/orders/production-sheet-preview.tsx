'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Printer, MapPin, Palette } from 'lucide-react'
import type { AdminOrder, AdminOrderItem } from '@/lib/types'

interface ProductionSheetPreviewProps {
  order: AdminOrder
  item: AdminOrderItem
  onPrint: () => void
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  })
}

export function ProductionSheetPreview({ order, item, onPrint }: ProductionSheetPreviewProps) {
  return (
    <Card className="border-2 border-dashed border-border bg-card print:border-solid print:border-black">
      <CardHeader className="flex flex-row items-center justify-between pb-4">
        <div>
          <CardTitle className="font-sans text-lg">Hoja de Produccion</CardTitle>
          <p className="mt-1 font-mono text-sm text-muted-foreground">
            {order.orderNumber} / Item {item.id}
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={onPrint} className="print:hidden">
          <Printer className="mr-2 h-4 w-4" />
          Imprimir
        </Button>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Order Info */}
        <div className="grid grid-cols-2 gap-4 rounded-lg bg-secondary p-4">
          <div>
            <p className="font-serif text-xs text-muted-foreground">Fecha del pedido</p>
            <p className="font-sans font-medium text-foreground">{formatDate(order.createdAt)}</p>
          </div>
          <div>
            <p className="font-serif text-xs text-muted-foreground">Cliente</p>
            <p className="font-sans font-medium text-foreground">{order.customer.name}</p>
          </div>
          <div>
            <p className="font-serif text-xs text-muted-foreground">Entrega estimada</p>
            <p className="font-sans font-medium text-foreground">
              {order.estimatedDelivery ? formatDate(order.estimatedDelivery) : 'Por definir'}
            </p>
          </div>
          <div>
            <p className="font-serif text-xs text-muted-foreground">Cantidad</p>
            <p className="font-sans text-xl font-bold text-foreground">{item.quantity} pzas</p>
          </div>
        </div>

        <Separator />

        {/* Product Info */}
        <div>
          <h3 className="mb-3 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Producto
          </h3>
          <div className="flex gap-4">
            <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
              <div className="flex h-full w-full items-center justify-center text-muted-foreground">
                IMG
              </div>
            </div>
            <div className="flex-1 space-y-2">
              <p className="font-sans text-lg font-semibold text-foreground">{item.productName}</p>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{item.sku}</Badge>
                <Badge variant="secondary">Talla: {item.size}</Badge>
                <div className="flex items-center gap-1.5 rounded-full border border-border px-2 py-0.5">
                  <div
                    className="h-3 w-3 rounded-full border border-border"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="text-xs">{item.color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Details */}
        {item.hasCustomization && item.customization && (
          <>
            <Separator />
            <div>
              <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                <Palette className="h-4 w-4" />
                Personalizacion
              </h3>

              <div className="space-y-4">
                {item.customization.areas.map((area, index) => (
                  <div
                    key={index}
                    className="rounded-lg border-2 border-primary/30 bg-primary/5 p-4"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span className="font-sans font-semibold text-foreground">
                        {area.areaName}
                      </span>
                      <Badge className="ml-auto">{area.type}</Badge>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-sm">
                      {area.text && (
                        <div className="col-span-2 rounded-lg bg-card p-3 border border-border">
                          <p className="font-serif text-xs text-muted-foreground mb-1">Texto a bordar</p>
                          <p className="font-sans text-xl font-bold text-foreground">{area.text}</p>
                        </div>
                      )}
                      {area.font && (
                        <div>
                          <p className="font-serif text-xs text-muted-foreground">Fuente</p>
                          <p className="font-sans font-medium text-foreground">{area.font}</p>
                        </div>
                      )}
                      {area.color && (
                        <div>
                          <p className="font-serif text-xs text-muted-foreground">Color hilo</p>
                          <div className="flex items-center gap-2">
                            <div
                              className="h-6 w-6 rounded border-2 border-border"
                              style={{ backgroundColor: area.color }}
                            />
                            <span className="font-mono text-sm">{area.color}</span>
                          </div>
                        </div>
                      )}
                      <div>
                        <p className="font-serif text-xs text-muted-foreground">Dimensiones</p>
                        <p className="font-sans font-medium text-foreground">
                          {area.width} x {area.height} cm
                        </p>
                      </div>
                    </div>

                    {area.logoUrl && (
                      <div className="mt-3 rounded-lg bg-card p-3 border border-border">
                        <p className="font-serif text-xs text-muted-foreground mb-1">Archivo logo</p>
                        <p className="font-mono text-xs text-foreground break-all">{area.logoUrl}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {/* Production Notes */}
              {item.customization.productionNotes && (
                <div className="mt-4 rounded-lg bg-warning/10 border border-warning/30 p-4">
                  <p className="font-sans text-sm font-semibold text-warning mb-1">
                    Notas especiales
                  </p>
                  <p className="font-serif text-sm text-foreground">
                    {item.customization.productionNotes}
                  </p>
                </div>
              )}
            </div>
          </>
        )}

        {/* Footer */}
        <Separator />
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>Design ID: {item.customization?.designId || 'N/A'}</span>
          <span>Impreso: {new Date().toLocaleString('es-MX')}</span>
        </div>
      </CardContent>
    </Card>
  )
}
