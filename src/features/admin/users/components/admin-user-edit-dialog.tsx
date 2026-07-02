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

import { useUpdateAdminUserMutation } from '../api/use-update-admin-user-mutation'
import type { AdminUsersUiTableRow } from '../types'

type AdminUserEditDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: AdminUsersUiTableRow | null
  /** If true, show customerTier field (customers view). */
  showCustomerTier?: boolean
  onSaved?: () => void
}

type FormState = {
  name: string
  firstName: string
  lastName: string
  phone: string
  customerTier: string
}

function buildInitialForm(user: AdminUsersUiTableRow | null): FormState {
  return {
    name: user?.name ?? '',
    firstName: user?.firstName ?? '',
    lastName: user?.lastName ?? '',
    phone: user?.phone ?? '',
    customerTier: user?.customerTier ?? 'REGULAR',
  }
}

/**
 * Inner form — receives initial values as props and manages its own field state.
 * Mounted fresh each time via key on the parent dialog.
 */
function AdminUserEditForm({
  initialValues,
  user,
  showCustomerTier,
  onClose,
  onSaved,
}: {
  initialValues: FormState
  user: AdminUsersUiTableRow
  showCustomerTier: boolean
  onClose: () => void
  onSaved?: () => void
}) {
  const [form, setForm] = useState<FormState>(initialValues)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const updateMutation = useUpdateAdminUserMutation()

  function handleField(field: keyof FormState, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault()
    setErrorMessage(null)

    try {
      await updateMutation.mutateAsync({
        id: user.id,
        name: form.name.trim() || undefined,
        firstName: form.firstName.trim() || null,
        lastName: form.lastName.trim() || null,
        phone: form.phone.trim() || null,
        ...(showCustomerTier ? { customerTier: form.customerTier } : {}),
      })
      onClose()
      onSaved?.()
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Ocurrió un error al guardar.'
      setErrorMessage(message)
    }
  }

  const isPending = updateMutation.isPending

  return (
    <form onSubmit={(e) => void handleSubmit(e)} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="edit-user-name" className="font-sans text-sm">
          Nombre completo *
        </Label>
        <Input
          id="edit-user-name"
          value={form.name}
          onChange={(e) => handleField('name', e.target.value)}
          placeholder="Nombre completo"
          disabled={isPending}
          required
          className="font-sans"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="edit-user-first-name" className="font-sans text-sm">
            Nombre
          </Label>
          <Input
            id="edit-user-first-name"
            value={form.firstName}
            onChange={(e) => handleField('firstName', e.target.value)}
            placeholder="Nombre"
            disabled={isPending}
            className="font-sans"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="edit-user-last-name" className="font-sans text-sm">
            Apellido
          </Label>
          <Input
            id="edit-user-last-name"
            value={form.lastName}
            onChange={(e) => handleField('lastName', e.target.value)}
            placeholder="Apellido"
            disabled={isPending}
            className="font-sans"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="edit-user-phone" className="font-sans text-sm">
          Teléfono
        </Label>
        <Input
          id="edit-user-phone"
          value={form.phone}
          onChange={(e) => handleField('phone', e.target.value)}
          placeholder="+52 55 1234 5678"
          disabled={isPending}
          className="font-sans"
        />
      </div>

      {showCustomerTier ? (
        <div className="space-y-2">
          <Label htmlFor="edit-user-tier" className="font-sans text-sm">
            Nivel de cliente
          </Label>
          <Select
            value={form.customerTier}
            onValueChange={(value) => handleField('customerTier', value)}
            disabled={isPending}
          >
            <SelectTrigger id="edit-user-tier" className="font-sans">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="REGULAR">Regular</SelectItem>
              <SelectItem value="PREMIUM">Premium</SelectItem>
              <SelectItem value="VIP">VIP</SelectItem>
            </SelectContent>
          </Select>
        </div>
      ) : null}

      {errorMessage ? (
        <p className="font-serif text-sm text-destructive" role="alert">
          {errorMessage}
        </p>
      ) : null}

      <DialogFooter>
        <Button type="button" variant="outline" onClick={onClose} disabled={isPending}>
          Cancelar
        </Button>
        <Button type="submit" disabled={isPending || !form.name.trim()}>
          {isPending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
          Guardar
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AdminUserEditDialog({
  open,
  onOpenChange,
  user,
  showCustomerTier = false,
  onSaved,
}: AdminUserEditDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md" data-testid="admin-user-edit-dialog">
        <DialogHeader>
          <DialogTitle className="font-sans">Editar usuario</DialogTitle>
          <DialogDescription className="font-serif">
            Modifica los datos básicos de <strong>{user?.name}</strong>. No se pueden cambiar el
            email ni la contraseña desde aquí.
          </DialogDescription>
        </DialogHeader>

        {user ? (
          /* key forces remount when user changes, giving fresh form state */
          <AdminUserEditForm
            key={user.id}
            initialValues={buildInitialForm(user)}
            user={user}
            showCustomerTier={showCustomerTier}
            onClose={() => onOpenChange(false)}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
