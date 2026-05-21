'use client'

import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette, MapPin } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import type { AdminOrdersUiItem } from './types/admin-orders-ui.types'

interface CustomizationSnapshotProps {
  item: AdminOrdersUiItem
  className?: string
}

export function CustomizationSnapshot({ item, className }: CustomizationSnapshotProps) {
  if (!item.hasCustomization) {
    return null
  }

  const { customization } = item

  if (!customization || customization.areas.length === 0) {
    return (
      <Card className={cn('border-accent/30 bg-accent/5', className)}>
        <CardContent className="py-4">
          <p className="font-serif text-sm text-muted-foreground">
            Personalización incluida en snapshot de producción.
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className={cn('border-accent/30 bg-accent/5', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-sans text-sm">
          <Palette className="h-4 w-4 text-accent" />
          Diseño personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-4">
          <div className="relative h-24 w-24 flex-shrink-0 overflow-hidden rounded-lg border border-border bg-secondary">
            {customization.previewUrl ? (
              <Image
                src={customization.previewUrl}
                alt="Vista previa"
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <Palette className="h-8 w-8 text-muted-foreground/50" />
              </div>
            )}
          </div>
          <div className="flex-1 space-y-2">
            <p className="font-sans text-sm font-medium text-foreground">{item.productName}</p>
            <div className="flex gap-4">
              <div>
                <p className="font-serif text-xs text-muted-foreground">Talla</p>
                <p className="font-sans text-sm font-medium text-foreground">{item.size}</p>
              </div>
              <div>
                <p className="font-serif text-xs text-muted-foreground">Color</p>
                <span className="font-sans text-sm text-foreground">{item.color}</span>
              </div>
            </div>
            {customization.summaryLines?.length ? (
              <ul className="list-disc pl-4 font-serif text-xs text-muted-foreground">
                {customization.summaryLines.map((line) => (
                  <li key={line}>{line}</li>
                ))}
              </ul>
            ) : null}
          </div>
        </div>

        <div className="space-y-3">
          <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Áreas personalizadas
          </p>
          {customization.areas.map((area, index) => (
            <div key={`${area.areaId}-${index}`} className="rounded-lg border border-border bg-card p-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span className="font-sans text-sm font-medium text-foreground">{area.areaName}</span>
                </div>
                <Badge variant="secondary" className="text-xs">
                  {area.type}
                </Badge>
              </div>
              <div className="mt-2 grid grid-cols-2 gap-2 text-sm">
                {area.text ? (
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Texto</p>
                    <p className="font-sans font-medium text-foreground">{area.text}</p>
                  </div>
                ) : null}
                {area.logoUrl ? (
                  <div className="col-span-2">
                    <p className="font-serif text-xs text-muted-foreground">Logo</p>
                    <p className="font-mono text-xs text-foreground truncate">{area.logoUrl}</p>
                  </div>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        {customization.productionNotes ? (
          <div className="rounded-lg bg-warning/10 p-3">
            <p className="font-sans text-xs font-medium text-warning">Notas de producción</p>
            <p className="mt-1 font-serif text-sm text-foreground">{customization.productionNotes}</p>
          </div>
        ) : null}

        <div className="flex items-center justify-between border-t border-border pt-3">
          <span className="font-serif text-xs text-muted-foreground">ID del diseño</span>
          <span className="font-mono text-xs text-foreground">{customization.designId}</span>
        </div>
        {item.totalPrice > 0 ? (
          <p className="font-serif text-xs text-muted-foreground">
            Línea: {formatCurrencyMXN(item.totalPrice)}
          </p>
        ) : null}
      </CardContent>
    </Card>
  )
}
