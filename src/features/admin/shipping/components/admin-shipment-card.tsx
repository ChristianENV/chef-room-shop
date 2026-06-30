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
  isMockTrackingNumber,
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
import { AdminMockTrackingSimulation } from './admin-mock-tracking-simulation'
import { AdminSkydropxMockModeNotice } from './admin-skydropx-mock-mode-notice'

type AdminShipmentCardProps = {
  orderNumber: string
  order: AdminOrder
  enabled?: boolean
  embedded?: boolean
  onSuccessMessage?: (message: string) => void
  onErrorMessage?: (message: string) => void
}

/**
 * Skydropx shipment section for admin order detail: query, create, print, refresh, cancel.
 */
export function AdminShipmentCard({
  orderNumber,
  order,
  enabled = true,
  embedded = false,
  onSuccessMessage,
  onErrorMessage,
}: AdminShipmentCardProps) {
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false)
  const [localMessage, setLocalMessage] = useState<string | null>(null)
  const [createLabelError, setCreateLabelError] = useState<string | null>(null)

  const shipmentQuery = useAdminShipmentByOrderNumberQuery(orderNumber, enabled)
  const createLabel = useAdminCreateShippingLabelMutation()
  const cancelLabel = useAdminCancelShippingLabelMutation()
  const refreshTracking = useAdminRefreshShipmentTrackingMutation()

  const shipmentPayload = shipmentQuery.data ?? null
  const shipment = shipmentPayload?.shipment ?? null
  const isSkydropxMockMode = shipmentPayload?.isSkydropxMockMode ?? false
  const shipmentUi = shipment ? mapAdminShipmentToUi(shipment) : null
  const canCreate = canCreateShippingLabel(order, shipment)
  const blockedReason = getCreateShippingLabelBlockedReason(order, shipment)
  const showMockSimulation = isMockTrackingNumber(shipment?.trackingNumber ?? null)

  const isMutating = createLabel.isPending || cancelLabel.isPending || refreshTracking.isPending

  const notifySuccess = (message: string) => {
    setLocalMessage(message)
    onSuccessMessage?.(message)
  }

  const notifyError = (error: unknown, fallback: string) => {
    const message = mapShippingMutationError(error)
    onErrorMessage?.(message || fallback)
  }

  const handleCreateLabel = async (labelFormat: string) => {
    setCreateLabelError(null)
    try {
      await createLabel.mutateAsync({ orderNumber, labelFormat })
      setCreateDialogOpen(false)
      setCreateLabelError(null)
      notifySuccess('Guía generada correctamente.')
    } catch (error) {
      const message = mapShippingMutationError(error) || 'No pudimos generar la guía.'
      setCreateLabelError(message)
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

  const emptyMessage =
    blockedReason ?? 'Disponible cuando el pedido esté pagado y listo para envío.'

  return (
    <div
      data-testid="admin-shipping-card"
      className={embedded ? 'flex h-full min-w-0 flex-col' : undefined}
    >
      <h3
        className={
          embedded
            ? 'mb-4 flex items-center gap-2 font-sans text-xs font-semibold uppercase tracking-wide text-muted-foreground'
            : 'mb-3 flex items-center gap-2 font-sans text-sm font-semibold'
        }
      >
        <Truck className="h-3.5 w-3.5 sm:h-4 sm:w-4" aria-hidden />
        Guía Skydropx
      </h3>

      {localMessage ? <p className="mb-3 font-serif text-sm text-success">{localMessage}</p> : null}

      {shipmentQuery.isLoading ? <AdminShippingLoading /> : null}

      {shipmentQuery.isError ? (
        <AdminShippingError onRetry={() => void shipmentQuery.refetch()} />
      ) : null}

      {!shipmentQuery.isLoading && !shipmentQuery.isError ? (
        <div
          className={
            embedded
              ? 'flex flex-1 flex-col space-y-4'
              : 'space-y-4 rounded-lg border border-border p-4'
          }
        >
          <AdminSkydropxMockModeNotice visible={isSkydropxMockMode} />
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
              {showMockSimulation ? (
                <AdminMockTrackingSimulation
                  orderNumber={orderNumber}
                  onSuccessMessage={notifySuccess}
                  onErrorMessage={(msg) => onErrorMessage?.(msg)}
                />
              ) : null}
            </>
          ) : (
            <>
              <AdminShippingEmpty blockedReason={emptyMessage} />
              {canCreate ? (
                <Button
                  type="button"
                  size="sm"
                  className="w-full sm:w-auto"
                  disabled={isMutating}
                  data-testid="admin-create-label-button"
                  onClick={() => {
                    setCreateLabelError(null)
                    setCreateDialogOpen(true)
                  }}
                >
                  Generar guía
                </Button>
              ) : blockedReason ? (
                <p className="font-serif text-xs leading-relaxed text-muted-foreground">
                  {blockedReason}
                </p>
              ) : null}
              {createLabelError && !createDialogOpen ? (
                <p
                  className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 font-serif text-sm text-destructive"
                  role="alert"
                  data-testid="admin-create-label-card-error"
                >
                  {createLabelError}
                </p>
              ) : null}
            </>
          )}
        </div>
      ) : null}

      <AdminCreateLabelDialog
        open={createDialogOpen}
        onOpenChange={(open) => {
          setCreateDialogOpen(open)
          if (open) setCreateLabelError(null)
        }}
        onConfirm={(format) => void handleCreateLabel(format)}
        isPending={createLabel.isPending}
        error={createDialogOpen ? createLabelError : null}
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
