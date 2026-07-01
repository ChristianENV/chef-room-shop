'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'

import {
  useCreateAdminProductOptionValueMutation,
  useUpdateAdminProductOptionValueMutation,
} from '../api/use-admin-product-options'
import {
  mapAdminProductOptionMutationError,
  mapProductOptionValueToFormValues,
  mapValueFormValuesToCreateInput,
  mapValueFormValuesToUpdateInput,
  slugifyProductOptionLabel,
  validateProductOptionValueFormValues,
} from '../mappers/admin-product-options-ui.mapper'
import type {
  AdminProductOptionScope,
  AdminProductOptionValue,
  ProductOptionValueFormValues,
} from '../types/admin-product-options.types'

type ProductOptionValueFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  scope: AdminProductOptionScope
  optionGroupId: string
  groupName: string
  editingValue: AdminProductOptionValue | null
  initialValues: ProductOptionValueFormValues
  onSaved?: () => void
}

function ProductOptionValueFormBody({
  scope,
  optionGroupId,
  editingValue,
  initialValues,
  onOpenChange,
  onSaved,
}: Omit<ProductOptionValueFormDialogProps, 'open' | 'groupName'>) {
  const isEditing = !!editingValue
  const createMutation = useCreateAdminProductOptionValueMutation(scope)
  const updateMutation = useUpdateAdminProductOptionValueMutation(scope)

  const [values, setValues] = useState<ProductOptionValueFormValues>(initialValues)
  const [formError, setFormError] = useState<string | null>(null)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const update = <K extends keyof ProductOptionValueFormValues>(
    key: K,
    value: ProductOptionValueFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    const validationError = validateProductOptionValueFormValues(values)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)

    try {
      if (isEditing && editingValue) {
        await updateMutation.mutateAsync(mapValueFormValuesToUpdateInput(editingValue.id, values))
      } else {
        await createMutation.mutateAsync(mapValueFormValuesToCreateInput(optionGroupId, values))
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      setFormError(mapAdminProductOptionMutationError(error))
    }
  }

  return (
    <>
      <div className="grid gap-4 py-2">
        <div className="space-y-2">
          <Label htmlFor="option-value-label">Etiqueta *</Label>
          <Input
            id="option-value-label"
            value={values.label}
            disabled={isSaving}
            onChange={(e) => {
              const label = e.target.value
              setValues((prev) => ({
                ...prev,
                label,
                slug: prev.slug || slugifyProductOptionLabel(label),
              }))
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-value-slug">Slug *</Label>
          <Input
            id="option-value-slug"
            value={values.slug}
            disabled={isSaving}
            onChange={(e) => update('slug', e.target.value.toLowerCase())}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-value-description">Descripción</Label>
          <Textarea
            id="option-value-description"
            value={values.description}
            disabled={isSaving}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className="font-serif"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="option-value-price">Precio adicional (MXN)</Label>
            <Input
              id="option-value-price"
              type="number"
              min={0}
              step={1}
              value={values.priceDeltaPesos}
              disabled={isSaving}
              onChange={(e) => update('priceDeltaPesos', Math.max(0, Number(e.target.value) || 0))}
            />
            <p className="font-serif text-xs text-muted-foreground">
              0 = sin cargo adicional. Se guarda en centavos.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="option-value-sort">Orden</Label>
            <Input
              id="option-value-sort"
              type="number"
              min={0}
              value={values.sortOrder}
              disabled={isSaving}
              onChange={(e) => update('sortOrder', Math.max(0, Number(e.target.value) || 0))}
            />
          </div>
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label>Predeterminado</Label>
            <p className="font-serif text-xs text-muted-foreground">
              Solo un valor por grupo puede ser predeterminado.
            </p>
          </div>
          <Switch
            checked={values.isDefault}
            disabled={isSaving}
            onCheckedChange={(checked) => update('isDefault', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label>Activo</Label>
            <p className="font-serif text-xs text-muted-foreground">
              Los valores inactivos no se muestran en tienda.
            </p>
          </div>
          <Switch
            checked={values.isActive}
            disabled={isSaving}
            onCheckedChange={(checked) => update('isActive', checked)}
          />
        </div>
      </div>

      {formError ? (
        <Alert variant="destructive">
          <AlertDescription className="font-serif">{formError}</AlertDescription>
        </Alert>
      ) : null}

      <DialogFooter className="gap-2 sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={() => void handleSubmit()} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar valor'
          ) : (
            'Crear valor'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ProductOptionValueFormDialog({
  open,
  onOpenChange,
  scope,
  optionGroupId,
  groupName,
  editingValue,
  initialValues,
  onSaved,
}: ProductOptionValueFormDialogProps) {
  const formKey = editingValue?.id ?? `new-${optionGroupId}-${initialValues.sortOrder}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingValue ? 'Editar valor' : 'Nuevo valor'}</DialogTitle>
          <DialogDescription className="font-serif">Grupo: {groupName}</DialogDescription>
        </DialogHeader>
        {open ? (
          <ProductOptionValueFormBody
            key={formKey}
            scope={scope}
            optionGroupId={optionGroupId}
            editingValue={editingValue}
            initialValues={initialValues}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { mapProductOptionValueToFormValues }
