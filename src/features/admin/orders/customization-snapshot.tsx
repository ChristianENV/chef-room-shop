'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Palette, MapPin, Type, Sticker } from 'lucide-react'
import { cn } from '@/lib/utils'
import { formatCurrencyMXN } from '@/src/lib/formatters'
import { AdminJsonViewer } from '@/src/features/admin/components/admin-json-viewer'
import { useAdminDesignConfigQuery } from './api/use-admin-design-config-query'
import { buildReconstructedCartConfigSnapshot } from './lib/admin-customization.utils'

import type { AdminOrdersUiItem } from './types/admin-orders-ui.types'

interface CustomizationSnapshotProps {
  item: AdminOrdersUiItem
  className?: string
}

function PreviewThumb({
  url,
  label,
  testId,
}: {
  url?: string | null
  label: string
  testId: string
}) {
  return (
    <div className="space-y-1">
      <p className="font-serif text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div
        className="relative h-28 w-28 overflow-hidden rounded-lg border border-border bg-secondary"
        data-testid={testId}
      >
        {url ? (
          <Image src={url} alt={label} fill className="object-cover" unoptimized />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <Palette className="size-8 text-muted-foreground/50" />
          </div>
        )}
      </div>
    </div>
  )
}

export function CustomizationSnapshot({ item, className }: CustomizationSnapshotProps) {
  const [jsonOpen, setJsonOpen] = useState(false)
  const customization = item.customization

  const designId = customization?.rawSnapshots?.designId ?? null
  const designConfigQuery = useAdminDesignConfigQuery(designId, {
    enabled: jsonOpen && Boolean(designId),
  })

  const rawSnapshots = customization?.rawSnapshots
  const reconstructed = rawSnapshots
    ? buildReconstructedCartConfigSnapshot({
        productSnapshotJson: rawSnapshots.productSnapshotJson,
        designSnapshotJson: rawSnapshots.designSnapshotJson,
        designConfigJson: designConfigQuery.data,
      })
    : null

  const jsonTabs = rawSnapshots
    ? [
        {
          id: 'design-config',
          label: 'Design.configJson',
          value: designConfigQuery.data,
          loading: designConfigQuery.isLoading,
          emptyMessage: designId
            ? 'No se encontró configJson para este diseño.'
            : 'Esta línea no tiene designId asociado.',
        },
        {
          id: 'cart-config',
          label: 'CartItem.configSnapshotJson',
          value: reconstructed,
          emptyMessage:
            'No hay snapshots suficientes para reconstruir el configSnapshot del carrito.',
        },
        {
          id: 'product-snapshot',
          label: 'OrderItem.productSnapshotJson',
          value: rawSnapshots.productSnapshotJson,
          emptyMessage: 'Sin productSnapshotJson en la línea.',
        },
      ]
    : []

  if (!item.hasCustomization) {
    return null
  }

  if (!customization) {
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
    <Card className={cn('border-accent/30 bg-accent/5', className)} data-testid="admin-customization-snapshot">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 font-sans text-sm">
          <Palette className="h-4 w-4 text-accent" />
          Diseño personalizado
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex flex-wrap gap-4">
          <PreviewThumb
            url={customization.previewUrl}
            label="Vista frontal"
            testId="admin-customization-preview-front"
          />
          <PreviewThumb
            url={customization.previewBackUrl}
            label="Vista trasera"
            testId="admin-customization-preview-back"
          />
          <div className="min-w-[180px] flex-1 space-y-2">
            <p className="font-sans text-sm font-medium text-foreground">{item.productName}</p>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <p className="font-serif text-xs text-muted-foreground">Talla</p>
                <p className="font-sans text-sm font-medium text-foreground">
                  {customization.size || item.size}
                </p>
              </div>
              <div>
                <p className="font-serif text-xs text-muted-foreground">Color tela</p>
                <div className="flex items-center gap-2">
                  {customization.fabricColorHex ? (
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: customization.fabricColorHex }}
                    />
                  ) : null}
                  <span className="font-sans text-sm text-foreground">{customization.fabricColor}</span>
                </div>
              </div>
              <div>
                <p className="font-serif text-xs text-muted-foreground">Color detalle</p>
                <div className="flex items-center gap-2">
                  {customization.detailColorHex ? (
                    <span
                      className="size-3 rounded-full border border-border"
                      style={{ backgroundColor: customization.detailColorHex }}
                    />
                  ) : null}
                  <span className="font-sans text-sm text-foreground">{customization.detailColor}</span>
                </div>
              </div>
              <div>
                <p className="font-serif text-xs text-muted-foreground">Personalización</p>
                <p className="font-sans text-sm font-medium text-foreground">
                  {formatCurrencyMXN(customization.customizationPrice)}
                </p>
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

        {customization.elements.length > 0 ? (
          <div className="space-y-3">
            <p className="font-sans text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Elementos personalizados
            </p>
            {customization.elements.map((element) => (
              <div
                key={element.id}
                className="rounded-lg border border-border bg-card p-3"
                data-testid="admin-customization-element"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {element.type === 'logo' ? (
                      <Sticker className="size-4 text-muted-foreground" />
                    ) : (
                      <Type className="size-4 text-muted-foreground" />
                    )}
                    <span className="font-sans text-sm font-medium text-foreground">
                      {element.name ?? element.type}
                    </span>
                  </div>
                  <Badge variant="secondary" className="text-xs">
                    {element.type}
                  </Badge>
                </div>
                <div className="mt-2 grid gap-2 text-sm sm:grid-cols-2">
                  {element.zone ? (
                    <div className="flex items-center gap-1 text-muted-foreground">
                      <MapPin className="size-3.5" />
                      <span>{element.zone}</span>
                    </div>
                  ) : null}
                  {element.text ? (
                    <div>
                      <p className="font-serif text-xs text-muted-foreground">Texto</p>
                      <p className="font-sans font-medium text-foreground">{element.text}</p>
                    </div>
                  ) : null}
                  {element.assetUrl ? (
                    <div className="sm:col-span-2">
                      <p className="font-serif text-xs text-muted-foreground">Asset</p>
                      <p className="truncate font-mono text-xs text-foreground">{element.assetUrl}</p>
                    </div>
                  ) : null}
                </div>
              </div>
            ))}
          </div>
        ) : null}

        {customization.productionNotes ? (
          <div className="rounded-lg bg-warning/10 p-3">
            <p className="font-sans text-xs font-medium text-warning">Notas de producción</p>
            <p className="mt-1 font-serif text-sm text-foreground">{customization.productionNotes}</p>
          </div>
        ) : null}

        <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border pt-3">
          <span className="font-serif text-xs text-muted-foreground">ID del diseño</span>
          <span className="font-mono text-xs text-foreground">{customization.designId}</span>
        </div>

        <AdminJsonViewer
          tabs={jsonTabs}
          title="Ver JSON de auditoría (solo admin)"
          onOpenChange={setJsonOpen}
        />
      </CardContent>
    </Card>
  )
}
