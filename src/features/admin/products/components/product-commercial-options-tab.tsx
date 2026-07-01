'use client'

import { useMemo, useState } from 'react'
import { Archive, Loader2, Pencil, Plus } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { formatCurrencyMXN } from '@/src/lib/formatters'

import {
  useAdminProductOptionGroupsQuery,
  useArchiveAdminProductOptionGroupMutation,
  useArchiveAdminProductOptionValueMutation,
} from '../api/use-admin-product-options'
import {
  mapProductOptionGroupToFormValues,
  mapProductOptionValueToFormValues,
  PRODUCT_OPTION_INPUT_TYPE_LABELS,
} from '../mappers/admin-product-options-ui.mapper'
import type {
  AdminProductOptionGroup,
  AdminProductOptionScope,
  AdminProductOptionValue,
} from '../types/admin-product-options.types'
import { ArchiveProductOptionDialog } from './archive-product-option-dialog'
import { ProductOptionGroupFormDialog } from './product-option-group-form-dialog'
import { ProductOptionValueFormDialog } from './product-option-value-form-dialog'

type ProductCommercialOptionsTabProps = {
  productId: string | null
  disabled?: boolean
}

type ProductCommercialOptionsEditorProps = {
  scope: AdminProductOptionScope
  disabled?: boolean
  emptyStateMessage?: string
  scopeHint?: string | null
}

type ArchiveTarget =
  | { type: 'group'; entity: AdminProductOptionGroup }
  | { type: 'value'; entity: AdminProductOptionValue; groupName: string }

export function ProductCommercialOptionsTab({
  productId,
  disabled = false,
}: ProductCommercialOptionsTabProps) {
  if (!productId) {
    return (
      <div
        className="rounded-lg border border-dashed border-border p-8 text-center"
        data-testid="admin-product-options-create-mode"
      >
        <p className="font-serif text-sm text-muted-foreground">
          Guarda el producto primero para administrar opciones comerciales.
        </p>
      </div>
    )
  }

  return (
    <ProductCommercialOptionsEditor
      scope={{ kind: 'product', productId }}
      disabled={disabled}
      emptyStateMessage="Este producto todavía no tiene opciones comerciales."
      scopeHint="Las opciones de producto específico pueden reemplazar un grupo del mismo slug definido a nivel tipo."
    />
  )
}

