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

type ArchiveProductDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productName: string | null
  onConfirm: () => void
  isArchiving?: boolean
}

export function ArchiveProductDialog({
  open,
  onOpenChange,
  productName,
  onConfirm,
  isArchiving,
}: ArchiveProductDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-muted">
              <Archive className="h-5 w-5 text-muted-foreground" />
            </div>
            <AlertDialogTitle className="font-sans">Archivar producto</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-serif">
            {productName ? (
              <>
                El producto <strong className="text-foreground">{productName}</strong> dejará de
                mostrarse en la tienda, pero se conservará para histórico.
              </>
            ) : (
              'El producto dejará de mostrarse en la tienda.'
            )}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isArchiving}>Cancelar</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm} disabled={isArchiving}>
            {isArchiving ? 'Archivando...' : 'Archivar'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
