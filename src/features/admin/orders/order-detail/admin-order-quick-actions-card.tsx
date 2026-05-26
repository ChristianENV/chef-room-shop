'use client'

import { Factory, FileText, Package, XCircle } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

import { AdminOrderDetailSectionCard } from './admin-order-detail-section-card'
import type { AdminOrderDetailState } from './use-admin-order-detail'
import type { AdminOrdersUiOrder } from '../types/admin-orders-ui.types'

type AdminOrderQuickActionsCardProps = {
  order: AdminOrdersUiOrder
  detail: AdminOrderDetailState
  onOpenProduction?: () => void
  embedded?: boolean
}

export function AdminOrderQuickActionsCard({
  order,
  detail,
  onOpenProduction,
  embedded = false,
}: AdminOrderQuickActionsCardProps) {
  const {
    isMutating,
    internalNote,
    setInternalNote,
    handleAddNote,
    handleMoveToProduction,
    handleMarkReady,
    openCancelDialog,
  } = detail

  const content = (
    <div className="space-y-6">
      {order.notes ? (
        <div className="rounded-lg border border-border/80 bg-muted/30 p-4">
          <p className="font-sans text-sm font-semibold">Notas internas</p>
          <p className="mt-2 whitespace-pre-wrap font-serif text-sm leading-relaxed text-muted-foreground">
            {order.notes}
          </p>
        </div>
      ) : null}

      <div>
        <label
          htmlFor="admin-order-internal-note"
          className="mb-2 block font-sans text-sm font-semibold"
        >
          Agregar nota
        </label>
        <Textarea
          id="admin-order-internal-note"
          value={internalNote}
          onChange={(e) => setInternalNote(e.target.value)}
          placeholder="Nota para el equipo de operaciones..."
          rows={4}
          className="resize-y min-h-[96px]"
        />
        <Button
          type="button"
          size="sm"
          className="mt-3 w-full sm:w-auto"
          disabled={!internalNote.trim() || isMutating}
          onClick={() => void handleAddNote()}
        >
          Guardar nota
        </Button>
      </div>

      <div>
        <p className="mb-3 font-sans text-sm font-semibold">Acciones rápidas</p>
        <div className="flex flex-col gap-2">
          {order.canMoveToProduction ? (
            <Button
              type="button"
              size="sm"
              className="w-full justify-start"
              disabled={isMutating}
              onClick={() => void handleMoveToProduction()}
            >
              <Factory className="mr-2 h-4 w-4 shrink-0" />
              Mover a producción
            </Button>
          ) : null}
          {order.canMarkReadyToShip ? (
            <Button
              type="button"
              size="sm"
              className="w-full justify-start"
              disabled={isMutating}
              onClick={() => void handleMarkReady()}
            >
              <Package className="mr-2 h-4 w-4 shrink-0" />
              Lista para envío
            </Button>
          ) : null}
          {onOpenProduction ? (
            <Button
              type="button"
              size="sm"
              variant="outline"
              className="w-full justify-start"
              onClick={onOpenProduction}
            >
              <FileText className="mr-2 h-4 w-4 shrink-0" />
              Ficha de producción
            </Button>
          ) : null}
          {order.canCancel ? (
            <Button
              type="button"
              variant="destructive"
              size="sm"
              className="w-full justify-start"
              disabled={isMutating}
              onClick={openCancelDialog}
            >
              <XCircle className="mr-2 h-4 w-4 shrink-0" />
              Cancelar orden
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )

  if (embedded) {
    return content
  }

  return (
    <AdminOrderDetailSectionCard
      title="Operación"
      description="Acciones y notas del equipo"
      icon={Factory}
    >
      {content}
    </AdminOrderDetailSectionCard>
  )
}
