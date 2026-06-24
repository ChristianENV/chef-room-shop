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

import { useCreateAdminProductTypeMutation } from '../api/use-create-admin-product-type-mutation'
import { useUpdateAdminProductTypeMutation } from '../api/use-update-admin-product-type-mutation'
import {
  mapAdminProductTypeMutationError,
  mapCategoryFormValuesToCreateInput,
  mapCategoryFormValuesToUpdateInput,
  validateCategoryFormValues,
} from '../mappers/admin-product-types-ui.mapper'
import type { AdminProductType } from '../types'
import type {
  CategoryFormFieldErrors,
  CategoryFormValues,
} from '../types/admin-product-types-ui.types'

type CategoryFormDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  editingCategory: AdminProductType | null
  initialValues: CategoryFormValues
  onSaved?: () => void
}

type CategoryFormBodyProps = {
  editingCategory: AdminProductType | null
  initialValues: CategoryFormValues
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}

function clearFieldError(
  errors: CategoryFormFieldErrors,
  key: keyof CategoryFormValues,
): CategoryFormFieldErrors {
  if (key !== 'nameEs' && key !== 'slug' && key !== 'shopSlug' && key !== 'sortOrder') {
    return errors
  }

  if (!errors[key]) return errors

  const next = { ...errors }
  delete next[key]
  return next
}

function CategoryFormBody({
  editingCategory,
  initialValues,
  onOpenChange,
  onSaved,
}: CategoryFormBodyProps) {
  const isEditing = !!editingCategory
  const createMutation = useCreateAdminProductTypeMutation()
  const updateMutation = useUpdateAdminProductTypeMutation()

  const [values, setValues] = useState<CategoryFormValues>(initialValues)
  const [fieldErrors, setFieldErrors] = useState<CategoryFormFieldErrors>({})
  const [formError, setFormError] = useState<string | null>(null)

  const update = <K extends keyof CategoryFormValues>(key: K, value: CategoryFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: value }))
    setFieldErrors((prev) => clearFieldError(prev, key))
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  const handleSubmit = async () => {
    const validation = validateCategoryFormValues(values)
    if (!validation.success) {
      setFieldErrors(validation.errors)
      return
    }

    setFieldErrors({})
    setFormError(null)

    try {
      if (isEditing && editingCategory) {
        await updateMutation.mutateAsync({
          id: editingCategory.id,
          input: mapCategoryFormValuesToUpdateInput(values),
        })
      } else {
        await createMutation.mutateAsync(mapCategoryFormValuesToCreateInput(values))
      }

      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      setFormError(mapAdminProductTypeMutationError(error))
    }
  }

  return (
    <>
      <DialogHeader>
        <DialogTitle className="font-sans">
          {isEditing ? 'Editar categoría' : 'Nueva categoría'}
        </DialogTitle>
        <DialogDescription className="font-serif">
          Define el nombre, slugs y visibilidad de la familia de productos.
        </DialogDescription>
      </DialogHeader>

      <div className="space-y-4 py-2">
        {formError ? (
          <Alert variant="destructive">
            <AlertDescription className="font-serif">{formError}</AlertDescription>
          </Alert>
        ) : null}

        <div className="space-y-2">
          <Label htmlFor="category-name-es" className="font-sans">
            Nombre (español) *
          </Label>
          <Input
            id="category-name-es"
            value={values.nameEs}
            onChange={(event) => update('nameEs', event.target.value)}
            placeholder="Filipinas"
          />
          {fieldErrors.nameEs ? (
            <p className="font-serif text-sm text-destructive">{fieldErrors.nameEs}</p>
          ) : null}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-name-en" className="font-sans">
            Nombre (inglés)
          </Label>
          <Input
            id="category-name-en"
            value={values.nameEn}
            onChange={(event) => update('nameEn', event.target.value)}
            placeholder="Chef Jackets"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-slug" className="font-sans">
            Slug interno *
          </Label>
          <Input
            id="category-slug"
            value={values.slug}
            onChange={(event) => update('slug', event.target.value)}
            placeholder="chef-jacket"
            className="font-mono"
          />
          {fieldErrors.slug ? (
            <p className="font-serif text-sm text-destructive">{fieldErrors.slug}</p>
          ) : (
            <p className="font-serif text-xs text-muted-foreground">
              Minúsculas y kebab-case. Debe ser único.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-shop-slug" className="font-sans">
            Slug tienda
          </Label>
          <Input
            id="category-shop-slug"
            value={values.shopSlug}
            onChange={(event) => update('shopSlug', event.target.value)}
            placeholder="filipinas"
            className="font-mono"
          />
          {fieldErrors.shopSlug ? (
            <p className="font-serif text-sm text-destructive">{fieldErrors.shopSlug}</p>
          ) : (
            <p className="font-serif text-xs text-muted-foreground">
              Opcional. Se usará en rutas de tienda cuando esté habilitado.
            </p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-description" className="font-sans">
            Descripción
          </Label>
          <Textarea
            id="category-description"
            value={values.description}
            onChange={(event) => update('description', event.target.value)}
            rows={3}
            placeholder="Uniformes superiores para cocina profesional."
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="category-sort-order" className="font-sans">
            Orden
          </Label>
          <Input
            id="category-sort-order"
            type="number"
            min={0}
            value={values.sortOrder}
            onChange={(event) => update('sortOrder', Number(event.target.value))}
          />
          {fieldErrors.sortOrder ? (
            <p className="font-serif text-sm text-destructive">{fieldErrors.sortOrder}</p>
          ) : null}
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="font-sans text-sm font-medium">Activa</p>
            <p className="font-serif text-xs text-muted-foreground">
              Las categorías inactivas no se usan en tienda.
            </p>
          </div>
          <Switch
            checked={values.isActive}
            onCheckedChange={(checked) => update('isActive', checked)}
          />
        </div>

        <div className="flex items-center justify-between rounded-lg border border-border p-3">
          <div>
            <p className="font-sans text-sm font-medium">Visible en navegación</p>
            <p className="font-serif text-xs text-muted-foreground">
              Controla si aparece en el menú de la tienda.
            </p>
          </div>
          <Switch
            checked={values.showInNav}
            onCheckedChange={(checked) => update('showInNav', checked)}
          />
        </div>
      </div>

      <DialogFooter>
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
            'Guardar cambios'
          ) : (
            'Crear categoría'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function CategoryFormDialog({
  open,
  onOpenChange,
  editingCategory,
  initialValues,
  onSaved,
}: CategoryFormDialogProps) {
  const formKey = editingCategory?.id ?? 'new'

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        {open ? (
          <CategoryFormBody
            key={formKey}
            editingCategory={editingCategory}
            initialValues={initialValues}
            onOpenChange={onOpenChange}
            onSaved={onSaved}
          />
        ) : null}
      </DialogContent>
    </Dialog>
  )
}
