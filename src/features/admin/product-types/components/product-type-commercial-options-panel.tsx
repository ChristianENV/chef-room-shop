'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'
import { isProductOptionsEnabled } from '@/src/config/features'
import { ProductCommercialOptionsEditor } from '@/src/features/admin/products/components/product-commercial-options-tab'
import { useAdminProductTypesQuery } from '@/src/features/admin/product-types/api/use-admin-product-types-query'
import type { AdminProductType } from '@/src/features/admin/product-types/types'

export function ProductTypeCommercialOptionsPanel() {
  const productOptionsEnabled = isProductOptionsEnabled()
  const [selectedTypeId, setSelectedTypeId] = useState<string | null>(null)

  const productTypesQuery = useAdminProductTypesQuery(
    { includeInactive: true },
    { enabled: productOptionsEnabled },
  )

  const productTypes = useMemo(() => {
    const items = productTypesQuery.data ?? []
    return [...items].sort(
      (a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0) || a.nameEs.localeCompare(b.nameEs),
    )
  }, [productTypesQuery.data])

  const selectedType = useMemo(
    () => productTypes.find((type) => type.id === selectedTypeId) ?? null,
    [productTypes, selectedTypeId],
  )

  if (!productOptionsEnabled) {
    return (
      <Alert data-testid="admin-product-type-options-disabled">
        <AlertDescription className="font-serif">
          Las opciones comerciales están desactivadas globalmente. Activa{' '}
          <code className="font-mono text-xs">NEXT_PUBLIC_ENABLE_PRODUCT_OPTIONS</code> para
          administrar opciones por tipo de producto.
        </AlertDescription>
      </Alert>
    )
  }

  if (productTypesQuery.isError) {
    return (
      <Alert variant="destructive" data-testid="admin-product-type-options-types-error">
        <AlertDescription className="font-serif">
          No pudimos cargar las categorías.{' '}
          <Button
            type="button"
            variant="link"
            className="h-auto p-0 font-serif"
            onClick={() => void productTypesQuery.refetch()}
          >
            Reintentar
          </Button>
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div
      className="grid gap-6 lg:grid-cols-[minmax(220px,280px)_1fr]"
      data-testid="admin-product-type-options-panel"
    >
      <div className="space-y-3">
        <div>
          <h2 className="font-sans text-sm font-medium text-foreground">Tipo de producto</h2>
          <p className="font-serif text-xs text-muted-foreground">
            Selecciona una categoría para ver o editar sus opciones comerciales globales.
          </p>
        </div>

        {productTypesQuery.isPending ? (
          <p className="font-serif text-sm text-muted-foreground">Cargando categorías…</p>
        ) : productTypes.length === 0 ? (
          <div className="rounded-lg border border-dashed border-border p-4 text-center">
            <p className="font-serif text-sm text-muted-foreground">
              No hay categorías configuradas.
            </p>
            <Button variant="link" className="mt-2 font-serif" asChild>
              <Link href={routes.adminCategories}>Ir a Categorías</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-2">
            {productTypes.map((type) => (
              <ProductTypeOptionSelectorButton
                key={type.id}
                type={type}
                selected={selectedTypeId === type.id}
                onSelect={() => setSelectedTypeId(type.id)}
              />
            ))}
          </div>
        )}
      </div>

      <div className="min-w-0">
        {!selectedType ? (
          <div
            className="rounded-lg border border-dashed border-border p-8 text-center"
            data-testid="admin-product-type-options-select-prompt"
          >
            <p className="font-serif text-sm text-muted-foreground">
              Selecciona un tipo de producto para administrar sus opciones comerciales.
            </p>
          </div>
        ) : (
          <Card>
            <CardContent className="pt-6">
              <div className="mb-4 space-y-1">
                <h3 className="font-sans text-lg font-semibold">{selectedType.nameEs}</h3>
                <p className="font-mono text-xs text-muted-foreground">{selectedType.slug}</p>
                <p className="font-serif text-sm text-muted-foreground">
                  Estas opciones aplican a todos los productos de este tipo. Un producto puede
                  definir un grupo con el mismo slug para reemplazar la configuración global.
                </p>
              </div>
              <ProductCommercialOptionsEditor
                scope={{ kind: 'productType', productTypeId: selectedType.id }}
                emptyStateMessage="Este tipo de producto todavía no tiene opciones comerciales."
                scopeHint={null}
              />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

type ProductTypeOptionSelectorButtonProps = {
  type: AdminProductType
  selected: boolean
  onSelect: () => void
}

function ProductTypeOptionSelectorButton({
  type,
  selected,
  onSelect,
}: ProductTypeOptionSelectorButtonProps) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        'w-full rounded-lg border px-3 py-2 text-left transition-colors',
        selected
          ? 'border-primary bg-primary/5'
          : 'border-border bg-card hover:border-muted-foreground/40',
        !type.isActive && 'opacity-70',
      )}
      data-testid={`admin-product-type-option-selector-${type.slug}`}
    >
      <span className="block font-sans text-sm font-medium">{type.nameEs}</span>
      <span className="block font-mono text-xs text-muted-foreground">{type.slug}</span>
    </button>
  )
}
