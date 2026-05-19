'use client'

import { cn } from '@/lib/utils'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Pencil } from 'lucide-react'
import type { CustomizationAreaRule, CustomizationType } from '@/lib/types'

interface CustomizationAreaCardProps {
  rule: CustomizationAreaRule
  isSelected: boolean
  onSelect: () => void
  onToggleEnabled: (enabled: boolean) => void
  onEdit: () => void
}

const customizationTypeLabels: Record<CustomizationType, string> = {
  bordado: 'Bordado',
  estampado: 'Estampado',
  patch: 'Patch',
  logo: 'Logo',
  texto: 'Texto',
}

export function CustomizationAreaCard({
  rule,
  isSelected,
  onSelect,
  onToggleEnabled,
  onEdit,
}: CustomizationAreaCardProps) {
  return (
    <Card
      className={cn(
        'cursor-pointer transition-all',
        isSelected && 'ring-2 ring-primary',
        !rule.enabled && 'opacity-60'
      )}
      onClick={onSelect}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="font-sans text-base font-semibold">
          {rule.areaName}
        </CardTitle>
        <div className="flex items-center gap-2">
          <Switch
            checked={rule.enabled}
            onCheckedChange={(checked) => {
              onToggleEnabled(checked)
            }}
            onClick={(e) => e.stopPropagation()}
            aria-label={`${rule.enabled ? 'Desactivar' : 'Activar'} ${rule.areaName}`}
          />
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={(e) => {
              e.stopPropagation()
              onEdit()
            }}
          >
            <Pencil className="h-4 w-4" />
            <span className="sr-only">Editar regla</span>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Allowed types */}
        <div>
          <p className="mb-1.5 font-sans text-xs font-medium text-muted-foreground">
            Opciones permitidas
          </p>
          <div className="flex flex-wrap gap-1">
            {rule.allowedTypes.map((type) => (
              <Badge key={type} variant="secondary" className="text-xs">
                {customizationTypeLabels[type]}
              </Badge>
            ))}
          </div>
        </div>

        {/* Dimensions */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-sans text-xs text-muted-foreground">Max Ancho</p>
            <p className="font-mono text-foreground">{rule.maxWidth} cm</p>
          </div>
          <div>
            <p className="font-sans text-xs text-muted-foreground">Max Alto</p>
            <p className="font-mono text-foreground">{rule.maxHeight} cm</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="grid grid-cols-2 gap-2 text-sm">
          <div>
            <p className="font-sans text-xs text-muted-foreground">Precio Base</p>
            <p className="font-mono font-semibold text-foreground">${rule.basePrice}</p>
          </div>
          <div>
            <p className="font-sans text-xs text-muted-foreground">Precio/cm</p>
            <p className="font-mono text-foreground">${rule.pricePerCm}</p>
          </div>
        </div>

        {/* Production time */}
        <div>
          <p className="font-sans text-xs text-muted-foreground">Dias extra produccion</p>
          <p className="font-mono text-foreground">+{rule.productionExtraDays} dias</p>
        </div>

        {/* Notes */}
        {rule.notes && (
          <div className="border-t border-border pt-2">
            <p className="font-serif text-xs italic text-muted-foreground">
              {rule.notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
