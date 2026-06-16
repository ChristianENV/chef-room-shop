'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ExternalLink, MapPin, Palette, ShoppingCart, Sticker, Type } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { routes } from '@/src/config/routes'
import { AdminJsonViewer } from '@/src/features/admin/components/admin-json-viewer'

import { useAdminDesignByIdQuery } from '../api/use-admin-design-by-id-query'
import {
  mapDesignOwnerTypeToLabel,
  mapDesignStatusToLabel,
} from '../mappers/admin-designs-ui.mapper'

type AdminDesignDetailDialogProps = {
  designId: string | null
  open: boolean
  onOpenChange: (open: boolean) => void
}

function PreviewImage({ url, label }: { url?: string | null; label: string }) {
  return (
    <div className="space-y-1">
      <p className="font-serif text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="relative h-36 w-36 overflow-hidden rounded-lg border border-border bg-secondary">
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

export function AdminDesignDetailDialog({
  designId,
  open,
  onOpenChange,
}: AdminDesignDetailDialogProps) {
  const detailQuery = useAdminDesignByIdQuery(designId, { enabled: open })
  const design = detailQuery.data

  const summary = design?.customizationSummary

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-3xl overflow-y-auto" data-testid="admin-design-detail-dialog">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {design ? `Diseño ${design.shortId}` : 'Detalle del diseño'}
          </DialogTitle>
          <DialogDescription className="font-serif">
            Vista de solo lectura para auditoría de personalización.
          </DialogDescription>
        </DialogHeader>

        {detailQuery.isLoading ? (
          <p className="font-serif text-sm text-muted-foreground">Cargando diseño…</p>
        ) : null}

        {detailQuery.isError ? (
          <p className="font-serif text-sm text-destructive">No se pudo cargar el diseño.</p>
        ) : null}

        {design ? (
          <div className="space-y-6">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <p className="font-sans text-lg font-semibold text-foreground">{design.productName}</p>
                {design.name ? (
                  <p className="font-serif text-sm text-muted-foreground">{design.name}</p>
                ) : null}
                <p className="mt-1 font-mono text-xs text-muted-foreground">{design.id}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline">{mapDesignStatusToLabel(design.status)}</Badge>
                <Badge variant="secondary">{mapDesignOwnerTypeToLabel(design.ownerType)}</Badge>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <PreviewImage url={design.previewUrl} label="Vista frontal" />
              <PreviewImage url={summary?.previewBackUrl} label="Vista trasera" />
              <div className="min-w-[200px] flex-1 space-y-3">
                <div>
                  <p className="font-serif text-xs text-muted-foreground">Cliente</p>
                  <p className="font-sans text-sm font-medium text-foreground">
                    {design.ownerType === 'GUEST'
                      ? 'Invitado'
                      : design.customerName ?? design.customerEmail ?? 'Cliente'}
                  </p>
                  {design.customerEmail ? (
                    <p className="font-mono text-xs text-muted-foreground">{design.customerEmail}</p>
                  ) : null}
                </div>
                {design.finalPriceCents != null ? (
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Precio estimado</p>
                    <p className="font-sans text-sm font-semibold text-foreground">
                      {new Intl.NumberFormat('es-MX', {
                        style: 'currency',
                        currency: design.currency,
                      }).format(design.finalPriceCents / 100)}
                    </p>
                  </div>
                ) : null}
                <div className="flex flex-col gap-1">
                  {design.relatedOrderNumber ? (
                    <Link
                      href={routes.adminOrderDetail(design.relatedOrderNumber)}
                      className="inline-flex items-center gap-1 font-mono text-xs text-primary hover:underline"
                    >
                      <ExternalLink className="size-3" />
                      Orden {design.relatedOrderNumber}
                    </Link>
                  ) : null}
                  {design.relatedCartId ? (
                    <span className="inline-flex items-center gap-1 font-mono text-xs text-muted-foreground">
                      <ShoppingCart className="size-3" />
                      Carrito {design.relatedCartId}
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {summary ? (
              <div className="space-y-4 rounded-lg border border-border bg-card/40 p-4">
                <p className="font-sans text-sm font-medium text-foreground">Resumen de personalización</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Talla</p>
                    <p className="font-sans text-sm text-foreground">{summary.size ?? '—'}</p>
                  </div>
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Color tela</p>
                    <div className="flex items-center gap-2">
                      {summary.fabricColorHex ? (
                        <span
                          className="size-3 rounded-full border border-border"
                          style={{ backgroundColor: summary.fabricColorHex }}
                        />
                      ) : null}
                      <span className="font-sans text-sm text-foreground">
                        {summary.fabricColor ?? '—'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <p className="font-serif text-xs text-muted-foreground">Color detalle</p>
                    <div className="flex items-center gap-2">
                      {summary.detailColorHex ? (
                        <span
                          className="size-3 rounded-full border border-border"
                          style={{ backgroundColor: summary.detailColorHex }}
                        />
                      ) : null}
                      <span className="font-sans text-sm text-foreground">
                        {summary.detailColor ?? '—'}
                      </span>
                    </div>
                  </div>
                </div>

                {summary.summaryLines.length > 0 ? (
                  <ul className="list-disc pl-4 font-serif text-xs text-muted-foreground">
                    {summary.summaryLines.map((line) => (
                      <li key={line}>{line}</li>
                    ))}
                  </ul>
                ) : null}

                {summary.elements.length > 0 ? (
                  <div className="space-y-2">
                    {summary.elements.map((element) => (
                      <div key={element.id} className="rounded-md border border-border p-3">
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
                        </div>
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <AdminJsonViewer
              tabs={[
                {
                  id: 'design-config',
                  label: 'Design.configJson',
                  value: design.configJson,
                  emptyMessage: 'No hay configJson para este diseño.',
                },
              ]}
              title="Ver JSON de auditoría (solo admin)"
            />
          </div>
        ) : null}

        {!detailQuery.isLoading && !detailQuery.isError && designId && !design ? (
          <p className="font-serif text-sm text-muted-foreground">Diseño no encontrado.</p>
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
