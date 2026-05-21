'use client'

import { Trash2 } from 'lucide-react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'

type DeleteRuleDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  ruleLabel: string | null
  onConfirm: () => void
  isDeleting?: boolean
}

export function DeleteRuleDialog({
  open,
  onOpenChange,
  ruleLabel,
  onConfirm,
  isDeleting,
}: DeleteRuleDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <Trash2 className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="font-sans">Eliminar regla</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-serif">
            {ruleLabel ? (
              <>
                La regla <strong className="text-foreground">{ruleLabel}</strong> dejará de estar
                disponible para nuevos diseños.
              </>
            ) : (
              'Esta regla dejará de estar disponible para nuevos diseños.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? 'Eliminando…' : 'Eliminar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
