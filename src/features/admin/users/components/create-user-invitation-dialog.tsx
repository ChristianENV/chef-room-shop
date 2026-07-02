'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import { useCreateUserInvitationMutation } from '../api/use-create-user-invitation-mutation'
import type { InvitableTargetRole } from '../types/admin-invitations.types'

type CreateUserInvitationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
}

export function CreateUserInvitationDialog({
  open,
  onOpenChange,
  onCreated,
}: CreateUserInvitationDialogProps) {
  const [email, setEmail] = useState('')
  const [targetRole, setTargetRole] = useState<InvitableTargetRole>('CUSTOMER')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreateUserInvitationMutation()

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEmail('')
      setTargetRole('CUSTOMER')
      setErrorMessage(null)
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await createMutation.mutateAsync({
        email: email.trim(),
        targetRole,
      })
      handleOpenChange(false)
      onCreated?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'No se pudo crear la invitación.'
      setErrorMessage(message)
    }
  }

  const isPending = createMutation.isPending

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md" data-testid="admin-create-invitation-dialog">
        <DialogHeader>
          <DialogTitle className="font-sans">Nueva invitación</DialogTitle>
          <DialogDescription className="font-serif">
            Envía una invitación por correo. El enlace expira en 7 días.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="invite-email" className="font-sans text-sm">
              Email *
            </Label>
            <Input
              id="invite-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="usuario@ejemplo.com"
              disabled={isPending}
              required
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="invite-role" className="font-sans text-sm">
              Rol objetivo *
            </Label>
            <Select
              value={targetRole}
              onValueChange={(value) => setTargetRole(value as InvitableTargetRole)}
              disabled={isPending}
            >
              <SelectTrigger id="invite-role" className="font-sans">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CUSTOMER">Cliente</SelectItem>
                <SelectItem value="ADMIN">Administrador</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {errorMessage ? (
            <p className="font-serif text-sm text-destructive" role="alert">
              {errorMessage}
            </p>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={isPending}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={isPending || !email.trim()}>
              {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
              Enviar invitación
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
