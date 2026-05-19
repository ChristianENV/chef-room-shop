'use client'

import { useState } from 'react'
import { X, Plus, Trash2, GripVertical, ImagePlus } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { AdminProduct, AdminProductVariant, ProductCategory, AdminProductStatus } from '@/lib/types'

interface ProductFormDrawerProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  product?: AdminProduct | null
  onSave: (data: ProductFormData) => Promise<void>
}

interface ProductFormData {
  name: string
  slug: string
  sku: string
  description: string
  category: ProductCategory
  basePrice: number
  productionDays: number
  customizable: boolean
  status: AdminProductStatus
  sizes: string[]
  colors: string[]
  seoTitle: string
  seoDescription: string
  variants: AdminProductVariant[]
}

const defaultFormData: ProductFormData = {
  name: '',
  slug: '',
  sku: '',
  description: '',
  category: 'filipinas',
  basePrice: 0,
  productionDays: 5,
  customizable: true,
  status: 'borrador',
  sizes: [],
  colors: [],
  seoTitle: '',
  seoDescription: '',
  variants: [],
}

const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '28', '30', '32', '34', '36', '38', '40', 'Unitalla']
const availableColors = [
  { id: 'white', name: 'Blanco', hex: '#FFFFFF' },
  { id: 'black', name: 'Negro', hex: '#111111' },
  { id: 'navy', name: 'Azul Marino', hex: '#0B1026' },
  { id: 'gray', name: 'Gris', hex: '#6B7280' },
  { id: 'brown', name: 'Cafe', hex: '#78350F' },
]

