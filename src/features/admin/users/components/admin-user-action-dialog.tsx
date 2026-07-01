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

export type AdminUserActionType = 'pause' | 'block' | 'reactivate'

type AdminUserActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: AdminUserActionType
  userName: string | null
  onConfirm: () => void
  isPending?: boolean
  errorMessage?: string | null
}

const ACTION_CONFIG: Record<
  AdminUserActionType,
  {
    title: string
    description: (name: string) => string
    confirmLabel: string
    confirmClass: string
  }
> = {
  pause: {
    title: 'Suspender usuario temporalmente',
    description: (name) =>
      `¿Suspender temporalmente a "${name}"? El usuario no podrá iniciar sesión mientras esté suspendido. Esta acción es reversible.`,
    confirmLabel: 'Suspender',
    confirmClass: 'bg-warning text-warning-foreground hover:bg-warning/90',
  },
  block: {
    title: 'Bloquear usuario',
    description: (name) =>
      `¿Bloquear a "${name}"? Se desactivará su acceso inmediatamente. Esta acción requiere reactivación manual para revertirse.`,
    confirmLabel: 'Bloquear',
    confirmClass: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
  },
  reactivate: {
    title: 'Reactivar usuario',
    description: (name) =>
      `¿Reactivar a "${name}"? El usuario volverá a tener acceso normal al sistema.`,
    confirmLabel: 'Reactivar',
    confirmClass: 'bg-primary text-primary-foreground hover:bg-primary/90',
  },
}

export function AdminUserActionDialog({
  open,
  onOpenChange,
  actionType,
  userName,
  onConfirm,
  isPending = false,
  errorMessage,
}: AdminUserActionDialogProps) {
  const config = ACTION_CONFIG[actionType]
  const displayName = userName ?? 'este usuario'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={`admin-user-${actionType}-dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans">{config.title}</AlertDialogTitle>
          <AlertDialogDescription className="font-serif">
            {config.description(displayName)}
          </AlertDialogDescription>
        </AlertDialogHeader>

        {errorMessage ? (
          <p className="font-serif text-sm text-destructive" role="alert">
            {errorMessage}
          </p>
        ) : null}

        <AlertDialogFooter>
          <AlertDialogCancel disabled={isPending}>Cancelar</AlertDialogCancel>
          <AlertDialogAction
            disabled={isPending}
            className={config.confirmClass}
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            data-testid={`admin-user-${actionType}-confirm`}
          >
            {config.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
