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

export type AdminInvitationActionType = 'revoke' | 'resend'

type AdminInvitationActionDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  actionType: AdminInvitationActionType
  email: string | null
  onConfirm: () => void
  isPending?: boolean
  errorMessage?: string | null
}

const ACTION_CONFIG: Record<
  AdminInvitationActionType,
  { title: string; description: (email: string) => string; confirmLabel: string }
> = {
  revoke: {
    title: 'Revocar invitación',
    description: (email) =>
      `¿Revocar la invitación pendiente para "${email}"? El enlace dejará de ser válido.`,
    confirmLabel: 'Revocar',
  },
  resend: {
    title: 'Reenviar invitación',
    description: (email) =>
      `¿Reenviar la invitación a "${email}"? Se generará un nuevo enlace y se extenderá la vigencia.`,
    confirmLabel: 'Reenviar',
  },
}

export function AdminInvitationActionDialog({
  open,
  onOpenChange,
  actionType,
  email,
  onConfirm,
  isPending = false,
  errorMessage,
}: AdminInvitationActionDialogProps) {
  const config = ACTION_CONFIG[actionType]
  const displayEmail = email ?? 'este correo'

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent data-testid={`admin-invitation-${actionType}-dialog`}>
        <AlertDialogHeader>
          <AlertDialogTitle className="font-sans">{config.title}</AlertDialogTitle>
          <AlertDialogDescription className="font-serif">
            {config.description(displayEmail)}
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
            className={
              actionType === 'revoke'
                ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                : undefined
            }
            onClick={(event) => {
              event.preventDefault()
              onConfirm()
            }}
            data-testid={`admin-invitation-${actionType}-confirm`}
          >
            {config.confirmLabel}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
