'use client'

import { Loader2 } from 'lucide-react'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { CustomizationRuleCardUi } from './types/admin-customization-ui.types'
import type { PricingPreviewUiState } from './types/admin-customization-ui.types'

type PricingPreviewCardProps = {
  rules: CustomizationRuleCardUi[]
  selectedRuleId: string | null
  onSelectRule: (ruleId: string) => void
  widthCm: number
  heightCm: number
  onWidthChange: (v: number) => void
  onHeightChange: (v: number) => void
  preview: PricingPreviewUiState | null
  isLoading?: boolean
  isError?: boolean
}

export function PricingPreviewCard({
  rules,
  selectedRuleId,
  onSelectRule,
  widthCm,
  heightCm,
  onWidthChange,
  onHeightChange,
  preview,
  isLoading,
  isError,
}: PricingPreviewCardProps) {
  const selectedRule = rules.find((r) => r.id === selectedRuleId) ?? null

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base">Vista previa de precio</CardTitle>
        <p className="font-serif text-xs text-muted-foreground">
          Cálculo v1 — no incluye matrices ni descuentos por cantidad.
        </p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label className="font-sans text-xs">Zona y técnica</Label>
          <Select
            value={selectedRuleId ?? 'none'}
            onValueChange={(v) => onSelectRule(v === 'none' ? '' : v)}
          >
            <SelectTrigger className="font-sans">
              <SelectValue placeholder="Seleccionar regla" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="none">—</SelectItem>
              {rules.map((r) => (
                <SelectItem key={r.id} value={r.id}>
                  {r.areaName} · {r.optionName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div className="space-y-1">
            <Label className="font-sans text-xs">Ancho (cm)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={widthCm}
              onChange={(e) => onWidthChange(Math.max(0, Number(e.target.value)))}
            />
          </div>
          <div className="space-y-1">
            <Label className="font-sans text-xs">Alto (cm)</Label>
            <Input
              type="number"
              min={0}
              step={0.5}
              value={heightCm}
              onChange={(e) => onHeightChange(Math.max(0, Number(e.target.value)))}
            />
          </div>
        </div>

        {!selectedRule ? (
          <p className="rounded-lg bg-secondary p-4 font-serif text-sm text-muted-foreground">
            Selecciona una zona y técnica para calcular el precio.
          </p>
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
          </div>
        ) : isError ? (
          <p className="font-serif text-sm text-destructive">
            No pudimos calcular el precio. Verifica que la regla exista.
          </p>
        ) : preview ? (
          <div className="space-y-3 rounded-lg bg-secondary p-4">
            <p className="font-sans text-xs text-muted-foreground">
              Ejemplo: {preview.sampleDimensions} en {selectedRule.areaName} (
              {selectedRule.optionName})
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="font-serif text-muted-foreground">Precio base</span>
                <span className="font-mono">{preview.basePriceFormatted}</span>
              </div>
              <div className="flex justify-between">
                <span className="font-serif text-muted-foreground">Factor por área</span>
                <span className="font-mono">{preview.sizeFactorFormatted}</span>
              </div>
              <div className="flex justify-between border-t border-border pt-2 font-semibold">
                <span className="font-sans">Extra total</span>
                <span className="font-mono text-primary">{preview.totalExtraFormatted}</span>
              </div>
            </div>
            <div className="flex justify-between text-sm">
              <span className="font-serif text-muted-foreground">Días extra producción</span>
              <span className="font-mono">+{preview.extraProductionDays}</span>
            </div>
            <div className="rounded-md border border-border p-2">
              <p className="font-sans text-xs text-muted-foreground">Fórmula</p>
              <p className="font-mono text-xs">{preview.formulaLabel}</p>
            </div>
          </div>
        ) : null}
      </CardContent>
    </Card>
  )
}
