'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Alert, AlertDescription } from '@/components/ui/alert'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent } from '@/components/ui/card'
import { useAdminProductByIdQuery } from './api/use-admin-product-by-id-query'
import { useAdminProductFormOptionsQuery } from './api/use-admin-product-form-options-query'
import { useCreateAdminProductMutation } from './api/use-create-admin-product-mutation'
import { useUpdateAdminProductMutation } from './api/use-update-admin-product-mutation'
import { useSyncAdminProductVariantsMutation } from './api/use-sync-admin-product-variants-mutation'
import { useDeleteAdminProductVariantMutation } from './api/use-delete-admin-product-variant-mutation'
import { ProductImageUploader } from './components/product-image-uploader'
import type { ProductImageUploaderHandle } from './components/product-image-uploader.types'
import { ProductModel3DUploader } from './components/product-model-3d-uploader'
import { ProductVariantEditor } from './components/product-variant-editor'
import { ProductSeoImagePicker } from './components/product-seo-image-picker'
import { ProductFormSavingOverlay } from './components/product-form-saving-overlay'
import { resolveProductOgImageUrl } from '@/src/lib/product-seo-image'
import {
  mapAdminProductToFormValues,
  mapFormValuesToAdminProductInput,
  mapFormVariantsToBatchInput,
  STATUS_LABELS,
} from './mappers/admin-products-ui.mapper'
import { validateFormVariantColors } from './lib/variant-color-options'
import {
  PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE,
  PRODUCT_FORM_SAVE_STATUS_MESSAGE,
  resolveProductFormPendingState,
  shouldBlockProductFormDialogClose,
  type ProductFormSaveStage,
} from './lib/product-form-dialog-guards'
import { mapFormOptionsToSelectOptions } from './types/admin-products-ui.types'
import type { AdminProductFormOptions } from './types'
import type {
  AdminProductStatusUi,
  AdminProductVariantUi,
  ProductFormValues,
} from './types/admin-products-ui.types'
import { GraphQLRequestError } from '@/src/lib/graphql/errors'
import {
  PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE,
  VARIANT_COLOR_NOT_ALLOWED_MESSAGE,
} from '@/src/config/catalog-color-messages'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  onSaved?: (productId: string) => void
}

type ProductFormDrawerBodyProps = {
  productId: string | null
  initialValues: ProductFormValues
  formOptions: AdminProductFormOptions
  onRequestClose: () => void
  onPendingChange?: (pending: boolean) => void
  onSaveStageChange?: (stage: ProductFormSaveStage) => void
  onCloseBlocked?: () => void
  onSaved?: (productId: string) => void
  initialModel3d?: import('./types').AdminProductModel3d | null
}

function newTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
}

function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
}

