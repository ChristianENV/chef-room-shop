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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

import {
  useCreateAdminProductOptionGroupMutation,
  useUpdateAdminProductOptionGroupMutation,
} from '../api/use-admin-product-options'
import {
  mapAdminProductOptionMutationError,
  mapGroupFormValuesToCreateInput,
  mapGroupFormValuesToUpdateInput,
  mapProductOptionGroupToFormValues,
  PRODUCT_OPTION_INPUT_TYPE_LABELS,
  slugifyProductOptionLabel,
  validateProductOptionGroupFormValues,
} from '../mappers/admin-product-options-ui.mapper'
import type { AdminProductOptionGroup, ProductOptionGroupFormValues } from '../types/admin-product-options.types'

type ProductOptionGroupFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  editingGroup: AdminProductOptionGroup | null
  initialValues: ProductOptionGroupFormValues
  onSaved?: () => void
}

function ProductOptionGroupFormBody({
  productId,
  editingGroup,
  initialValues,
  onOpenChange,
  onSaved,
}: Omit<ProductOptionGroupFormDialogProps, 'open'>) {
  const isEditing = !!editingGroup
  const createMutation = useCreateAdminProductOptionGroupMutation(productId)
  const updateMutation = useUpdateAdminProductOptionGroupMutation(productId)

  const [values, setValues] = useState<ProductOptionGroupFormValues>(initialValues)
  const [formError, setFormError] = useState<string | null>(null)
  const isSaving = createMutation.isPending || updateMutation.isPending

  const update = <K extends keyof ProductOptionGroupFormValues>(
    key: K,
    value: ProductOptionGroupFormValues[K],
  ) => {
    setValues((prev) => ({ ...prev, [key]: value }))
  }

  const handleSubmit = async () => {
    const validationError = validateProductOptionGroupFormValues(values)
    if (validationError) {
      setFormError(validationError)
      return
    }

    setFormError(null)

    try {
      if (isEditing && editingGroup) {
        await updateMutation.mutateAsync(mapGroupFormValuesToUpdateInput(editingGroup.id, values))
      } else {
        await createMutation.mutateAsync(mapGroupFormValuesToCreateInput(productId, values))
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
          <Label htmlFor="option-group-name">Nombre *</Label>
          <Input
            id="option-group-name"
            value={values.name}
            disabled={isSaving}
            onChange={(e) => {
              const name = e.target.value
              setValues((prev) => ({
                ...prev,
                name,
                slug: prev.slug || slugifyProductOptionLabel(name),
              }))
            }}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-group-slug">Slug *</Label>
          <Input
            id="option-group-slug"
            value={values.slug}
            disabled={isSaving}
            onChange={(e) => update('slug', e.target.value.toLowerCase())}
            className="font-mono text-sm"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="option-group-description">Descripción</Label>
          <Textarea
            id="option-group-description"
            value={values.description}
            disabled={isSaving}
            onChange={(e) => update('description', e.target.value)}
            rows={2}
            className="font-serif"
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Tipo de entrada *</Label>
            <Select
              value={values.inputType}
              onValueChange={(value) =>
                update('inputType', value as ProductOptionGroupFormValues['inputType'])
              }
              disabled={isSaving}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(PRODUCT_OPTION_INPUT_TYPE_LABELS).map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="option-group-sort">Orden</Label>
            <Input
              id="option-group-sort"
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
            <Label>Obligatorio</Label>
            <p className="font-serif text-xs text-muted-foreground">
              El cliente debe elegir una opción de este grupo.
            </p>
          </div>
          <Switch
            checked={values.isRequired}
            disabled={isSaving}
            onCheckedChange={(checked) => update('isRequired', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <Label>Activo</Label>
            <p className="font-serif text-xs text-muted-foreground">
              Los grupos inactivos no se muestran en tienda.
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
            'Guardar grupo'
          ) : (
            'Crear grupo'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ProductOptionGroupFormDialog({
  open,
  onOpenChange,
  productId,
  editingGroup,
  initialValues,
  onSaved,
}: ProductOptionGroupFormDialogProps) {
  const formKey = editingGroup?.id ?? `new-${initialValues.sortOrder}`

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{editingGroup ? 'Editar grupo de opciones' : 'Nuevo grupo de opciones'}</DialogTitle>
          <DialogDescription className="font-serif">
            Opciones comerciales del producto (no personalización del customizer).
          </DialogDescription>
        </DialogHeader>
        {open ? (
          <ProductOptionGroupFormBody
            key={formKey}
            productId={productId}
            editingGroup={editingGroup}
            initialValues={initialValues}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}

export { mapProductOptionGroupToFormValues }
