'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { CustomizationAreaRule } from '@/lib/types'

interface PricingPreviewProps {
  rule: CustomizationAreaRule | null
  sampleWidth?: number
  sampleHeight?: number
}

export function PricingPreview({
  rule,
  sampleWidth = 8,
  sampleHeight = 6,
}: PricingPreviewProps) {
  if (!rule) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="font-sans text-base">Vista Previa de Precios</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="font-serif text-sm text-muted-foreground">
            Selecciona una zona para ver el calculo de precios.
          </p>
        </CardContent>
      </Card>
    )
  }

  // Calculate pricing
  const basePrice = rule.basePrice
  const areaSize = Math.min(sampleWidth, rule.maxWidth) * Math.min(sampleHeight, rule.maxHeight)
  const areaPrice = areaSize * rule.pricePerCm
  const totalExtraCost = basePrice + areaPrice

  return (
    <Card>
      <CardHeader>
        <CardTitle className="font-sans text-base">Vista Previa de Precios</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="rounded-lg bg-secondary p-4">
          <p className="mb-2 font-sans text-xs font-medium text-muted-foreground">
            Ejemplo: Diseno de {sampleWidth}x{sampleHeight} cm en {rule.areaName}
          </p>
          
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="font-serif text-muted-foreground">Precio base personalizacion</span>
              <span className="font-mono">${basePrice.toFixed(2)}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="font-serif text-muted-foreground">
                Precio por area ({areaSize} cm² × ${rule.pricePerCm})
              </span>
              <span className="font-mono">${areaPrice.toFixed(2)}</span>
            </div>
            <div className="border-t border-border pt-2">
              <div className="flex items-center justify-between font-semibold">
                <span className="font-sans">Costo extra total</span>
                <span className="font-mono text-primary">${totalExtraCost.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Production time */}
        <div className="flex items-center justify-between text-sm">
          <span className="font-serif text-muted-foreground">Tiempo extra produccion</span>
          <span className="font-mono">+{rule.productionExtraDays} dias</span>
        </div>

        {/* Formula explanation */}
        <div className="rounded-lg border border-border p-3">
          <p className="font-sans text-xs font-medium text-muted-foreground mb-1">Formula</p>
          <p className="font-mono text-xs text-foreground">
            Total = Base + (Ancho × Alto × Precio/cm)
          </p>
          <p className="font-mono text-xs text-muted-foreground mt-1">
            ${basePrice} + ({sampleWidth} × {sampleHeight} × ${rule.pricePerCm}) = ${totalExtraCost.toFixed(2)}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
