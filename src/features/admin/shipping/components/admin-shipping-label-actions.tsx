'use client'

import {
  Copy,
  ExternalLink,
  Printer,
  RefreshCw,
  XCircle,
} from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { AdminShipmentUi } from '../mappers/admin-shipping-ui.mapper'
import {
  canCancelShippingLabel,
  canRefreshShipment,
} from '../mappers/admin-shipping-ui.mapper'
import type { AdminShipment } from '../types'

type AdminShippingLabelActionsProps = {
  shipment: AdminShipmentUi
  rawShipment: AdminShipment
  onCopyTracking: (tracking: string) => void
  onOpenLabel: () => void
  onPrintLabel: () => void
  onRefreshTracking: () => void
  onCancelLabel: () => void
  isRefreshing?: boolean
  isCancelling?: boolean
}

/**
 * Action buttons for an existing Skydropx label (open, print, copy, refresh, cancel).
 */
export function AdminShippingLabelActions({
  shipment,
  rawShipment,
  onCopyTracking,
  onOpenLabel,
  onPrintLabel,
  onRefreshTracking,
  onCancelLabel,
  isRefreshing = false,
  isCancelling = false,
}: AdminShippingLabelActionsProps) {
  const showLabelActions = Boolean(shipment.labelUrl)
  const showCopyTracking = Boolean(shipment.trackingNumber)

  return (
    <div className="flex flex-wrap gap-2">
      {showLabelActions ? (
        <>
          <Button size="sm" variant="default" onClick={onOpenLabel}>
            <ExternalLink className="mr-2 h-4 w-4" />
            Abrir etiqueta
          </Button>
          <Button size="sm" variant="outline" onClick={onPrintLabel}>
            <Printer className="mr-2 h-4 w-4" />
            Imprimir
          </Button>
        </>
      ) : null}
      {showCopyTracking ? (
        <Button
          size="sm"
          variant="outline"
          onClick={() => onCopyTracking(shipment.trackingNumber!)}
        >
          <Copy className="mr-2 h-4 w-4" />
          Copiar guía
        </Button>
      ) : null}
      {canRefreshShipment(rawShipment) ? (
        <Button
          size="sm"
          variant="outline"
          onClick={onRefreshTracking}
          disabled={isRefreshing}
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`}
          />
          Actualizar tracking
        </Button>
      ) : null}
      {canCancelShippingLabel(rawShipment) ? (
        <Button
          size="sm"
          variant="destructive"
          onClick={onCancelLabel}
          disabled={isCancelling}
        >
          <XCircle className="mr-2 h-4 w-4" />
          Cancelar guía
        </Button>
      ) : null}
    </div>
  )
}
