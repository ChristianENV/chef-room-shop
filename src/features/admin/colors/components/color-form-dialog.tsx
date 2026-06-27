'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import { useCreateAdminColorMutation } from '../api/use-create-admin-color-mutation'
import { useUpdateAdminColorMutation } from '../api/use-update-admin-color-mutation'
import {
  mapAdminColorMutationError,
  mapColorFormValuesToCreateInput,
  mapColorFormValuesToUpdateInput,
  validateColorFormValues,
} from '../mappers/admin-colors-ui.mapper'
import type { AdminColor } from '../types'
import type { ColorFormValues } from '../types/admin-colors-ui.types'

type ColorFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingColor: AdminColor | null
  initialValues: ColorFormValues
  onSaved?: () => void
}

function ColorFormBody({
  editingColor,
  initialValues,
  onOpenChange,
  onSaved,
}: {
  editingColor: AdminColor | null
  initialValues: ColorFormValues
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const isEditing = !!editingColor
  const createMutation = useCreateAdminColorMutation()
  const updateMutation = useUpdateAdminColorMutation()

  const [values, setValues] = useState<ColorFormValues>(initialValues)
  const [formError, setFormError] = useState<string | null>(null)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const update = <K extends keyof ColorFormValues>(key: K, value: ColorFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    const validationError = validateColorFormValues(values)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)

    try {
      if (isEditing && editingColor) {
        await updateMutation.mutateAsync({
          id: editingColor.id,
          input: mapColorFormValuesToUpdateInput(values),
        })
      } else {
        await createMutation.mutateAsync(mapColorFormValuesToCreateInput(values))
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      setFormError(mapAdminColorMutationError(error))
    }
  }

  return (
    <>
      <div className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="color-name">Nombre *</Label>
          <Input
            id="color-name"
            value={values.name}
            disabled={isSaving}
            onChange={(e) => update('name', e.target.value)}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-slug">Slug *</Label>
          <Input
            id="color-slug"
            value={values.slug}
            disabled={isSaving}
            onChange={(e) => update('slug', e.target.value.toLowerCase())}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="color-hex">Hex *</Label>
          <div className="flex items-center gap-3">
            <Input
              id="color-hex"
              value={values.hex}
              disabled={isSaving}
              onChange={(e) => update('hex', e.target.value)}
              className="font-mono text-sm uppercase"
            />
            <span
              className="h-9 w-9 shrink-0 rounded-md border border-border"
              style={{ backgroundColor: values.hex }}
              aria-hidden
            />
          </div>
        </div>

        <div className="space-y-3 rounded-lg border border-border p-4">
          <p className="font-sans text-sm font-medium">Alcances</p>
          <div className="flex items-center gap-2">
            <Checkbox
              id="scope-fabric"
              checked={values.isFabricColor}
              disabled={isSaving}
              onCheckedChange={(checked) => update('isFabricColor', checked === true)}
            />
            <Label htmlFor="scope-fabric">Color de tela</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="scope-product"
              checked={values.isProductColor}
              disabled={isSaving}
              onCheckedChange={(checked) => update('isProductColor', checked === true)}
            />
            <Label htmlFor="scope-product">Color de variante</Label>
          </div>
          <div className="flex items-center gap-2">
            <Checkbox
              id="scope-general"
              checked={values.isGeneralColor}
              disabled={isSaving}
              onCheckedChange={(checked) => update('isGeneralColor', checked === true)}
            />
            <Label htmlFor="scope-general">Color general</Label>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="color-sort">Orden</Label>
            <Input
              id="color-sort"
              type="number"
              min={0}
              value={values.sortOrder}
              disabled={isSaving}
              onChange={(e) => update('sortOrder', Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label htmlFor="color-active">Activo</Label>
            <Switch
              id="color-active"
              checked={values.isActive}
              disabled={isSaving}
              onCheckedChange={(checked) => update('isActive', checked)}
            />
          </div>
        </div>
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription>{formError}</AlertDescription>
        </Alert>
      ) : null}

      <DialogFooter className="gap-2">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          Cancelar
        </Button>
        <Button
          onClick={() => void handleSubmit()}
          disabled={isSaving}
          data-testid="admin-color-form-submit"
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear color'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ColorFormDialog({
  open,
  onOpenChange,
  editingColor,
  initialValues,
  onSaved,
}: ColorFormDialogProps) {
  const formKey = editingColor?.id ?? 'create'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg" data-testid="admin-color-form-dialog">
        <DialogHeader>
          <DialogTitle>{editingColor ? 'Editar color' : 'Nuevo color'}</DialogTitle>
          <DialogDescription>
            Define nombre, hex y alcances. Los colores de tela no aparecen automáticamente como
            variantes comerciales.
          </DialogDescription>
        </DialogHeader>
        <ColorFormBody
          key={formKey}
          editingColor={editingColor}
          initialValues={initialValues}
          onOpenChange={onOpenChange}
          onSaved={onSaved}
        />
      </DialogContent>
    </Dialog>
  )
}
