'use client'

import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'

import type { AdminShipmentUi } from '../mappers/admin-shipping-ui.mapper'

type AdminShippingLabelPreviewProps = {
  shipment: AdminShipmentUi
}

/**
 * Read-only summary of carrier, tracking, cost and label metadata.
 */
export function AdminShippingLabelPreview({ shipment }: AdminShippingLabelPreviewProps) {
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <div>
          <p className="font-sans text-sm font-medium">{shipment.carrier}</p>
          <p className="font-serif text-xs text-muted-foreground">{shipment.service}</p>
        </div>
        <Badge variant={shipment.statusBadgeVariant}>{shipment.statusLabel}</Badge>
      </div>

      <dl className="grid gap-2 text-sm sm:grid-cols-2">
        <div>
          <dt className="font-serif text-muted-foreground">Proveedor</dt>
          <dd className="font-sans">{shipment.providerLabel}</dd>
        </div>
        {shipment.trackingNumber ? (
          <div>
            <dt className="font-serif text-muted-foreground">Número de guía</dt>
            <dd className="font-mono text-sm">{shipment.trackingNumber}</dd>
          </div>
        ) : (
          <div>
            <dt className="font-serif text-muted-foreground">Número de guía</dt>
            <dd className="font-serif text-muted-foreground">Pendiente de asignación</dd>
          </div>
        )}
        {shipment.costFormatted ? (
          <div>
            <dt className="font-serif text-muted-foreground">Costo etiqueta</dt>
            <dd className="font-sans font-medium">{shipment.costFormatted}</dd>
          </div>
        ) : null}
        <div>
          <dt className="font-serif text-muted-foreground">Creada</dt>
          <dd className="font-sans">{shipment.createdAtFormatted}</dd>
        </div>
        {shipment.shippedAtFormatted ? (
          <div>
            <dt className="font-serif text-muted-foreground">Enviada</dt>
            <dd className="font-sans">{shipment.shippedAtFormatted}</dd>
          </div>
        ) : null}
        {shipment.labelFormat ? (
          <div>
            <dt className="font-serif text-muted-foreground">Formato</dt>
            <dd className="font-sans">{shipment.labelFormat}</dd>
          </div>
        ) : null}
      </dl>

      {shipment.events.length > 0 ? (
        <>
          <Separator />
          <div>
            <p className="mb-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Historial de envío
            </p>
            <ul className="space-y-2">
              {shipment.events.slice(-3).map((event) => (
                <li key={event.id} className="font-serif text-xs text-muted-foreground">
                  <span className="font-sans text-foreground">{event.statusLabel}</span>
                  {' · '}
                  {event.createdAtFormatted}
                  {event.message ? ` — ${event.message}` : ''}
                </li>
              ))}
            </ul>
          </div>
        </>
      ) : null}
    </div>
  )
}
