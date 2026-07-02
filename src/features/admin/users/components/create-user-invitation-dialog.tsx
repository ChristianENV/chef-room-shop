'use client'

import { useEffect, useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
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
import { toast } from '@/hooks/use-toast'

import { useCreateUserInvitationMutation } from '../api/use-create-user-invitation-mutation'
import type { InvitableTargetRole } from '../types/admin-invitations.types'

const ROLE_LABELS: Record<InvitableTargetRole, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Administrador',
}

type CreateUserInvitationDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onCreated?: () => void
  defaultTargetRole?: InvitableTargetRole
  lockTargetRole?: boolean
}

export function CreateUserInvitationDialog({
  open,
  onOpenChange,
  onCreated,
  defaultTargetRole = 'CUSTOMER',
  lockTargetRole = false,
}: CreateUserInvitationDialogProps) {
  const [email, setEmail] = useState('')
  const [targetRole, setTargetRole] = useState<InvitableTargetRole>(defaultTargetRole)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const createMutation = useCreateUserInvitationMutation()

  useEffect(() => {
    if (open) {
      setEmail('')
      setTargetRole(defaultTargetRole)
      setErrorMessage(null)
    }
  }, [open, defaultTargetRole])

  function handleOpenChange(nextOpen: boolean) {
    if (!nextOpen) {
      setEmail('')
      setTargetRole(defaultTargetRole)
      setErrorMessage(null)
    }
    onOpenChange(nextOpen)
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrorMessage(null)

    const normalizedEmail = email.trim()

    try {
      await createMutation.mutateAsync({
        email: normalizedEmail,
        targetRole,
      })
      toast({
        title: 'Invitación enviada',
        description: `Se envió una invitación a ${normalizedEmail}.`,
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
            {lockTargetRole ? (
              <div
                className="rounded-md border border-border bg-muted/30 px-3 py-2"
                data-testid="invite-role-locked"
              >
                <Badge variant="outline" className="font-sans text-xs">
                  {ROLE_LABELS[targetRole]}
                </Badge>
              </div>
            ) : (
              <Select
                value={targetRole}
                onValueChange={(value) => setTargetRole(value as InvitableTargetRole)}
                disabled={isPending}
              >
                <SelectTrigger
                  id="invite-role"
                  className="font-sans"
                  data-testid="invite-role-select"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CUSTOMER">Cliente</SelectItem>
                  <SelectItem value="ADMIN">Administrador</SelectItem>
                </SelectContent>
              </Select>
            )}
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
