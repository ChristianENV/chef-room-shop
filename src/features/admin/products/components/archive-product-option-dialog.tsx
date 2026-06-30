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

type ArchiveProductOptionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  entityType: 'group' | 'value'
  entityLabel: string | null
  onConfirm: () => void
  isArchiving?: boolean
  errorMessage?: string | null
}

export function ArchiveProductOptionDialog({
  open,
  onOpenChange,
  entityType,
  entityLabel,
  onConfirm,
  isArchiving = false,
  errorMessage,
}: ArchiveProductOptionDialogProps) {
  const title = entityType === 'group' ? 'Archivar grupo de opciones' : 'Archivar valor de opción'
  const description =
    entityType === 'group'
      ? entityLabel
        ? `¿Archivar el grupo "${entityLabel}"? Se desactivará y dejará de mostrarse en tienda. Los valores asociados permanecen en la base de datos.`
        : '¿Archivar este grupo de opciones comerciales?'
      : entityLabel
        ? `¿Archivar el valor "${entityLabel}"? Se desactivará y dejará de mostrarse en tienda.`
        : '¿Archivar este valor de opción?'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid="admin-product-option-archive-dialog">
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
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
            data-testid="admin-product-option-archive-confirm"
          >
            Archivar
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
