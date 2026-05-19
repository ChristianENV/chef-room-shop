'use client'

import { useState } from 'react'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import type { CustomizationAreaRule, CustomizationType } from '@/lib/types'

interface RuleEditorDrawerProps {
  open: boolean
  onClose: () => void
  rule: CustomizationAreaRule | null
  onSave: (rule: CustomizationAreaRule) => void
}

const customizationTypes: { id: CustomizationType; label: string }[] = [
  { id: 'bordado', label: 'Bordado' },
  { id: 'estampado', label: 'Estampado' },
  { id: 'patch', label: 'Patch' },
  { id: 'logo', label: 'Logo' },
  { id: 'texto', label: 'Texto' },
]

const fileTypes = ['png', 'jpg', 'svg', 'ai', 'eps', 'pdf']

export function RuleEditorDrawer({
  open,
  onClose,
  rule,
  onSave,
}: RuleEditorDrawerProps) {
  const [formData, setFormData] = useState<CustomizationAreaRule | null>(rule)

  // Update form data when rule changes
  useState(() => {
    setFormData(rule)
  })

  if (!formData) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (formData) {
      onSave(formData)
      onClose()
    }
  }

  const toggleCustomizationType = (type: CustomizationType) => {
    setFormData((prev) => {
      if (!prev) return prev
      const types = prev.allowedTypes.includes(type)
        ? prev.allowedTypes.filter((t) => t !== type)
        : [...prev.allowedTypes, type]
      return { ...prev, allowedTypes: types }
    })
  }

  const toggleFileType = (type: string) => {
    setFormData((prev) => {
      if (!prev) return prev
      const types = prev.allowedFileTypes || []
      const newTypes = types.includes(type)
        ? types.filter((t) => t !== type)
        : [...types, type]
      return { ...prev, allowedFileTypes: newTypes }
    })
  }

  return (
    <Sheet open={open} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full overflow-y-auto sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="font-sans">Editar Regla: {formData.areaName}</SheetTitle>
          <SheetDescription className="font-serif">
            Configura las opciones de personalizacion para esta zona.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className="mt-6 space-y-6">
          {/* Enabled toggle */}
          <div className="flex items-center justify-between">
            <Label htmlFor="enabled" className="font-sans">Zona Habilitada</Label>
            <Switch
              id="enabled"
              checked={formData.enabled}
              onCheckedChange={(checked) =>
                setFormData((prev) => (prev ? { ...prev, enabled: checked } : prev))
              }
            />
          </div>

          {/* Allowed customization types */}
          <div className="space-y-3">
            <Label className="font-sans">Tipos de Personalizacion Permitidos</Label>
            <div className="grid grid-cols-2 gap-2">
              {customizationTypes.map((type) => (
                <label
                  key={type.id}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border p-2 hover:bg-secondary"
                >
                  <Checkbox
                    checked={formData.allowedTypes.includes(type.id)}
                    onCheckedChange={() => toggleCustomizationType(type.id)}
                  />
                  <span className="font-sans text-sm">{type.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Dimensions */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="maxWidth" className="font-sans">Max Ancho (cm)</Label>
              <Input
                id="maxWidth"
                type="number"
                min={1}
                max={50}
                value={formData.maxWidth}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, maxWidth: parseInt(e.target.value) || 0 } : prev
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="maxHeight" className="font-sans">Max Alto (cm)</Label>
              <Input
                id="maxHeight"
                type="number"
                min={1}
                max={50}
                value={formData.maxHeight}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, maxHeight: parseInt(e.target.value) || 0 } : prev
                  )
                }
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="basePrice" className="font-sans">Precio Base ($)</Label>
              <Input
                id="basePrice"
                type="number"
                min={0}
                value={formData.basePrice}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, basePrice: parseInt(e.target.value) || 0 } : prev
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="pricePerCm" className="font-sans">Precio por cm ($)</Label>
              <Input
                id="pricePerCm"
                type="number"
                min={0}
                step={0.5}
                value={formData.pricePerCm}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, pricePerCm: parseFloat(e.target.value) || 0 } : prev
                  )
                }
              />
            </div>
          </div>

          {/* Production */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="productionDays" className="font-sans">Dias Extra Produccion</Label>
              <Input
                id="productionDays"
                type="number"
                min={0}
                max={30}
                value={formData.productionExtraDays}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, productionExtraDays: parseInt(e.target.value) || 0 } : prev
                  )
                }
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="minQuantity" className="font-sans">Cantidad Minima</Label>
              <Input
                id="minQuantity"
                type="number"
                min={1}
                value={formData.minQuantity || 1}
                onChange={(e) =>
                  setFormData((prev) =>
                    prev ? { ...prev, minQuantity: parseInt(e.target.value) || 1 } : prev
                  )
                }
              />
            </div>
          </div>

          {/* Allowed file types */}
          <div className="space-y-3">
            <Label className="font-sans">Tipos de Archivo Permitidos</Label>
            <div className="flex flex-wrap gap-2">
              {fileTypes.map((type) => (
                <label
                  key={type}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1 hover:bg-secondary"
                >
                  <Checkbox
                    checked={(formData.allowedFileTypes || []).includes(type)}
                    onCheckedChange={() => toggleFileType(type)}
                  />
                  <span className="font-mono text-xs uppercase">{type}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Validation message */}
          <div className="space-y-2">
            <Label htmlFor="validationMessage" className="font-sans">
              Mensaje de Validacion
            </Label>
            <Textarea
              id="validationMessage"
              placeholder="Mensaje que se mostrara al usuario..."
              value={formData.validationMessage || ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, validationMessage: e.target.value } : prev
                )
              }
              rows={2}
            />
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes" className="font-sans">Notas Internas</Label>
            <Textarea
              id="notes"
              placeholder="Notas para el equipo..."
              value={formData.notes || ''}
              onChange={(e) =>
                setFormData((prev) =>
                  prev ? { ...prev, notes: e.target.value } : prev
                )
              }
              rows={2}
            />
          </div>

          <SheetFooter className="gap-2">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">Guardar Cambios</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  )
}
