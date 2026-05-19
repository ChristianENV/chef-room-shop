'use client'

import { AlertTriangle } from 'lucide-react'
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
import type { AdminProduct } from '@/lib/types'

interface DeleteProductDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product: AdminProduct | null
  onConfirm: () => Promise<void>
  isDeleting: boolean
}

export function DeleteProductDialog({
  open,
  onOpenChange,
  product,
  onConfirm,
  isDeleting,
}: DeleteProductDialogProps) {
  if (!product) return null

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-5 w-5 text-destructive" />
            </div>
            <AlertDialogTitle className="font-sans">Eliminar producto</AlertDialogTitle>
          </div>
          <AlertDialogDescription className="font-serif">
            Estas a punto de eliminar <strong className="font-sans text-foreground">{product.name}</strong>.
            Esta accion no se puede deshacer y eliminara permanentemente el producto y todas sus variantes.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel className="font-sans">Cancelar</AlertDialogCancel>
          <AlertDialogAction
            onClick={onConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90 font-sans"
          >
            {isDeleting ? 'Eliminando...' : 'Eliminar producto'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
