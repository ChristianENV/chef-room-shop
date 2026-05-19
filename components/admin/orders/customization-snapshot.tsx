'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { AdminOrderItem, AdminOrderCustomization } from '@/lib/types'

interface CustomizationSnapshotProps {
  item: AdminOrderItem
  className?: string
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
    minimumFractionDigits: 0,
  }).format(amount)
}

export function CustomizationSnapshot({ item, className }: CustomizationSnapshotProps) {
  if (!item.hasCustomization || !item.customization) {
    return null
  }

  const { customization } = item

  return (
    <Card className={cn('border-accent/30 bg-accent/5', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-sans text-sm">
          <Palette className="h-4 w-4 text-accent" />
          Diseno Personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Design Preview */}
        <div className="flex gap-4">
          <div className="h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
            {/* Placeholder for design preview */}
            <div className="flex h-full w-full items-center justify-center">
              <Palette className="h-8 w-8 text-muted-foreground/50" />
            </div>
          </div>
          <div className="flex-1 space-y-2">
            <div>
              <p className="font-serif text-xs text-muted-foreground">Producto</p>
              <p className="font-sans text-sm font-medium text-foreground">{item.productName}</p>
            </div>
            <div className="flex gap-4">
              <div>
                <p className="font-serif text-xs text-muted-foreground">Talla</p>
                <p className="font-sans text-sm font-medium text-foreground">{item.size}</p>
              </div>
              <div>
                <p className="font-serif text-xs text-muted-foreground">Color</p>
                <div className="flex items-center gap-1.5">
                  <div
                    className="h-4 w-4 rounded-full border border-border"
                    style={{ backgroundColor: item.colorHex }}
                  />
                  <span className="font-sans text-sm text-foreground">{item.color}</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Customization Areas */}
        <div className="space-y-3">
          <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Areas personalizadas
          </p>
          {customization.areas.map((area, index) => (
            <div
              key={index}
              className="rounded-lg border border-border bg-card p-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-sans text-sm font-medium text-foreground">
                    {area.areaName}
                  </span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {area.type}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {area.text && (
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Texto</p>
                    <p className="font-sans font-medium text-foreground">{area.text}</p>
                  </div>
                )}
                {area.font && (
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Fuente</p>
                    <p className="font-sans text-foreground">{area.font}</p>
                  </div>
                )}
                {area.color && (
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Color bordado</p>
                    <div className="flex items-center gap-1.5">
                      <div
                        className="h-3 w-3 rounded-full border border-border"
                        style={{ backgroundColor: area.color }}
                      />
                      <span className="font-mono text-xs">{area.color}</span>
                    </div>
                  </div>
                )}
                {area.logoUrl && (
                  <div className="col-span-2">
                    <p className="font-serif text-xs text-muted-foreground">Logo</p>
                    <p className="font-mono text-xs text-foreground truncate">{area.logoUrl}</p>
                  </div>
                )}
                <div>
                  <p className="font-serif text-xs text-muted-foreground">Dimensiones</p>
                  <p className="font-sans text-foreground">{area.width} x {area.height} cm</p>
                </div>
                <div>
                  <p className="font-serif text-xs text-muted-foreground">Costo</p>
                  <p className="font-sans font-medium text-foreground">{formatCurrency(area.price)}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Production Notes */}
        {customization.productionNotes && (
          <div className="rounded-lg bg-warning/10 p-3">
            <p className="font-sans text-xs font-medium text-warning">Notas de produccion</p>
            <p className="mt-1 font-serif text-sm text-foreground">
              {customization.productionNotes}
            </p>
          </div>
        )}

        {/* Design ID */}
        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-serif text-xs text-muted-foreground">ID del diseno</span>
          <span className="font-mono text-xs text-foreground">{customization.designId}</span>
        </div>
      </CardContent>
    </Card>
  )
}
