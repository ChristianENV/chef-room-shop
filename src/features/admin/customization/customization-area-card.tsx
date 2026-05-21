'use client'

import { MoreHorizontal, Pencil, Plus, Trash2 } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Switch } from '@/components/ui/switch'
import type { CustomizationAreaGroupUi, CustomizationRuleCardUi } from './types/admin-customization-ui.types'

type CustomizationAreaCardProps = {
  group: CustomizationAreaGroupUi
  isSelected: boolean
  onSelectArea: () => void
  onAddRule: () => void
  onEditRule: (rule: CustomizationRuleCardUi) => void
  onToggleRule: (rule: CustomizationRuleCardUi, enabled: boolean) => void
  onDeleteRule: (rule: CustomizationRuleCardUi) => void
  togglingRuleId?: string | null
}

function RuleRow({
  rule,
  onEdit,
  onToggle,
  onDelete,
  isToggling,
}: {
  rule: CustomizationRuleCardUi
  onEdit: () => void
  onToggle: (enabled: boolean) => void
  onDelete: () => void
  isToggling?: boolean
}) {
  return (
    <div
      className={cn(
        'flex items-start justify-between gap-2 rounded-md border border-border bg-secondary/30 p-3',
        !rule.enabled && 'opacity-70',
      )}
    >
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-sans text-sm font-medium">{rule.optionName}</span>
          <Badge variant={rule.statusBadgeVariant} className="text-xs">
            {rule.statusLabel}
          </Badge>
        </div>
        <p className="font-mono text-xs text-muted-foreground">
          {rule.basePriceFormatted}
          {rule.dimensionsLabel ? ` · ${rule.dimensionsLabel}` : ''}
        </p>
        {rule.allowedFileTypes.length > 0 ? (
          <div className="flex flex-wrap gap-1">
            {rule.allowedFileTypes.map((ft) => (
              <Badge key={ft} variant="outline" className="font-mono text-[10px] uppercase">
                {ft}
              </Badge>
            ))}
          </div>
        ) : null}
      </div>
      <div className="flex shrink-0 items-center gap-1">
        <Switch
          checked={rule.enabled}
          disabled={isToggling}
          onCheckedChange={onToggle}
          aria-label={`Activar ${rule.optionName}`}
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onEdit}>
              <Pencil className="mr-2 h-4 w-4" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onDelete} className="text-destructive focus:text-destructive">
              <Trash2 className="mr-2 h-4 w-4" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  )
}

export function CustomizationAreaCard({
  group,
  isSelected,
  onSelectArea,
  onAddRule,
  onEditRule,
  onToggleRule,
  onDeleteRule,
  togglingRuleId,
}: CustomizationAreaCardProps) {
  const isEmpty = group.ruleCount === 0

  return (
    <Card
      className={cn(
        'transition-all',
        isSelected && 'ring-2 ring-primary',
        isEmpty && 'border-dashed',
      )}
    >
      <CardHeader
        className="cursor-pointer flex-row items-start justify-between space-y-0 pb-2"
        onClick={onSelectArea}
      >
        <div>
          <CardTitle className="font-sans text-base font-semibold">{group.areaName}</CardTitle>
          <p className="mt-1 font-serif text-xs text-muted-foreground">
            {isEmpty
              ? 'Sin reglas configuradas'
              : `${group.ruleCount} regla${group.ruleCount > 1 ? 's' : ''} · ${group.activeCount} activa${group.activeCount !== 1 ? 's' : ''}`}
          </p>
        </div>
        {group.hasAnyEnabled ? (
          <Badge className="shrink-0 font-sans text-xs">Activa</Badge>
        ) : group.ruleCount > 0 ? (
          <Badge variant="secondary" className="shrink-0 font-sans text-xs">
            Inactiva
          </Badge>
        ) : null}
      </CardHeader>
      <CardContent className="space-y-3" onClick={(e) => e.stopPropagation()}>
        {!isEmpty ? (
          <>
            <div className="flex flex-wrap gap-1">
              {group.optionLabels.map((label) => (
                <Badge key={label} variant="secondary" className="text-xs">
                  {label}
                </Badge>
              ))}
            </div>
            <p className="font-sans text-sm text-muted-foreground">
              {group.minPriceFormatted}
              {group.dimensionsSummary ? ` · ${group.dimensionsSummary}` : ''}
            </p>
            <div className="space-y-2">
              {group.rules.map((rule) => (
                <RuleRow
                  key={rule.id}
                  rule={rule}
                  onEdit={() => onEditRule(rule)}
                  onToggle={(enabled) => onToggleRule(rule, enabled)}
                  onDelete={() => onDeleteRule(rule)}
                  isToggling={togglingRuleId === rule.id}
                />
              ))}
            </div>
          </>
        ) : (
          <p className="font-serif text-sm text-muted-foreground text-center py-2">
            Configura técnicas y precios para esta zona.
          </p>
        )}
        <Button variant="outline" size="sm" className="w-full" onClick={onAddRule}>
          <Plus className="mr-1 h-4 w-4" />
          Agregar regla
        </Button>
      </CardContent>
    </Card>
  )
}