function ProductFormDrawerBody({
  productId,
  initialValues,
  formOptions,
  onRequestClose,
  onPendingChange,
  onSaveStageChange,
  onCloseBlocked,
  onSaved,
  initialModel3d,
}: ProductFormDrawerBodyProps) {
  const isEditing = !!productId
  const createMutation = useCreateAdminProductMutation()
  const updateMutation = useUpdateAdminProductMutation()
  const syncVariants = useSyncAdminProductVariantsMutation()
  const deleteVariant = useDeleteAdminProductVariantMutation()
  const imageUploaderRef = useRef<ProductImageUploaderHandle>(null)

  const [formValues, setFormValues] = useState<ProductFormValues>(initialValues)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)
  const [isSavingVariantsBatch, setIsSavingVariantsBatch] = useState(false)
  const [isImageUploadBusy, setIsImageUploadBusy] = useState(false)
  const [isModel3dBusy, setIsModel3dBusy] = useState(false)

  const isFormPending = resolveProductFormPendingState({
    isSaving,
    isSavingVariantsBatch,
    isImageUploadBusy,
    isModel3dBusy,
  })

  useEffect(() => {
    onPendingChange?.(isFormPending)
  }, [isFormPending, onPendingChange])

  const setStage = useCallback(
    (stage: ProductFormSaveStage) => {
      onSaveStageChange?.(stage)
    },
    [onSaveStageChange],
  )

  const handleRequestClose = useCallback(() => {
    if (shouldBlockProductFormDialogClose(isFormPending, false)) {
      onCloseBlocked?.()
      return
    }
    onRequestClose()
  }, [isFormPending, onCloseBlocked, onRequestClose])

  const selectOptions = useMemo(
    () =>
      mapFormOptionsToSelectOptions(formOptions, {
        selectedProductTypeId: formValues.productTypeId,
        existingVariantColorIds: formValues.variants.map((variant) => variant.colorId),
      }),
    [formOptions, formValues.productTypeId, formValues.variants],
  )

  const updateField = <K extends keyof ProductFormValues>(key: K, value: ProductFormValues[K]) => {
    setFormValues((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const syncVariantsBatch = async (targetProductId: string, values: ProductFormValues) => {
    const batch = mapFormVariantsToBatchInput(values.variants)
    if (batch.length === 0) return

    setIsSavingVariantsBatch(true)
    try {
      await syncVariants.mutateAsync({ productId: targetProductId, variants: batch })
    } finally {
      setIsSavingVariantsBatch(false)
    }
  }

  const handleSubmit = async () => {
    if (!formValues) return

    if (!formValues.name.trim()) {
      setSaveError('El nombre del producto es obligatorio.')
      return
    }
    if (!formValues.productTypeId) {
      setSaveError('Selecciona una categoría.')
      return
    }
    if (formValues.basePricePesos < 0) {
      setSaveError('El precio base no puede ser negativo.')
      return
    }

    const variantColorError = validateFormVariantColors(formValues, formOptions)
    if (variantColorError) {
      setSaveError(variantColorError)
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const input = mapFormValuesToAdminProductInput(formValues)
      let savedId = productId

      setStage('general')
      if (isEditing && productId) {
        await updateMutation.mutateAsync({ id: productId, input })
        setStage('variants')
        await syncVariantsBatch(productId, formValues)
      } else {
        const created = await createMutation.mutateAsync(input)
        savedId = created.id
        setStage('variants')
        await syncVariantsBatch(created.id, formValues)
        if (imageUploaderRef.current?.hasPendingUploads()) {
          setStage('images')
          await imageUploaderRef.current.uploadPendingImages(created.id)
        }
      }

      setStage('finalizing')
      if (savedId) onSaved?.(savedId)
      onRequestClose()
    } catch (error) {
      let message = 'No pudimos guardar el producto. Intenta de nuevo.'
      if (error instanceof GraphQLRequestError || error instanceof Error) {
        const text = error.message
        if (text.includes('slug')) {
          message = 'Ya existe un producto con ese slug. Prueba otro.'
        } else if (
          text.includes(VARIANT_COLOR_NOT_ALLOWED_MESSAGE) ||
          text.includes(PRODUCT_TYPE_VARIANT_CONFLICT_MESSAGE)
        ) {
          message = text
        }
      }
      setSaveError(message)
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin-products-form]', error)
      }
    } finally {
      setIsSaving(false)
      setStage(null)
    }
  }

  const removePersistedVariant = async (variant: AdminProductVariantUi): Promise<boolean> => {
    if (!productId) return false
    try {
      await deleteVariant.mutateAsync({ id: variant.id, productId })
      return true
    } catch (error) {
      setSaveError('No pudimos eliminar la variante.')
      if (process.env.NODE_ENV === 'development') console.error(error)
      return false
    }
  }

  return (
    <>
      <Tabs defaultValue="general" className="mt-6 flex-1">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general" className="font-sans text-xs" disabled={isFormPending}>
            General
          </TabsTrigger>
          <TabsTrigger value="variants" className="font-sans text-xs" disabled={isFormPending}>
            Variantes
          </TabsTrigger>
          <TabsTrigger value="seo" className="font-sans text-xs" disabled={isFormPending}>
            SEO
          </TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4 pt-4">
          <ProductImageUploader
            ref={imageUploaderRef}
            productId={productId}
            initialImages={formValues.images}
            disabled={isFormPending}
            onBusyChange={setIsImageUploadBusy}
          />

          <Separator />

          {formValues.customizable ? (
            <>
              <div className="space-y-2">
                <div>
                  <p className="font-sans text-sm font-medium text-foreground">
                    Modelo 3D del producto
                  </p>
                  <p className="font-serif text-xs text-muted-foreground">
                    Opcional. Sube un archivo GLB optimizado para el customizador.
                  </p>
                </div>
                <ProductModel3DUploader
                  productId={productId}
                  initialModel3d={initialModel3d ?? null}
                  disabled={isFormPending}
                  onBusyChange={setIsModel3dBusy}
                />
              </div>

              <Separator />
            </>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="name" className="font-sans">
              Nombre *
            </Label>
            <Input
              id="name"
              value={formValues.name}
              disabled={isFormPending}
              onChange={(e) => {
                const name = e.target.value
                setFormValues((prev) =>
                  prev
                    ? {
                        ...prev,
                        name,
                        slug: prev.slug || generateSlug(name),
                      }
                    : prev,
                )
              }}
              placeholder="Filipina Executive"
              className="font-sans"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="slug" className="font-sans">
              Slug (opcional)
            </Label>
            <Input
              id="slug"
              value={formValues.slug}
              disabled={isFormPending}
              onChange={(e) => updateField('slug', e.target.value)}
              placeholder="filipina-executive"
              className="font-mono text-sm"
            />
            <p className="font-serif text-xs text-muted-foreground">
              Si lo dejas vacío, el backend genera el slug automáticamente.
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="shortDescription" className="font-sans">
              Descripción corta
            </Label>
            <Input
              id="shortDescription"
              value={formValues.shortDescription}
              disabled={isFormPending}
              onChange={(e) => updateField('shortDescription', e.target.value)}
              className="font-serif"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description" className="font-sans">
              Descripción
            </Label>
            <Textarea
              id="description"
              value={formValues.description}
              disabled={isFormPending}
              onChange={(e) => updateField('description', e.target.value)}
              rows={4}
              className="font-serif"
            />
          </div>

          <div className="space-y-2">
            <Label className="font-sans">Categoría *</Label>
            <Select
              value={formValues.productTypeId}
              onValueChange={(v) => updateField('productTypeId', v)}
              disabled={isFormPending}
            >
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Seleccionar categoría" />
              </SelectTrigger>
              <SelectContent>
                {selectOptions.productTypes.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="font-sans">
                Precio base (MXN) *
              </Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                step={1}
                value={formValues.basePricePesos}
                disabled={isFormPending}
                onChange={(e) => updateField('basePricePesos', Math.max(0, Number(e.target.value)))}
                className="font-sans"
              />
            </div>
            <div className="space-y-2">
              <Label className="font-sans">Estado</Label>
              <Select
                value={formValues.status}
                onValueChange={(v) => updateField('status', v as AdminProductStatusUi)}
                disabled={isFormPending}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {(['DRAFT', 'ACTIVE', 'ARCHIVED'] as const).map((s) => (
                    <SelectItem key={s} value={s}>
                      {STATUS_LABELS[s]}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-lg border border-border p-4">
            <div>
              <Label className="font-sans">Personalizable</Label>
              <p className="font-serif text-xs text-muted-foreground">
                {formValues.customizable
                  ? 'Permite bordados y personalizaciones en tienda.'
                  : 'Desactivado para productos sin personalización (por ejemplo calzado). Variantes e imágenes siguen disponibles.'}
              </p>
            </div>
            <Switch
              checked={formValues.customizable}
              disabled={isFormPending}
              onCheckedChange={(checked) => updateField('customizable', checked)}
            />
          </div>
        </TabsContent>

        <TabsContent value="variants" className="space-y-4 pt-4">
          <div>
            <h4 className="font-sans font-medium">Variantes</h4>
            <p className="font-serif text-sm text-muted-foreground">
              Color, talla, precio y stock por combinación.
            </p>
          </div>

          <ProductVariantEditor
            key={formValues.productTypeId || 'no-product-type'}
            variants={formValues.variants}
            productName={formValues.name}
            productSlug={formValues.slug}
            productTypeId={formValues.productTypeId}
            basePricePesos={formValues.basePricePesos}
            selectOptions={selectOptions}
            formOptions={formOptions}
            disabled={isFormPending}
            newTempId={newTempId}
            onVariantsChange={(variants) => updateField('variants', variants)}
            onRemovePersistedVariant={removePersistedVariant}
          />
        </TabsContent>

        <TabsContent value="seo" className="space-y-4 pt-4">
          <div className="space-y-2">
            <Label htmlFor="seoTitle" className="font-sans">
              Título SEO
            </Label>
            <Input
              id="seoTitle"
              value={formValues.seoTitle}
              disabled={isFormPending}
              onChange={(e) => updateField('seoTitle', e.target.value)}
              className="font-sans"
            />
            <p className="font-serif text-xs text-muted-foreground">
              {formValues.seoTitle.length}/60 caracteres recomendados
            </p>
          </div>
          <div className="space-y-2">
            <Label htmlFor="seoDescription" className="font-sans">
              Descripción SEO
            </Label>
            <Textarea
              id="seoDescription"
              value={formValues.seoDescription}
              disabled={isFormPending}
              onChange={(e) => updateField('seoDescription', e.target.value)}
              rows={3}
              className="font-serif"
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans">Imagen SEO</Label>
            <p className="font-serif text-sm text-muted-foreground">
              Selecciona una foto del producto para usarla al compartir esta página.
            </p>
            <ProductSeoImagePicker
              images={formValues.images}
              seoImageId={formValues.seoImageId}
              onChange={(seoImageId) => updateField('seoImageId', seoImageId)}
              disabled={isFormPending}
            />
          </div>
          <Card className="bg-secondary">
            <CardContent className="space-y-1 p-4">
              <p className="font-sans text-lg text-accent">
                {formValues.seoTitle || formValues.name || 'Título del producto'}
              </p>
              <p className="font-mono text-xs text-success">
                chefroom.mx/products/{formValues.slug || 'slug-del-producto'}
              </p>
              <p className="line-clamp-2 font-serif text-sm text-muted-foreground">
                {formValues.seoDescription ||
                  formValues.shortDescription ||
                  'Descripción del producto…'}
              </p>
              {resolveProductOgImageUrl(
                formValues.images.map((image) => ({
                  id: image.id,
                  url: image.url,
                  isPrimary: image.isPrimary,
                  sortOrder: image.sortOrder,
                })),
                formValues.seoImageId,
              ) ? (
                <p className="font-serif text-xs text-muted-foreground">
                  Vista previa OG: imagen{' '}
                  {formValues.seoImageId ? 'SEO seleccionada' : 'principal del producto'}
                </p>
              ) : null}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {isSaving ? (
        <p
          className="mt-4 font-serif text-sm text-muted-foreground"
          data-testid="admin-product-form-save-status"
        >
          {PRODUCT_FORM_SAVE_STATUS_MESSAGE}
        </p>
      ) : null}

      {saveError ? (
        <Alert variant="destructive" className="mt-4">
          <AlertDescription className="font-serif">{saveError}</AlertDescription>
        </Alert>
      ) : null}

      <DialogFooter className="mt-6 gap-2 sm:justify-end">
        <Button variant="outline" onClick={handleRequestClose} disabled={isFormPending}>
          Cancelar
        </Button>
        <Button
          data-testid="admin-product-form-submit"
          onClick={() => void handleSubmit()}
          disabled={isFormPending}
        >
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando...
            </>
          ) : isEditing ? (
            'Guardar cambios'
          ) : (
            'Crear producto'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function ProductFormDialog({
  open,
  onOpenChange,
  productId,
  onSaved,
}: ProductFormDialogProps) {
  const isEditing = !!productId
  const [formPending, setFormPending] = useState(false)
  const [saveStage, setSaveStage] = useState<ProductFormSaveStage>(null)
  const [closeBlockedMessage, setCloseBlockedMessage] = useState<string | null>(null)

  const productQuery = useAdminProductByIdQuery(productId ?? '', open && isEditing)
  const formOptionsQuery = useAdminProductFormOptionsQuery(open)

  const handleDialogOpenChange = useCallback(
    (nextOpen: boolean) => {
      if (shouldBlockProductFormDialogClose(formPending, nextOpen)) {
        setCloseBlockedMessage(PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE)
        return
      }
      setCloseBlockedMessage(null)
      if (!nextOpen) {
        setFormPending(false)
      }
      onOpenChange(nextOpen)
    },
    [formPending, onOpenChange],
  )

  const handleRequestClose = useCallback(() => {
    handleDialogOpenChange(false)
  }, [handleDialogOpenChange])

  const initialValues = useMemo(() => {
    if (!open || !formOptionsQuery.data) return null
    if (isEditing && !productQuery.data) return null
    return mapAdminProductToFormValues(isEditing ? productQuery.data! : null, formOptionsQuery.data)
  }, [open, isEditing, productQuery.data, formOptionsQuery.data])

  const formBodyKey = isEditing
    ? `${productId}-${productQuery.data?.updatedAt ?? 'loading'}`
    : 'create'

  const isLoading =
    open && (formOptionsQuery.isPending || (isEditing && productQuery.isPending) || !initialValues)

  return (
    <Dialog open={open} onOpenChange={handleDialogOpenChange}>
      <DialogContent
        data-testid="admin-product-form-dialog"
        showCloseButton={!formPending}
        className="flex max-h-[min(92vh,900px)] max-w-[min(96vw,64rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
        onPointerDownOutside={(event) => {
          if (formPending) {
            event.preventDefault()
            setCloseBlockedMessage(PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE)
          }
        }}
        onEscapeKeyDown={(event) => {
          if (formPending) {
            event.preventDefault()
            setCloseBlockedMessage(PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE)
          }
        }}
      >
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar producto' : 'Nuevo producto'}
          </DialogTitle>
          <DialogDescription className="font-serif">
            {isEditing
              ? 'Modifica la información comercial del producto.'
              : 'Completa los datos del nuevo producto.'}
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {closeBlockedMessage ? (
            <Alert className="mb-4">
              <AlertDescription className="font-serif">{closeBlockedMessage}</AlertDescription>
            </Alert>
          ) : null}

          {formOptionsQuery.isError ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="font-serif">
                No pudimos cargar tipos, colores y tallas. Cierra y vuelve a intentar.
              </AlertDescription>
            </Alert>
          ) : null}

          {isLoading ? (
            <div className="flex flex-1 items-center justify-center py-16">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : initialValues && formOptionsQuery.data ? (
            <ProductFormDrawerBody
              key={formBodyKey}
              productId={productId}
              initialValues={initialValues}
              formOptions={formOptionsQuery.data}
              onRequestClose={handleRequestClose}
              onPendingChange={setFormPending}
              onSaveStageChange={setSaveStage}
              onCloseBlocked={() => setCloseBlockedMessage(PRODUCT_FORM_CLOSE_BLOCKED_MESSAGE)}
              onSaved={onSaved}
              initialModel3d={productQuery.data?.model3d ?? null}
            />
          ) : null}
        </div>

        {formPending ? <ProductFormSavingOverlay stage={saveStage} /> : null}
      </DialogContent>
    </Dialog>
  )
}
