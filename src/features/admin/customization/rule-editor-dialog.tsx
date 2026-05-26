'use client'

import { useMemo, useState } from 'react'
import { Loader2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Textarea } from '@/components/ui/textarea'
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
import { useCreateAdminCustomizationRuleMutation } from './api/use-create-admin-customization-rule-mutation'
import { useUpdateAdminCustomizationRuleMutation } from './api/use-update-admin-customization-rule-mutation'
import {
  mapAdminCustomizationAreaToUi,
  mapAdminCustomizationOptionToUi,
  mapAdminCustomizationRuleToFormValues,
  mapRuleFormValuesToInput,
} from './mappers/admin-customization-ui.mapper'
import type { AdminCustomizationArea, AdminCustomizationOption, AdminCustomizationRule } from './types'
import type { RuleFormValues } from './types/admin-customization-ui.types'
import { KNOWN_FILE_TYPES } from './types/admin-customization-ui.types'

type RuleEditorDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  productId: string
  productName: string
  rule: AdminCustomizationRule | null
  areas: AdminCustomizationArea[]
  options: AdminCustomizationOption[]
  presetAreaId?: string | null
  existingRules: AdminCustomizationRule[]
  onSaved?: () => void
}

function RuleEditorForm({
  initialValues,
  productName,
  isEditing,
  areas,
  options,
  existingRules,
  editingRuleId,
  onOpenChange,
  onSaved,
}: {
  initialValues: RuleFormValues
  productName: string
  isEditing: boolean
  areas: AdminCustomizationArea[]
  options: AdminCustomizationOption[]
  existingRules: AdminCustomizationRule[]
  editingRuleId: string | null
  onOpenChange: (open: boolean) => void
  onSaved?: () => void
}) {
  const createMutation = useCreateAdminCustomizationRuleMutation()
  const updateMutation = useUpdateAdminCustomizationRuleMutation()

  const [values, setValues] = useState<RuleFormValues>(initialValues)
  const [saveError, setSaveError] = useState<string | null>(null)

  const areaOptions = useMemo(() => areas.map(mapAdminCustomizationAreaToUi), [areas])
  const optionOptions = useMemo(() => options.map(mapAdminCustomizationOptionToUi), [options])

  const takenOptionIdsForArea = useMemo(() => {
    const set = new Set<string>()
    for (const r of existingRules) {
      if (r.areaId === values.areaId && r.id !== editingRuleId) {
        set.add(r.optionId)
      }
    }
    return set
  }, [existingRules, values.areaId, editingRuleId])

  const update = <K extends keyof RuleFormValues>(key: K, val: RuleFormValues[K]) => {
    setValues((prev) => ({ ...prev, [key]: val }))
  }

  const toggleFileType = (ft: string) => {
    setValues((prev) => {
      const has = prev.allowedFileTypes.includes(ft)
      return {
        ...prev,
        allowedFileTypes: has
          ? prev.allowedFileTypes.filter((t) => t !== ft)
          : [...prev.allowedFileTypes, ft],
      }
    })
  }

  const handleOptionChange = (optionId: string) => {
    const opt = options.find((o) => o.id === optionId)
    update('optionId', optionId)
    if (opt && !isEditing) {
      update('basePricePesos', Math.round(opt.basePriceCents / 100))
    }
  }

  const handleSubmit = async () => {
    if (!values.areaId) {
      setSaveError('Selecciona un área.')
      return
    }
    if (!values.optionId) {
      setSaveError('Selecciona una técnica.')
      return
    }
    if (values.basePricePesos < 0 || values.pricePerCmPesos < 0) {
      setSaveError('Los precios no pueden ser negativos.')
      return
    }

    setSaveError(null)

    try {
      const input = mapRuleFormValuesToInput(values)
      if (isEditing && editingRuleId) {
        await updateMutation.mutateAsync({ id: editingRuleId, input })
      } else {
        await createMutation.mutateAsync(input)
      }
      onSaved?.()
      onOpenChange(false)
    } catch (error) {
      const msg =
        error instanceof Error && /combinaci|duplicate|CONFLICT/i.test(error.message)
          ? 'Ya existe una regla para esta zona y técnica.'
          : 'No pudimos guardar la regla. Intenta de nuevo.'
      setSaveError(msg)
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin-customization-form]', error)
      }
    }
  }

  const isSaving = createMutation.isPending || updateMutation.isPending

  return (
    <>
      <div className="mt-6 space-y-6">
        <section className="space-y-3">
          <h4 className="font-sans text-sm font-semibold">Producto y zona</h4>
          <p className="font-serif text-sm text-muted-foreground">{productName}</p>
          <div className="space-y-2">
            <Label className="font-sans">Área *</Label>
            <Select value={values.areaId} onValueChange={(v) => update('areaId', v)}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Seleccionar área" />
              </SelectTrigger>
              <SelectContent>
                {areaOptions.map((a) => (
                  <SelectItem key={a.id} value={a.id}>
                    {a.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label className="font-sans">Técnica *</Label>
            <Select value={values.optionId} onValueChange={handleOptionChange}>
              <SelectTrigger className="font-sans">
                <SelectValue placeholder="Seleccionar técnica" />
              </SelectTrigger>
              <SelectContent>
                {optionOptions.map((o) => (
                  <SelectItem
                    key={o.id}
                    value={o.id}
                    disabled={!isEditing && takenOptionIdsForArea.has(o.id)}
                  >
                    {o.name}
                    {!isEditing && takenOptionIdsForArea.has(o.id) ? ' (ya existe)' : ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between rounded-lg border border-border p-3">
            <Label className="font-sans">Regla activa</Label>
            <Switch checked={values.enabled} onCheckedChange={(c) => update('enabled', c)} />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h4 className="font-sans text-sm font-semibold">Dimensiones y restricciones</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-xs">Ancho máx. (cm)</Label>
              <Input
                type="number"
                min={0}
                value={values.maxWidthCm}
                onChange={(e) => update('maxWidthCm', Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Alto máx. (cm)</Label>
              <Input
                type="number"
                min={0}
                value={values.maxHeightCm}
                onChange={(e) => update('maxHeightCm', Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-xs">Cantidad mínima</Label>
            <Input
              type="number"
              min={1}
              value={values.minQuantity}
              onChange={(e) => update('minQuantity', Math.max(1, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-2">
            <Label className="font-sans text-xs">Tipos de archivo</Label>
            <div className="flex flex-wrap gap-2">
              {KNOWN_FILE_TYPES.map((ft) => (
                <label
                  key={ft}
                  className="flex cursor-pointer items-center gap-1.5 rounded-md border border-border px-2 py-1"
                >
                  <Checkbox
                    checked={values.allowedFileTypes.includes(ft)}
                    onCheckedChange={() => toggleFileType(ft)}
                  />
                  <span className="font-mono text-xs uppercase">{ft}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-xs">Mensaje de validación</Label>
            <Textarea
              rows={2}
              value={values.validationMessage}
              onChange={(e) => update('validationMessage', e.target.value)}
              className="font-serif"
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-3">
          <h4 className="font-sans text-sm font-semibold">Precio y producción</h4>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="font-sans text-xs">Precio base (MXN)</Label>
              <Input
                type="number"
                min={0}
                value={values.basePricePesos}
                onChange={(e) => update('basePricePesos', Math.max(0, Number(e.target.value)))}
              />
            </div>
            <div className="space-y-1">
              <Label className="font-sans text-xs">Precio por cm² (MXN)</Label>
              <Input
                type="number"
                min={0}
                step={0.01}
                value={values.pricePerCmPesos}
                onChange={(e) => update('pricePerCmPesos', Math.max(0, Number(e.target.value)))}
              />
            </div>
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-xs">Días extra de producción</Label>
            <Input
              type="number"
              min={0}
              value={values.extraProductionDays}
              onChange={(e) =>
                update('extraProductionDays', Math.max(0, Number(e.target.value)))
              }
            />
          </div>
        </section>

        <Separator />

        <section className="space-y-2">
          <h4 className="font-sans text-sm font-semibold">Notas</h4>
          <Textarea
            rows={2}
            placeholder="Notas internas para el equipo..."
            value={values.notes}
            onChange={(e) => update('notes', e.target.value)}
            className="font-serif"
          />
        </section>

        {saveError ? (
          <Alert variant="destructive">
            <AlertDescription className="font-serif">{saveError}</AlertDescription>
          </Alert>
        ) : null}
      </div>

      <DialogFooter className="mt-6 gap-2">
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
            'Crear regla'
          )}
        </Button>
      </DialogFooter>
    </>
  )
}

export function RuleEditorDialog({
  open,
  onOpenChange,
  productId,
  productName,
  rule,
  areas,
  options,
  presetAreaId,
  existingRules,
  onSaved,
}: RuleEditorDialogProps) {
  const isEditing = !!rule

  const presetOption = options[0]
  const initialValues = useMemo(
    () =>
      mapAdminCustomizationRuleToFormValues(rule, productId, {
        areaId: presetAreaId ?? rule?.areaId,
        optionId: rule?.optionId,
        optionBasePriceCents: presetOption?.basePriceCents,
      }),
    [rule, productId, presetAreaId, presetOption?.basePriceCents],
  )

  const formKey = isEditing ? rule!.id : `new-${presetAreaId ?? 'x'}-${open}`

  const catalogReady = areas.length > 0 && options.length > 0

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="flex max-h-[min(92vh,900px)] max-w-[min(96vw,40rem)] flex-col gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-border px-6 py-4 text-left">
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar regla' : 'Nueva regla'}
          </DialogTitle>
          <DialogDescription className="font-serif">
            {productName} — define zona, técnica, precios y restricciones.
          </DialogDescription>
        </DialogHeader>

        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-4">
          {!catalogReady ? (
            <Alert variant="destructive" className="mt-4">
              <AlertDescription className="font-serif">
                No pudimos cargar áreas u opciones. Cierra y vuelve a intentar.
              </AlertDescription>
            </Alert>
          ) : (
            <RuleEditorForm
              key={formKey}
              initialValues={initialValues}
              productName={productName}
              isEditing={isEditing}
              areas={areas}
              options={options}
              existingRules={existingRules}
              editingRuleId={rule?.id ?? null}
              onOpenChange={onOpenChange}
              onSaved={onSaved}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
