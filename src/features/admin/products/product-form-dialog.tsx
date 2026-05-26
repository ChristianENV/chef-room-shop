'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import { ImagePlus, Plus, Trash2, Loader2 } from 'lucide-react'

import { formatCurrencyMXN } from '@/src/lib/formatters'
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
import { useUpsertAdminProductVariantMutation } from './api/use-upsert-admin-product-variant-mutation'
import { useDeleteAdminProductVariantMutation } from './api/use-delete-admin-product-variant-mutation'
import { useUpsertAdminProductImageMutation } from './api/use-upsert-admin-product-image-mutation'
import { useDeleteAdminProductImageMutation } from './api/use-delete-admin-product-image-mutation'
import {
  mapAdminProductToFormValues,
  mapFormValuesToAdminProductInput,
  STATUS_LABELS,
} from './mappers/admin-products-ui.mapper'
import { mapFormOptionsToSelectOptions } from './types/admin-products-ui.types'
import type {
  AdminProductImageUi,
  AdminProductStatusUi,
  AdminProductVariantUi,
  ProductFormValues,
} from './types/admin-products-ui.types'

interface ProductFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string | null
  onSaved?: (productId: string) => void
}

type ProductFormDrawerBodyProps = {
  productId: string | null
  initialValues: ProductFormValues
  selectOptions: ReturnType<typeof mapFormOptionsToSelectOptions>
  onOpenChange: (open: boolean) => void
  onSaved?: (productId: string) => void
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
  selectOptions,
  onOpenChange,
  onSaved,
}: ProductFormDrawerBodyProps) {
  const isEditing = !!productId
  const createMutation = useCreateAdminProductMutation()
  const updateMutation = useUpdateAdminProductMutation()
  const upsertVariant = useUpsertAdminProductVariantMutation()
  const deleteVariant = useDeleteAdminProductVariantMutation()
  const upsertImage = useUpsertAdminProductImageMutation()
  const deleteImage = useDeleteAdminProductImageMutation()

  const [formValues, setFormValues] = useState<ProductFormValues>(initialValues)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [isSaving, setIsSaving] = useState(false)

  const updateField = <K extends keyof ProductFormValues>(
    key: K,
    value: ProductFormValues[K],
  ) => {
    setFormValues((prev) => (prev ? { ...prev, [key]: value } : prev))
  }

  const persistVariantsAndImages = async (targetProductId: string, values: ProductFormValues) => {
    for (const variant of values.variants) {
      if (!variant.colorId || !variant.sizeId) continue
      await upsertVariant.mutateAsync({
        id: variant.isPersisted ? variant.id : null,
        productId: targetProductId,
        sku: variant.sku.trim() || null,
        variantName: variant.variantName?.trim() || null,
        colorId: variant.colorId,
        sizeId: variant.sizeId,
        priceCents: Math.round(variant.pricePesos * 100),
        stockQty: variant.stockQty,
        isActive: variant.isActive,
      })
    }

    for (const image of values.images) {
      if (!image.url.trim()) continue
      await upsertImage.mutateAsync({
        id: image.isPersisted ? image.id : null,
        productId: targetProductId,
        url: image.url.trim(),
        publicId: image.publicId?.trim() || null,
        alt: image.alt.trim() || null,
        sortOrder: image.sortOrder,
        isPrimary: image.isPrimary,
      })
    }
  }

  const handleSubmit = async () => {
    if (!formValues) return

    if (!formValues.name.trim()) {
      setSaveError('El nombre del producto es obligatorio.')
      return
    }
    if (!formValues.productTypeId) {
      setSaveError('Selecciona un tipo de prenda.')
      return
    }
    if (formValues.basePricePesos < 0) {
      setSaveError('El precio base no puede ser negativo.')
      return
    }

    setIsSaving(true)
    setSaveError(null)

    try {
      const input = mapFormValuesToAdminProductInput(formValues)
      let savedId = productId

      if (isEditing && productId) {
        await updateMutation.mutateAsync({ id: productId, input })
        await persistVariantsAndImages(productId, formValues)
      } else {
        const created = await createMutation.mutateAsync(input)
        savedId = created.id
        await persistVariantsAndImages(created.id, formValues)
      }

      if (savedId) onSaved?.(savedId)
      onOpenChange(false)
    } catch (error) {
      const message =
        error instanceof Error && error.message.includes('slug')
          ? 'Ya existe un producto con ese slug. Prueba otro.'
          : 'No pudimos guardar el producto. Intenta de nuevo.'
      setSaveError(message)
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin-products-form]', error)
      }
    } finally {
      setIsSaving(false)
    }
  }

  const addVariant = () => {
    if (!formValues) return
    const defaultColor = selectOptions.colors[0]?.value ?? ''
    const defaultSize = selectOptions.sizes[0]?.value ?? ''
    const newVariant: AdminProductVariantUi = {
      id: newTempId(),
      sku: '',
      variantName: null,
      colorId: defaultColor,
      sizeId: defaultSize,
      colorName: '',
      sizeName: '',
      pricePesos: formValues.basePricePesos,
      stockQty: 0,
      isActive: true,
      isPersisted: false,
    }
    updateField('variants', [...formValues.variants, newVariant])
  }

  const updateVariant = (index: number, patch: Partial<AdminProductVariantUi>) => {
    if (!formValues) return
    const next = formValues.variants.map((v, i) => (i === index ? { ...v, ...patch } : v))
    updateField('variants', next)
  }

  const removeVariant = async (index: number) => {
    if (!formValues) return
    const variant = formValues.variants[index]
    if (!variant) return

    if (variant.isPersisted && productId) {
      try {
        await deleteVariant.mutateAsync({ id: variant.id, productId })
      } catch (error) {
        setSaveError('No pudimos eliminar la variante.')
        if (process.env.NODE_ENV === 'development') console.error(error)
        return
      }
    }

    updateField(
      'variants',
      formValues.variants.filter((_, i) => i !== index),
    )
  }

  const addImage = () => {
    if (!formValues) return
    const newImage: AdminProductImageUi = {
      id: newTempId(),
      url: '',
      publicId: null,
      alt: '',
      sortOrder: formValues.images.length,
      isPrimary: formValues.images.length === 0,
      isPersisted: false,
    }
    updateField('images', [...formValues.images, newImage])
  }

  const updateImage = (index: number, patch: Partial<AdminProductImageUi>) => {
    if (!formValues) return
    let next = formValues.images.map((img, i) => (i === index ? { ...img, ...patch } : img))
    if (patch.isPrimary) {
      next = next.map((img, i) => ({ ...img, isPrimary: i === index }))
    }
    updateField('images', next)
  }

  const removeImage = async (index: number) => {
    if (!formValues) return
    const image = formValues.images[index]
    if (!image) return

    if (image.isPersisted && productId) {
      try {
        await deleteImage.mutateAsync({ id: image.id, productId })
      } catch (error) {
        setSaveError('No pudimos eliminar la imagen.')
        if (process.env.NODE_ENV === 'development') console.error(error)
        return
      }
    }

    updateField(
      'images',
      formValues.images.filter((_, i) => i !== index),
    )
  }

  return (
    <>
      <Tabs defaultValue="general" className="mt-6 flex-1">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general" className="font-sans text-xs">
                  General
                </TabsTrigger>
                <TabsTrigger value="variants" className="font-sans text-xs">
                  Variantes
                </TabsTrigger>
                <TabsTrigger value="seo" className="font-sans text-xs">
                  SEO
                </TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-4 pt-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-sans text-sm">Imágenes</Label>
                    <Button type="button" variant="outline" size="sm" onClick={addImage}>
                      <ImagePlus className="mr-1 h-4 w-4" />
                      Agregar URL
                    </Button>
                  </div>
                  <p className="font-serif text-xs text-muted-foreground">
                    Upload real a Cloudinary se conectará en la siguiente fase.
                  </p>
                  {formValues.images.length === 0 ? (
                    <div className="rounded-lg border border-dashed border-border py-6 text-center">
                      <p className="font-serif text-sm text-muted-foreground">
                        Sin imágenes. Agrega una URL para vista previa.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {formValues.images.map((image, index) => (
                        <Card key={image.id}>
                          <CardContent className="space-y-3 p-4">
                            <div className="flex gap-3">
                              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-md bg-secondary">
                                {image.url ? (
                                  <Image
                                    src={image.url}
                                    alt={image.alt || 'Vista previa'}
                                    fill
                                    className="object-cover"
                                    sizes="64px"
                                    onError={(e) => {
                                      e.currentTarget.style.display = 'none'
                                    }}
                                  />
                                ) : (
                                  <div className="flex h-full w-full items-center justify-center">
                                    <ImagePlus className="h-5 w-5 text-muted-foreground" />
                                  </div>
                                )}
                              </div>
                              <div className="flex-1 space-y-2">
                                <Input
                                  placeholder="https://..."
                                  value={image.url}
                                  onChange={(e) => updateImage(index, { url: e.target.value })}
                                  className="font-mono text-xs"
                                />
                                <Input
                                  placeholder="Texto alternativo"
                                  value={image.alt}
                                  onChange={(e) => updateImage(index, { alt: e.target.value })}
                                  className="font-sans text-sm"
                                />
                              </div>
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="shrink-0 text-muted-foreground hover:text-destructive"
                                onClick={() => void removeImage(index)}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={image.isPrimary}
                                onCheckedChange={(checked) =>
                                  updateImage(index, { isPrimary: checked })
                                }
                              />
                              <Label className="font-sans text-xs">Imagen principal</Label>
                            </div>
                          </CardContent>
                        </Card>
                      ))}
                    </div>
                  )}
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label htmlFor="name" className="font-sans">
                    Nombre *
                  </Label>
                  <Input
                    id="name"
                    value={formValues.name}
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
                    onChange={(e) => updateField('description', e.target.value)}
                    rows={4}
                    className="font-serif"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="font-sans">Tipo de prenda *</Label>
                  <Select
                    value={formValues.productTypeId}
                    onValueChange={(v) => updateField('productTypeId', v)}
                  >
                    <SelectTrigger className="font-sans">
                      <SelectValue placeholder="Seleccionar tipo" />
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
                      onChange={(e) =>
                        updateField('basePricePesos', Math.max(0, Number(e.target.value)))
                      }
                      className="font-sans"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="font-sans">Estado</Label>
                    <Select
                      value={formValues.status}
                      onValueChange={(v) =>
                        updateField('status', v as AdminProductStatusUi)
                      }
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
                      Permite bordados y personalizaciones en tienda.
                    </p>
                  </div>
                  <Switch
                    checked={formValues.customizable}
                    onCheckedChange={(checked) => updateField('customizable', checked)}
                  />
                </div>
              </TabsContent>

              <TabsContent value="variants" className="space-y-4 pt-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-sans font-medium">Variantes</h4>
                    <p className="font-serif text-sm text-muted-foreground">
                      Color, talla, precio y stock por combinación.
                    </p>
                  </div>
                  <Button type="button" variant="outline" size="sm" onClick={addVariant}>
                    <Plus className="mr-1 h-4 w-4" />
                    Agregar
                  </Button>
                </div>

                {formValues.variants.length === 0 ? (
                  <Card className="border-dashed">
                    <CardContent className="py-8 text-center">
                      <p className="font-serif text-sm text-muted-foreground">
                        Sin variantes. Puedes agregarlas después de guardar.
                      </p>
                    </CardContent>
                  </Card>
                ) : (
                  <div className="space-y-3">
                    {formValues.variants.map((variant, index) => (
                      <Card key={variant.id}>
                        <CardContent className="space-y-3 p-4">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="font-sans text-xs">Color</Label>
                              <Select
                                value={variant.colorId}
                                onValueChange={(v) => updateVariant(index, { colorId: v })}
                              >
                                <SelectTrigger className="font-sans">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectOptions.colors.map((c) => (
                                    <SelectItem key={c.value} value={c.value}>
                                      {c.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <Label className="font-sans text-xs">Talla</Label>
                              <Select
                                value={variant.sizeId}
                                onValueChange={(v) => updateVariant(index, { sizeId: v })}
                              >
                                <SelectTrigger className="font-sans">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {selectOptions.sizes.map((s) => (
                                    <SelectItem key={s.value} value={s.value}>
                                      {s.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="font-sans text-xs">SKU (opcional)</Label>
                              <Input
                                value={variant.sku}
                                onChange={(e) =>
                                  updateVariant(index, { sku: e.target.value.toUpperCase() })
                                }
                                className="font-mono text-xs uppercase"
                              />
                            </div>
                            <div>
                              <Label className="font-sans text-xs">Precio (MXN)</Label>
                              <Input
                                type="number"
                                min={0}
                                value={variant.pricePesos}
                                onChange={(e) =>
                                  updateVariant(index, {
                                    pricePesos: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                className="font-sans"
                              />
                            </div>
                            <div>
                              <Label className="font-sans text-xs">Stock</Label>
                              <Input
                                type="number"
                                min={0}
                                value={variant.stockQty}
                                onChange={(e) =>
                                  updateVariant(index, {
                                    stockQty: Math.max(0, Number(e.target.value)),
                                  })
                                }
                                className="font-sans"
                              />
                            </div>
                          </div>
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <Switch
                                checked={variant.isActive}
                                onCheckedChange={(checked) =>
                                  updateVariant(index, { isActive: checked })
                                }
                              />
                              <Label className="font-sans text-xs">Activa</Label>
                              <span className="font-serif text-xs text-muted-foreground">
                                {formatCurrencyMXN(variant.pricePesos)}
                              </span>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-destructive"
                              onClick={() => void removeVariant(index)}
                            >
                              <Trash2 className="mr-1 h-4 w-4" />
                              Quitar
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </TabsContent>

              <TabsContent value="seo" className="space-y-4 pt-4">
                <div className="space-y-2">
                  <Label htmlFor="seoTitle" className="font-sans">
                    Título SEO
                  </Label>
                  <Input
                    id="seoTitle"
                    value={formValues.seoTitle}
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
                    onChange={(e) => updateField('seoDescription', e.target.value)}
                    rows={3}
                    className="font-serif"
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
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>

            {saveError ? (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription className="font-serif">{saveError}</AlertDescription>
              </Alert>
            ) : null}

      <DialogFooter className="mt-6 gap-2 sm:justify-end">
        <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isSaving}>
          Cancelar
        </Button>
        <Button onClick={() => void handleSubmit()} disabled={isSaving}>
          {isSaving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Guardando…
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

  const productQuery = useAdminProductByIdQuery(productId ?? '', open && isEditing)
  const formOptionsQuery = useAdminProductFormOptionsQuery(open)

  const selectOptions = formOptionsQuery.data
    ? mapFormOptionsToSelectOptions(formOptionsQuery.data)
    : null

  const initialValues = useMemo(() => {
    if (!open || !formOptionsQuery.data) return null
    if (isEditing && !productQuery.data) return null
    return mapAdminProductToFormValues(
      isEditing ? productQuery.data! : null,
      formOptionsQuery.data,
    )
  }, [open, isEditing, productQuery.data, formOptionsQuery.data])

  const formBodyKey = isEditing
    ? `${productId}-${productQuery.data?.updatedAt ?? 'loading'}`
    : 'create'

  const isLoading =
    open &&
    (formOptionsQuery.isPending || (isEditing && productQuery.isPending) || !initialValues)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        data-testid="admin-product-form-dialog"
        className="flex max-h-[min(92vh,900px)] max-w-[min(96vw,64rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-5xl"
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
          ) : initialValues && selectOptions ? (
            <ProductFormDrawerBody
              key={formBodyKey}
              productId={productId}
              initialValues={initialValues}
              selectOptions={selectOptions}
              onOpenChange={onOpenChange}
              onSaved={onSaved}
            />
          ) : null}
        </div>
      </DialogContent>
    </Dialog>
  )
}
