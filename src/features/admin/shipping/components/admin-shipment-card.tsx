'use client'

import { useState } from 'react'
import { Truck } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { AdminOrder } from '@/src/features/admin/orders/types'

import { useAdminShipmentByOrderNumberQuery } from '../api/use-admin-shipment-by-order-number-query'
import { useAdminCreateShippingLabelMutation } from '../api/use-admin-create-shipping-label-mutation'
import { useAdminCancelShippingLabelMutation } from '../api/use-admin-cancel-shipping-label-mutation'
import { useAdminRefreshShipmentTrackingMutation } from '../api/use-admin-refresh-shipment-tracking-mutation'
import {
  canCreateShippingLabel,
  getCreateShippingLabelBlockedReason,
  mapAdminShipmentToUi,
} from '../mappers/admin-shipping-ui.mapper'
import { mapShippingMutationError } from '../lib/shipping-mutation-errors'
import { AdminShippingLoading } from './admin-shipping-loading'
import { AdminShippingError } from './admin-shipping-error'
import { AdminShippingEmpty } from './admin-shipping-empty'
import { AdminShippingLabelPreview } from './admin-shipping-label-preview'
import { AdminShippingLabelActions } from './admin-shipping-label-actions'
import { AdminCreateLabelDialog } from './admin-create-label-dialog'
import { AdminCancelLabelDialog } from './admin-cancel-label-dialog'

type AdminShipmentCardProps = {
  orderNumber: string
  order: AdminOrder
  enabled?: boolean
  onSuccessMessage?: (message: string) => void
  onErrorMessage?: (message: string) => void
}

/**
 * Skydropx shipment section for admin order drawer: query, create, print, refresh, cancel.
 */
export function AdminShipmentCard({
  orderNumber,
  order,
  enabled = true,
  onSuccessMessage,
  onErrorMessage,
}: AdminShipmentCardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)

  const shipmentQuery = useAdminShipmentByOrderNumberQuery(orderNumber, enabled)
  const createLabel = useAdminCreateShippingLabelMutation()
  const cancelLabel = useAdminCancelShippingLabelMutation()
  const refreshTracking = useAdminRefreshShipmentTrackingMutation()

  const shipment = shipmentQuery.data ?? null
  const shipmentUi = shipment ? mapAdminShipmentToUi(shipment) : null
  const canCreate = canCreateShippingLabel(order, shipment)
  const blockedReason = getCreateShippingLabelBlockedReason(order, shipment)

  const isMutating =
    createLabel.isPending || cancelLabel.isPending || refreshTracking.isPending

  const notifySuccess = (message: string) => {
    setLocalMessage(message)
    onSuccessMessage?.(message)
  }

  const notifyError = (error: unknown, fallback: string) => {
    const message = mapShippingMutationError(error)
    onErrorMessage?.(message || fallback)
  }

  const handleCreateLabel = async (labelFormat: string) => {
    try {
      await createLabel.mutateAsync({ orderNumber, labelFormat })
      setCreateDialogOpen(false)
      notifySuccess('Guía generada correctamente.')
    } catch (error) {
      notifyError(error, 'No pudimos generar la guía.')
    }
  }

  const handleCancelLabel = async (reason?: string) => {
    try {
      await cancelLabel.mutateAsync({ orderNumber, reason })
      setCancelDialogOpen(false)
      notifySuccess('Guía cancelada.')
    } catch (error) {
      notifyError(error, 'No pudimos cancelar la guía.')
    }
  }

  const handleRefreshTracking = async () => {
    try {
      const previousTracking = shipment?.trackingNumber ?? null
      const updated = await refreshTracking.mutateAsync(orderNumber)
      if (
        previousTracking &&
        updated.trackingNumber === previousTracking &&
        updated.status === shipment?.status
      ) {
        notifySuccess('Sin cambios recientes.')
      } else {
        notifySuccess('Tracking actualizado.')
      }
    } catch (error) {
      notifyError(error, 'No pudimos actualizar el tracking.')
    }
  }

  const openLabelUrl = () => {
    if (!shipmentUi?.labelUrl) return
    window.open(shipmentUi.labelUrl, '_blank', 'noopener,noreferrer')
  }

  const printLabel = () => {
    if (!shipmentUi?.labelUrl) return
    const win = window.open(shipmentUi.labelUrl, '_blank', 'noopener,noreferrer')
    win?.focus()
  }

  const copyTracking = (tracking: string) => {
    void navigator.clipboard.writeText(tracking)
    notifySuccess('Número de guía copiado.')
  }

  return (
    <div>
      <h3 className="mb-3 flex items-center gap-2 font-sans text-sm font-semibold">
        <Truck className="h-4 w-4" />
        Guía Skydropx
      </h3>

      {localMessage ? (
        <p className="mb-3 font-serif text-sm text-success">{localMessage}</p>
      ) : null}

      {shipmentQuery.isLoading ? <AdminShippingLoading /> : null}

      {shipmentQuery.isError ? (
        <AdminShippingError onRetry={() => void shipmentQuery.refetch()} />
      ) : null}

      {!shipmentQuery.isLoading && !shipmentQuery.isError ? (
        <div className="space-y-4 rounded-lg border border-border p-4">
          {shipmentUi?.hasActiveLabel ? (
            <>
              <AdminShippingLabelPreview shipment={shipmentUi} />
              <AdminShippingLabelActions
                shipment={shipmentUi}
                rawShipment={shipment!}
                onCopyTracking={copyTracking}
                onOpenLabel={openLabelUrl}
                onPrintLabel={printLabel}
                onRefreshTracking={() => void handleRefreshTracking()}
                onCancelLabel={() => setCancelDialogOpen(true)}
                isRefreshing={refreshTracking.isPending}
                isCancelling={cancelLabel.isPending}
              />
            </>
          ) : (
            <>
              <AdminShippingEmpty blockedReason={blockedReason} />
              {canCreate ? (
                <Button
                  size="sm"
                  disabled={isMutating}
                  onClick={() => setCreateDialogOpen(true)}
                >
                  Generar guía
                </Button>
              ) : blockedReason ? (
                <p className="font-serif text-xs text-muted-foreground">{blockedReason}</p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <AdminCreateLabelDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onConfirm={(format) => void handleCreateLabel(format)}
        isPending={createLabel.isPending}
      />

      <AdminCancelLabelDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onConfirm={(reason) => void handleCancelLabel(reason)}
        isPending={cancelLabel.isPending}
      />
    </div>
  )
}
