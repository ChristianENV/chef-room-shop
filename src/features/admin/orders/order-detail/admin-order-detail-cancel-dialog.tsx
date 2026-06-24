'use client'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import type { AdminOrderDetailState } from './use-admin-order-detail'

type AdminOrderDetailCancelDialogProps = {
  detail: AdminOrderDetailState
}

export function AdminOrderDetailCancelDialog({ detail }: AdminOrderDetailCancelDialogProps) {
  const {
    cancelDialogOpen,
    cancelReason,
    setCancelReason,
    dismissCancelDialog,
    handleCancel,
    isMutating,
  } = detail

  return (
    <Dialog
      open={cancelDialogOpen}
      onOpenChange={(next) => {
        if (!next) dismissCancelDialog()
      }}
    >
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="font-sans">Cancelar orden</DialogTitle>
          <DialogDescription className="font-serif">
            Esta acción no realiza reembolso automático. Indica el motivo si aplica.
          </DialogDescription>
        </DialogHeader>
        <Textarea
          value={cancelReason}
          onChange={(e) => setCancelReason(e.target.value)}
          placeholder="Motivo de cancelación (opcional)"
          rows={3}
        />
        <DialogFooter>
          <Button variant="outline" onClick={dismissCancelDialog}>
            Volver
          </Button>
          <Button variant="destructive" onClick={() => void handleCancel()} disabled={isMutating}>
            Confirmar cancelación
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