export function ProductCommercialOptionsEditor({
  scope,
  disabled = false,
  emptyStateMessage = 'Todavía no hay opciones comerciales configuradas.',
  scopeHint = null,
}: ProductCommercialOptionsEditorProps) {
  const groupsQuery = useAdminProductOptionGroupsQuery({
    scope,
    includeInactive: true,
    enabled: !disabled,
  })

  const archiveGroupMutation = useArchiveAdminProductOptionGroupMutation(scope)
  const archiveValueMutation = useArchiveAdminProductOptionValueMutation(scope)

  const [groupDialogOpen, setGroupDialogOpen] = useState(false)
  const [editingGroup, setEditingGroup] = useState<AdminProductOptionGroup | null>(null)

  const [valueDialogOpen, setValueDialogOpen] = useState(false)
  const [valueDialogGroup, setValueDialogGroup] = useState<AdminProductOptionGroup | null>(null)
  const [editingValue, setEditingValue] = useState<AdminProductOptionValue | null>(null)

  const [archiveTarget, setArchiveTarget] = useState<ArchiveTarget | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const activeGroups = useMemo(() => {
    const groups = groupsQuery.data?.groups ?? []
    return [...groups].sort((a, b) => a.sortOrder - b.sortOrder || a.name.localeCompare(b.name))
  }, [groupsQuery.data?.groups])

  const nextGroupSortOrder =
    activeGroups.length > 0 ? Math.max(...activeGroups.map((g) => g.sortOrder)) + 1 : 0

  const openCreateGroup = () => {
    setEditingGroup(null)
    setGroupDialogOpen(true)
  }

  const openEditGroup = (group: AdminProductOptionGroup) => {
    setEditingGroup(group)
    setGroupDialogOpen(true)
  }

  const openCreateValue = (group: AdminProductOptionGroup) => {
    setValueDialogGroup(group)
    setEditingValue(null)
    setValueDialogOpen(true)
  }

  const openEditValue = (group: AdminProductOptionGroup, value: AdminProductOptionValue) => {
    setValueDialogGroup(group)
    setEditingValue(value)
    setValueDialogOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (!archiveTarget) return

    setArchiveError(null)

    try {
      if (archiveTarget.type === 'group') {
        await archiveGroupMutation.mutateAsync({ id: archiveTarget.entity.id })
      } else {
        await archiveValueMutation.mutateAsync({ id: archiveTarget.entity.id })
      }
      setArchiveTarget(null)
    } catch (error) {
      const message =
        error instanceof Error ? error.message : 'No pudimos archivar la opción comercial.'
      setArchiveError(message)
    }
  }

  const isArchiving = archiveGroupMutation.isPending || archiveValueMutation.isPending

  if (groupsQuery.isPending) {
    return (
      <div
        className="flex items-center justify-center py-16"
        data-testid="admin-product-options-loading"
      >
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  if (groupsQuery.isError) {
    return (
      <Alert variant="destructive" data-testid="admin-product-options-error">
        <AlertDescription className="font-serif">
          No pudimos cargar las opciones comerciales. Intenta de nuevo.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-4" data-testid="admin-product-options-tab">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h4 className="font-sans font-medium">Opciones comerciales</h4>
          <p className="font-serif text-sm text-muted-foreground">
            Configuración de add-ons (dry fit, bolsas, bordado, etc.). No es personalización del
            customizer.
          </p>
          {scopeHint ? (
            <p className="mt-1 font-serif text-xs text-muted-foreground">{scopeHint}</p>
          ) : null}
        </div>
        <Button
          type="button"
          size="sm"
          onClick={openCreateGroup}
          disabled={disabled}
          data-testid="admin-product-options-add-group"
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar grupo de opciones
        </Button>
      </div>

      {activeGroups.length === 0 ? (
        <div
          className="rounded-lg border border-dashed border-border p-8 text-center"
          data-testid="admin-product-options-empty"
        >
          <p className="font-serif text-sm text-muted-foreground">{emptyStateMessage}</p>
        </div>
      ) : (
        <div className="space-y-4">
          {activeGroups.map((group) => (
            <ProductOptionGroupCard
              key={group.id}
              group={group}
              disabled={disabled}
              onEditGroup={() => openEditGroup(group)}
              onArchiveGroup={() => setArchiveTarget({ type: 'group', entity: group })}
              onAddValue={() => openCreateValue(group)}
              onEditValue={(value) => openEditValue(group, value)}
              onArchiveValue={(value) =>
                setArchiveTarget({ type: 'value', entity: value, groupName: group.name })
              }
            />
          ))}
        </div>
      )}

      <ProductOptionGroupFormDialog
        open={groupDialogOpen}
        onOpenChange={setGroupDialogOpen}
        scope={scope}
        editingGroup={editingGroup}
        initialValues={mapProductOptionGroupToFormValues(editingGroup, nextGroupSortOrder)}
      />

      {valueDialogGroup ? (
        <ProductOptionValueFormDialog
          open={valueDialogOpen}
          onOpenChange={setValueDialogOpen}
          scope={scope}
          optionGroupId={valueDialogGroup.id}
          groupName={valueDialogGroup.name}
          editingValue={editingValue}
          initialValues={mapProductOptionValueToFormValues(
            editingValue,
            editingValue
              ? editingValue.sortOrder
              : valueDialogGroup.values.length > 0
                ? Math.max(...valueDialogGroup.values.map((v) => v.sortOrder)) + 1
                : 0,
          )}
        />
      ) : null}

      <ArchiveProductOptionDialog
        open={!!archiveTarget}
        onOpenChange={(open) => {
          if (!open) {
            setArchiveTarget(null)
            setArchiveError(null)
          }
        }}
        entityType={archiveTarget?.type ?? 'group'}
        entityLabel={
          archiveTarget?.type === 'group'
            ? archiveTarget.entity.name
            : archiveTarget?.type === 'value'
              ? archiveTarget.entity.label
              : null
        }
        onConfirm={() => void handleArchiveConfirm()}
        isArchiving={isArchiving}
        errorMessage={archiveError}
      />
    </div>
  )
}

type ProductOptionGroupCardProps = {
  group: AdminProductOptionGroup
  disabled: boolean
  onEditGroup: () => void
  onArchiveGroup: () => void
  onAddValue: () => void
  onEditValue: (value: AdminProductOptionValue) => void
  onArchiveValue: (value: AdminProductOptionValue) => void
}

function ProductOptionGroupCard({
  group,
  disabled,
  onEditGroup,
  onArchiveGroup,
  onAddValue,
  onEditValue,
  onArchiveValue,
}: ProductOptionGroupCardProps) {
  const sortedValues = [...group.values].sort(
    (a, b) => a.sortOrder - b.sortOrder || a.label.localeCompare(b.label),
  )

  const scopeLabel = group.productTypeId && !group.productId ? 'Tipo de producto' : 'Producto'

  return (
    <Card
      className={cn(!group.isActive && 'opacity-70')}
      data-testid={`admin-product-option-group-${group.slug}`}
    >
      <CardHeader className="flex flex-row items-start justify-between gap-3 space-y-0 pb-3">
        <div className="space-y-1">
          <CardTitle className="font-sans text-base">{group.name}</CardTitle>
          <div className="flex flex-wrap items-center gap-2">
            <span className="font-mono text-xs text-muted-foreground">{group.slug}</span>
            <Badge variant="outline" className="font-sans text-xs">
              {scopeLabel}
            </Badge>
            <Badge variant="secondary" className="font-sans text-xs">
              {PRODUCT_OPTION_INPUT_TYPE_LABELS[group.inputType]}
            </Badge>
            {group.isRequired ? (
              <Badge variant="outline" className="font-sans text-xs">
                Obligatorio
              </Badge>
            ) : null}
            <Badge
              variant="outline"
              className={cn(
                'font-sans text-xs',
                group.isActive
                  ? 'border-success/30 bg-success/10 text-success'
                  : 'border-border bg-muted text-muted-foreground',
              )}
            >
              {group.isActive ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
          {group.description ? (
            <p className="font-serif text-sm text-muted-foreground">{group.description}</p>
          ) : null}
        </div>
        <div className="flex shrink-0 gap-1">
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onEditGroup}
            disabled={disabled}
            aria-label={`Editar grupo ${group.name}`}
          >
            <Pencil className="h-4 w-4" />
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={onArchiveGroup}
            disabled={disabled}
            aria-label={`Archivar grupo ${group.name}`}
          >
            <Archive className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {sortedValues.length === 0 ? (
          <p className="font-serif text-sm text-muted-foreground">Sin valores configurados.</p>
        ) : (
          <ul className="divide-y divide-border rounded-lg border border-border">
            {sortedValues.map((value) => (
              <li
                key={value.id}
                className={cn(
                  'flex flex-wrap items-center justify-between gap-2 px-3 py-2',
                  !value.isActive && 'opacity-60',
                )}
                data-testid={`admin-product-option-value-${value.slug}`}
              >
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-sans text-sm font-medium">{value.label}</span>
                    <span className="font-mono text-xs text-muted-foreground">{value.slug}</span>
                    {value.isDefault ? (
                      <Badge variant="outline" className="font-sans text-xs">
                        Predeterminado
                      </Badge>
                    ) : null}
                    {!value.isActive ? (
                      <Badge variant="outline" className="font-sans text-xs text-muted-foreground">
                        Inactivo
                      </Badge>
                    ) : null}
                  </div>
                  {value.description ? (
                    <p className="font-serif text-xs text-muted-foreground">{value.description}</p>
                  ) : null}
                </div>
                <div className="flex items-center gap-2">
                  <span className="font-sans text-sm tabular-nums">
                    {value.priceDeltaCents > 0
                      ? `+${formatCurrencyMXN(value.priceDeltaCents / 100)}`
                      : 'Sin cargo'}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onEditValue(value)}
                    disabled={disabled}
                    aria-label={`Editar valor ${value.label}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => onArchiveValue(value)}
                    disabled={disabled}
                    aria-label={`Archivar valor ${value.label}`}
                  >
                    <Archive className="h-4 w-4" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onAddValue}
          disabled={disabled}
          data-testid={`admin-product-options-add-value-${group.slug}`}
        >
          <Plus className="mr-2 h-4 w-4" />
          Agregar valor
        </Button>
      </CardContent>
    </Card>
  )
}