export function ProductFormDrawer({
  open,
  onOpenChange,
  product,
  onSave,
}: ProductFormDrawerProps) {
  const isEditing = !!product
  const [formData, setFormData] = useState<ProductFormData>(() => {
    if (product) {
      return {
        name: product.name,
        slug: product.slug,
        sku: product.sku,
        description: product.description,
        category: product.category,
        basePrice: product.basePrice,
        productionDays: product.productionDays,
        customizable: product.customizable,
        status: product.status,
        sizes: product.sizes,
        colors: product.colors.map(c => c.id),
        seoTitle: product.seoTitle || '',
        seoDescription: product.seoDescription || '',
        variants: product.variants,
      }
    }
    return defaultFormData
  })
  const [isSaving, setIsSaving] = useState(false)

  const handleSubmit = async () => {
    setIsSaving(true)
    try {
      await onSave(formData)
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving product:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '')
  }

  const addVariant = () => {
    setFormData(prev => ({
      ...prev,
      variants: [
        ...prev.variants,
        {
          id: `temp-${Date.now()}`,
          name: '',
          sku: '',
          priceModifier: 0,
          stock: 0,
          active: true,
        },
      ],
    }))
  }

  const updateVariant = (index: number, updates: Partial<AdminProductVariant>) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.map((v, i) => (i === index ? { ...v, ...updates } : v)),
    }))
  }

  const removeVariant = (index: number) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index),
    }))
  }

  const toggleSize = (size: string) => {
    setFormData(prev => ({
      ...prev,
      sizes: prev.sizes.includes(size)
        ? prev.sizes.filter(s => s !== size)
        : [...prev.sizes, size],
    }))
  }

  const toggleColor = (colorId: string) => {
    setFormData(prev => ({
      ...prev,
      colors: prev.colors.includes(colorId)
        ? prev.colors.filter(c => c !== colorId)
        : [...prev.colors, colorId],
    }))
  }

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-xl">
        <SheetHeader>
          <SheetTitle className="font-sans">
            {isEditing ? 'Editar Producto' : 'Nuevo Producto'}
          </SheetTitle>
          <SheetDescription className="font-serif">
            {isEditing
              ? 'Modifica los detalles del producto.'
              : 'Completa la informacion del nuevo producto.'}
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="general" className="mt-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="general" className="font-sans text-xs">General</TabsTrigger>
            <TabsTrigger value="options" className="font-sans text-xs">Opciones</TabsTrigger>
            <TabsTrigger value="variants" className="font-sans text-xs">Variantes</TabsTrigger>
            <TabsTrigger value="seo" className="font-sans text-xs">SEO</TabsTrigger>
          </TabsList>

          {/* General Tab */}
          <TabsContent value="general" className="space-y-4 pt-4">
            {/* Images Placeholder */}
            <div>
              <Label className="font-sans text-sm">Imagenes</Label>
              <div className="mt-2 grid grid-cols-4 gap-2">
                <button className="flex aspect-square items-center justify-center rounded-lg border-2 border-dashed border-border bg-secondary hover:border-primary hover:bg-secondary/80 transition-colors">
                  <ImagePlus className="h-6 w-6 text-muted-foreground" />
                </button>
                {/* TODO: Add Cloudinary upload integration */}
              </div>
              <p className="mt-1 font-serif text-xs text-muted-foreground">
                Arrastra imagenes o haz clic para subir
              </p>
            </div>

            <Separator />

            {/* Name */}
            <div className="space-y-2">
              <Label htmlFor="name" className="font-sans">Nombre del producto</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => {
                  const name = e.target.value
                  setFormData(prev => ({
                    ...prev,
                    name,
                    slug: generateSlug(name),
                  }))
                }}
                placeholder="Filipina Executive Blanca"
                className="font-sans"
              />
            </div>

            {/* Slug */}
            <div className="space-y-2">
              <Label htmlFor="slug" className="font-sans">Slug (URL)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="filipina-executive-blanca"
                className="font-mono text-sm"
              />
            </div>

            {/* SKU */}
            <div className="space-y-2">
              <Label htmlFor="sku" className="font-sans">SKU</Label>
              <Input
                id="sku"
                value={formData.sku}
                onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))}
                placeholder="FIL-EXE-WHT"
                className="font-mono text-sm uppercase"
              />
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label htmlFor="description" className="font-sans">Descripcion</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Descripcion detallada del producto..."
                rows={4}
                className="font-serif"
              />
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label className="font-sans">Categoria</Label>
              <Select
                value={formData.category}
                onValueChange={(value: ProductCategory) => setFormData(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="Seleccionar categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="filipinas">Filipinas</SelectItem>
                  <SelectItem value="mandiles">Mandiles</SelectItem>
                  <SelectItem value="pantalones">Pantalones</SelectItem>
                  <SelectItem value="accesorios">Accesorios</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {/* Base Price */}
              <div className="space-y-2">
                <Label htmlFor="basePrice" className="font-sans">Precio base (MXN)</Label>
                <Input
                  id="basePrice"
                  type="number"
                  value={formData.basePrice}
                  onChange={(e) => setFormData(prev => ({ ...prev, basePrice: Number(e.target.value) }))}
                  placeholder="1299"
                  className="font-sans"
                />
              </div>

              {/* Production Days */}
              <div className="space-y-2">
                <Label htmlFor="productionDays" className="font-sans">Dias de produccion</Label>
                <Input
                  id="productionDays"
                  type="number"
                  value={formData.productionDays}
                  onChange={(e) => setFormData(prev => ({ ...prev, productionDays: Number(e.target.value) }))}
                  placeholder="5"
                  className="font-sans"
                />
              </div>
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label className="font-sans">Estado</Label>
              <Select
                value={formData.status}
                onValueChange={(value: AdminProductStatus) => setFormData(prev => ({ ...prev, status: value }))}
              >
                <SelectTrigger className="font-sans">
                  <SelectValue placeholder="Seleccionar estado" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="borrador">Borrador</SelectItem>
                  <SelectItem value="activo">Activo</SelectItem>
                  <SelectItem value="archivado">Archivado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Customizable */}
            <div className="flex items-center justify-between rounded-lg border border-border p-4">
              <div>
                <Label className="font-sans">Personalizable</Label>
                <p className="font-serif text-xs text-muted-foreground">
                  Permitir bordados y personalizaciones
                </p>
              </div>
              <Switch
                checked={formData.customizable}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, customizable: checked }))}
              />
            </div>
          </TabsContent>

          {/* Options Tab */}
          <TabsContent value="options" className="space-y-6 pt-4">
            {/* Sizes */}
            <div className="space-y-3">
              <Label className="font-sans">Tallas disponibles</Label>
              <div className="flex flex-wrap gap-2">
                {availableSizes.map((size) => (
                  <button
                    key={size}
                    type="button"
                    onClick={() => toggleSize(size)}
                    className={cn(
                      'rounded-md border px-3 py-1.5 font-sans text-sm transition-colors',
                      formData.sizes.includes(size)
                        ? 'border-primary bg-primary text-primary-foreground'
                        : 'border-border bg-secondary text-foreground hover:border-primary'
                    )}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            <Separator />

            {/* Colors */}
            <div className="space-y-3">
              <Label className="font-sans">Colores disponibles</Label>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    type="button"
                    onClick={() => toggleColor(color.id)}
                    className={cn(
                      'flex items-center gap-2 rounded-md border px-3 py-2 transition-colors',
                      formData.colors.includes(color.id)
                        ? 'border-primary bg-primary/10'
                        : 'border-border bg-secondary hover:border-primary'
                    )}
                  >
                    <span
                      className="h-5 w-5 rounded-full border border-border"
                      style={{ backgroundColor: color.hex }}
                    />
                    <span className="font-sans text-sm">{color.name}</span>
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* Variants Tab */}
          <TabsContent value="variants" className="space-y-4 pt-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="font-sans font-medium">Variantes del producto</h4>
                <p className="font-serif text-sm text-muted-foreground">
                  Agrega variantes como manga corta/larga, etc.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={addVariant}>
                <Plus className="mr-1 h-4 w-4" />
                Agregar
              </Button>
            </div>

            {formData.variants.length === 0 ? (
              <Card className="border-dashed">
                <CardContent className="py-8 text-center">
                  <p className="font-serif text-sm text-muted-foreground">
                    No hay variantes. Agrega una para comenzar.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <div className="space-y-3">
                {formData.variants.map((variant, index) => (
                  <Card key={variant.id}>
                    <CardContent className="p-4">
                      <div className="flex items-start gap-3">
                        <GripVertical className="mt-2 h-5 w-5 cursor-grab text-muted-foreground" />
                        <div className="flex-1 space-y-3">
                          <div className="grid grid-cols-2 gap-3">
                            <div>
                              <Label className="font-sans text-xs">Nombre</Label>
                              <Input
                                value={variant.name}
                                onChange={(e) => updateVariant(index, { name: e.target.value })}
                                placeholder="Manga Corta"
                                className="font-sans"
                              />
                            </div>
                            <div>
                              <Label className="font-sans text-xs">SKU</Label>
                              <Input
                                value={variant.sku}
                                onChange={(e) => updateVariant(index, { sku: e.target.value.toUpperCase() })}
                                placeholder="FIL-EXE-WHT-MC"
                                className="font-mono text-sm uppercase"
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-3">
                            <div>
                              <Label className="font-sans text-xs">Precio +/-</Label>
                              <Input
                                type="number"
                                value={variant.priceModifier}
                                onChange={(e) => updateVariant(index, { priceModifier: Number(e.target.value) })}
                                placeholder="0"
                                className="font-sans"
                              />
                            </div>
                            <div>
                              <Label className="font-sans text-xs">Stock</Label>
                              <Input
                                type="number"
                                value={variant.stock}
                                onChange={(e) => updateVariant(index, { stock: Number(e.target.value) })}
                                placeholder="0"
                                className="font-sans"
                              />
                            </div>
                            <div className="flex items-end pb-1">
                              <div className="flex items-center gap-2">
                                <Switch
                                  checked={variant.active}
                                  onCheckedChange={(checked) => updateVariant(index, { active: checked })}
                                />
                                <Label className="font-sans text-xs">Activa</Label>
                              </div>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-muted-foreground hover:text-destructive"
                          onClick={() => removeVariant(index)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          {/* SEO Tab */}
          <TabsContent value="seo" className="space-y-4 pt-4">
            <div className="space-y-2">
              <Label htmlFor="seoTitle" className="font-sans">Titulo SEO</Label>
              <Input
                id="seoTitle"
                value={formData.seoTitle}
                onChange={(e) => setFormData(prev => ({ ...prev, seoTitle: e.target.value }))}
                placeholder="Filipina Executive Blanca - Chef Room"
                className="font-sans"
              />
              <p className="font-serif text-xs text-muted-foreground">
                {formData.seoTitle.length}/60 caracteres recomendados
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="seoDescription" className="font-sans">Descripcion SEO</Label>
              <Textarea
                id="seoDescription"
                value={formData.seoDescription}
                onChange={(e) => setFormData(prev => ({ ...prev, seoDescription: e.target.value }))}
                placeholder="Filipina profesional premium para chefs. Personalizable con bordados..."
                rows={3}
                className="font-serif"
              />
              <p className="font-serif text-xs text-muted-foreground">
                {formData.seoDescription.length}/160 caracteres recomendados
              </p>
            </div>

            {/* Preview */}
            <Card className="bg-secondary">
              <CardHeader className="pb-2">
                <CardTitle className="font-sans text-sm">Vista previa en buscadores</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-sans text-lg text-accent">
                    {formData.seoTitle || formData.name || 'Titulo del producto'}
                  </p>
                  <p className="font-mono text-xs text-success">
                    chefroom.mx/products/{formData.slug || 'slug-del-producto'}
                  </p>
                  <p className="font-serif text-sm text-muted-foreground line-clamp-2">
                    {formData.seoDescription || formData.description || 'Descripcion del producto...'}
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <SheetFooter className="mt-6 gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button onClick={handleSubmit} disabled={isSaving}>
            {isSaving ? 'Guardando...' : isEditing ? 'Guardar cambios' : 'Crear producto'}
          </Button>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  )
}
