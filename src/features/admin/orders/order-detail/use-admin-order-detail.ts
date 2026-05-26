'use client'

import { useState } from 'react'

import { useAdminOrderByNumberQuery } from '../api/use-admin-order-by-number-query'
import { useAdminOrderProductionSheetQuery } from '../api/use-admin-order-production-sheet-query'
import { useMoveAdminOrderToProductionMutation } from '../api/use-move-admin-order-to-production-mutation'
import { useMarkAdminOrderReadyToShipMutation } from '../api/use-mark-admin-order-ready-to-ship-mutation'
import { useCancelAdminOrderMutation } from '../api/use-cancel-admin-order-mutation'
import { useAddAdminOrderNoteMutation } from '../api/use-add-admin-order-note-mutation'
import {
  mapAdminOrderToDetail,
  mapAdminOrderToProductionSheet,
} from '../mappers/admin-orders-ui.mapper'

export type AdminOrderDetailTab =
  | 'details'
  | 'items'
  | 'timeline'
  | 'production'

type UseAdminOrderDetailOptions = {
  orderNumber: string
  enabled?: boolean
  onOpenCancelDialog?: boolean
}

export function useAdminOrderDetail({
  orderNumber,
  enabled = true,
  onOpenCancelDialog = false,
}: UseAdminOrderDetailOptions) {
  const [cancelDialogDismissed, setCancelDialogDismissed] = useState(false)
  const [cancelDialogExplicit, setCancelDialogExplicit] = useState(false)
  const [cancelReason, setCancelReason] = useState('')
  const [internalNote, setInternalNote] = useState('')
  const [actionMessage, setActionMessage] = useState<string | null>(null)
  const [actionError, setActionError] = useState<string | null>(null)

  const isActive = enabled && orderNumber.length > 0

  const detailQuery = useAdminOrderByNumberQuery(orderNumber, isActive)
  const productionSheetQuery = useAdminOrderProductionSheetQuery(orderNumber, isActive)

  const moveToProduction = useMoveAdminOrderToProductionMutation()
  const markReady = useMarkAdminOrderReadyToShipMutation()
  const cancelOrder = useCancelAdminOrderMutation()
  const addNote = useAddAdminOrderNoteMutation()

  const bffOrder = detailQuery.data
  const order = bffOrder ? mapAdminOrderToDetail(bffOrder) : null
  const productionSheet = productionSheetQuery.data
    ? mapAdminOrderToProductionSheet(productionSheetQuery.data)
    : undefined

  const isMutating =
    moveToProduction.isPending ||
    markReady.isPending ||
    cancelOrder.isPending ||
    addNote.isPending

  const cancelDialogOpen =
    isActive &&
    !cancelDialogDismissed &&
    (onOpenCancelDialog || cancelDialogExplicit)

  const resetTransientState = () => {
    setCancelDialogDismissed(false)
    setCancelDialogExplicit(false)
    setActionMessage(null)
    setActionError(null)
  }

  const handleMutationError = (error: unknown) => {
    const message =
      error instanceof Error ? error.message : 'No pudimos completar la acción.'
    setActionError(message)
    if (process.env.NODE_ENV === 'development') {
      console.error('[admin-orders]', error)
    }
  }

  const handleMoveToProduction = async () => {
    setActionError(null)
    try {
      await moveToProduction.mutateAsync(orderNumber)
      setActionMessage('Pedido enviado a producción.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleMarkReady = async () => {
    setActionError(null)
    try {
      await markReady.mutateAsync(orderNumber)
      setActionMessage('Pedido marcado como listo para envío.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleCancel = async () => {
    setActionError(null)
    try {
      await cancelOrder.mutateAsync({
        orderNumber,
        reason: cancelReason.trim() || undefined,
      })
      setCancelDialogDismissed(true)
      setCancelDialogExplicit(false)
      setCancelReason('')
      setActionMessage('Orden cancelada. No se realizó reembolso automático.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const handleAddNote = async () => {
    if (!internalNote.trim()) return
    setActionError(null)
    try {
      await addNote.mutateAsync({ orderNumber, note: internalNote.trim() })
      setInternalNote('')
      setActionMessage('Nota agregada correctamente.')
    } catch (e) {
      handleMutationError(e)
    }
  }

  const openCancelDialog = () => {
    setCancelDialogDismissed(false)
    setCancelDialogExplicit(true)
  }

  const dismissCancelDialog = () => {
    setCancelDialogDismissed(true)
    setCancelDialogExplicit(false)
  }

  const copyToClipboard = (text: string) => {
    void navigator.clipboard.writeText(text)
  }

  return {
    orderNumber,
    detailQuery,
    productionSheetQuery,
    bffOrder,
    order,
    productionSheet,
    isMutating,
    cancelDialogOpen,
    cancelReason,
    setCancelReason,
    internalNote,
    setInternalNote,
    actionMessage,
    actionError,
    setActionMessage,
    setActionError,
    resetTransientState,
    handleMoveToProduction,
    handleMarkReady,
    handleCancel,
    handleAddNote,
    openCancelDialog,
    dismissCancelDialog,
    copyToClipboard,
  }
}

export type AdminOrderDetailState = ReturnType<typeof useAdminOrderDetail>
