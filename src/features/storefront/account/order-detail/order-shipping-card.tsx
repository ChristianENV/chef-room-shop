'use client'

import { useState } from 'react'
import { Copy, Truck, Check } from 'lucide-react'

import { Button } from '@/components/ui/button'
import type { AccountOrder } from '../types'
import { getFulfillmentStatusLabel } from './order-detail.utils'

type OrderShippingCardProps = {
  order: AccountOrder
}

/**
 * Shipping and tracking summary for an order.
 */
export function OrderShippingCard({ order }: OrderShippingCardProps) {
  const shipment = order.shipments[0]
  const [copied, setCopied] = useState(false)

  const handleCopyTracking = async () => {
    if (!shipment?.trackingNumber) return
    try {
      await navigator.clipboard.writeText(shipment.trackingNumber)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setCopied(false)
    }
  }

  return (
    <section
      className="rounded-xl border border-border bg-card p-6"
      aria-labelledby="order-shipping-title"
    >
      <div className="flex items-center gap-2">
        <Truck className="h-5 w-5 text-primary" aria-hidden />
        <h2 id="order-shipping-title" className="font-sans text-lg font-semibold text-foreground">
          Envío
        </h2>
      </div>

      <dl className="mt-4 space-y-2 font-serif text-sm">
        <div className="flex justify-between gap-4">
          <dt className="text-muted-foreground">Estado</dt>
          <dd className="font-sans font-medium text-foreground">
            {getFulfillmentStatusLabel(order.fulfillmentStatus)}
          </dd>
        </div>
        {shipment?.carrier && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Transportista</dt>
            <dd className="font-sans font-medium text-foreground">{shipment.carrier}</dd>
          </div>
        )}
        {shipment?.shippedAt && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Enviado</dt>
            <dd className="font-sans font-medium text-foreground">
              {new Date(shipment.shippedAt).toLocaleDateString('es-MX')}
            </dd>
          </div>
        )}
        {shipment?.deliveredAt && (
          <div className="flex justify-between gap-4">
            <dt className="text-muted-foreground">Entregado</dt>
            <dd className="font-sans font-medium text-foreground">
              {new Date(shipment.deliveredAt).toLocaleDateString('es-MX')}
            </dd>
          </div>
        )}
      </dl>

      {shipment?.trackingNumber ? (
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <p className="flex-1 rounded-md border border-border bg-secondary/30 px-3 py-2 font-mono text-sm text-foreground">
            {shipment.trackingNumber}
          </p>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="font-sans"
            onClick={() => void handleCopyTracking()}
            aria-label="Copiar número de guía"
          >
            {copied ? (
              <Check className="mr-2 h-4 w-4 text-success" />
            ) : (
              <Copy className="mr-2 h-4 w-4" />
            )}
            {copied ? 'Copiado' : 'Copiar guía'}
          </Button>
        </div>
      ) : (
        <p className="mt-4 font-serif text-sm text-muted-foreground">
          La guía aparecerá cuando tu pedido sea enviado.
        </p>
      )}
    </section>
  )
}
