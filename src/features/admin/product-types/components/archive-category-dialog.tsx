'use client'

import { Archive } from 'lucide-react'

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

type ArchiveCategoryDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  categoryName: string | null
  activeProductCount: number
  onConfirm: () => void
  isArchiving?: boolean
  errorMessage?: string | null
}

export function ArchiveCategoryDialog({
  open,
  onOpenChange,
  categoryName,
  activeProductCount,
  onConfirm,
  isArchiving,
  errorMessage,
}: ArchiveCategoryDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <AlertDialogTitle className="font-sans">Desactivar categoría</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="space-y-2 font-serif">
            <span className="block">
              {categoryName ? (
                <>
                  La categoría <strong className="text-foreground">{categoryName}</strong> se
                  ocultará de la tienda y navegación.
                </>
              ) : (
                'La categoría se ocultará de la tienda y navegación.'
              )}
            </span>
            <span className="block">
              No se puede desactivar si tiene productos activos.
              {activeProductCount > 0
                ? ` Actualmente hay ${activeProductCount} producto${activeProductCount === 1 ? '' : 's'} activo${activeProductCount === 1 ? '' : 's'}.`
                : ''}
            </span>
            {errorMessage ? <span className="block text-destructive">{errorMessage}</span> : null}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isArchiving}>
            {isArchiving ? 'Desactivando...' : 'Desactivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
