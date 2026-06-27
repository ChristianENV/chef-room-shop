'use client'

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

import type { AdminColorTableRow } from '../types/admin-colors-ui.types'

type ArchiveColorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  color: AdminColorTableRow | null
  onConfirm: () => void
  isArchiving?: boolean
  errorMessage?: string | null
}

export function ArchiveColorDialog({
  open,
  onOpenChange,
  color,
  onConfirm,
  isArchiving = false,
  errorMessage,
}: ArchiveColorDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="admin-color-archive-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>Desactivar color</AlertDialogTitle>
          <AlertDialogDescription>
            {color
              ? `¿Desactivar "${color.name}"? No se eliminará de la base de datos. Si está en uso por variantes activas, la operación se rechazará.`
              : '¿Desactivar este color?'}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {errorMessage ? (
          <p className="font-serif text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isArchiving}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            data-testid="admin-color-archive-confirm"
          >
            Desactivar color
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
