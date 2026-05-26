'use client'

import { useDeferredValue, useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  ProductsToolbar,
  ProductsTable,
  ProductFormDialog,
  ArchiveProductDialog,
} from '@/src/features/admin/products'
import { AdminProductsTableSkeleton } from '@/src/features/admin/products/components/admin-products-loading'
import { AdminProductsError } from '@/src/features/admin/products/components/admin-products-error'
import { AdminProductsEmpty } from '@/src/features/admin/products/components/admin-products-empty'
import { useAdminProductsQuery } from '@/src/features/admin/products/api/use-admin-products-query'
import { useAdminProductFormOptionsQuery } from '@/src/features/admin/products/api/use-admin-product-form-options-query'
import { useArchiveAdminProductMutation } from '@/src/features/admin/products/api/use-archive-admin-product-mutation'
import { useDuplicateAdminProductMutation } from '@/src/features/admin/products/api/use-duplicate-admin-product-mutation'
import { useUpdateAdminProductStatusMutation } from '@/src/features/admin/products/api/use-update-admin-product-status-mutation'
import {
  buildAdminProductsListVariables,
  mapAdminProductToTableRow,
  mapFormOptionsToProductTypeSlugOptions,
} from '@/src/features/admin/products/mappers/admin-products-ui.mapper'
import type { AdminProductTableRow } from '@/src/features/admin/products/types/admin-products-ui.types'
import type { AdminProductStatusUi } from '@/src/features/admin/products/types/admin-products-ui.types'

export default function AdminProductsPage() {
  const [search, setSearch] = useState('')
  const deferredSearch = useDeferredValue(search)
  const [productTypeSlug, setProductTypeSlug] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [customizableOnly, setCustomizableOnly] = useState(false)
  const [sortBy, setSortBy] = useState('updated')

  const [selectedIds, setSelectedIds] = useState<string[]>([])
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingProductId, setEditingProductId] = useState<string | null>(null)

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archivingRow, setArchivingRow] = useState<AdminProductTableRow | null>(null)

  const [actionProductId, setActionProductId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const listVariables = useMemo(
    () =>
      buildAdminProductsListVariables({
        search: deferredSearch,
        productTypeSlug,
        statusFilter,
        customizableOnly,
        includeArchived: false,
        sortBy,
      }),
    [deferredSearch, productTypeSlug, statusFilter, customizableOnly, sortBy],
  )

  const productsQuery = useAdminProductsQuery(listVariables)
  const formOptionsQuery = useAdminProductFormOptionsQuery()
  const archiveMutation = useArchiveAdminProductMutation()
  const duplicateMutation = useDuplicateAdminProductMutation()
  const updateStatusMutation = useUpdateAdminProductStatusMutation()

  const productTypeFilterOptions = useMemo(
    () =>
      formOptionsQuery.data
        ? mapFormOptionsToProductTypeSlugOptions(formOptionsQuery.data)
        : [],
    [formOptionsQuery.data],
  )

  const tableRows = useMemo(
    () => (productsQuery.data?.items ?? []).map(mapAdminProductToTableRow),
    [productsQuery.data?.items],
  )

  const hasActiveFilters =
    search.trim().length > 0 ||
    productTypeSlug !== 'all' ||
    statusFilter !== 'all' ||
    customizableOnly

  const clearFilters = () => {
    setSearch('')
    setProductTypeSlug('all')
    setStatusFilter('all')
    setCustomizableOnly(false)
  }

  const handleCreateNew = () => {
    setEditingProductId(null)
    setDrawerOpen(true)
  }

  const handleEdit = (row: AdminProductTableRow) => {
    setEditingProductId(row.id)
    setDrawerOpen(true)
  }

  const runAction = async (productId: string, action: () => Promise<unknown>) => {
    setActionProductId(productId)
    setFeedback(null)
    try {
      await action()
    } catch (error) {
      setFeedback('No pudimos completar la acción. Intenta de nuevo.')
      if (process.env.NODE_ENV === 'development') {
        console.error('[admin-products]', error)
      }
    } finally {
      setActionProductId(null)
    }
  }

  const handleDuplicate = (row: AdminProductTableRow) => {
    const confirmed = window.confirm(
      'Se creará una copia en estado borrador. ¿Continuar?',
    )
    if (!confirmed) return

    void runAction(row.id, async () => {
      const duplicated = await duplicateMutation.mutateAsync(row.id)
      setFeedback(`Producto duplicado: ${duplicated.name}`)
      setEditingProductId(duplicated.id)
      setDrawerOpen(true)
    })
  }

  const handleArchiveClick = (row: AdminProductTableRow) => {
    setArchivingRow(row)
    setArchiveDialogOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (!archivingRow) return
    try {
      await archiveMutation.mutateAsync(archivingRow.id)
      setFeedback(`"${archivingRow.name}" archivado.`)
      setArchiveDialogOpen(false)
      setArchivingRow(null)
    } catch (error) {
      setFeedback('No pudimos archivar el producto.')
      if (process.env.NODE_ENV === 'development') console.error(error)
    }
  }

  const handleStatusChange = (row: AdminProductTableRow, status: AdminProductStatusUi) => {
    void runAction(row.id, () =>
      updateStatusMutation.mutateAsync({ id: row.id, status }),
    )
  }

  const handleSelectAll = (checked: boolean) => {
    setSelectedIds(checked ? tableRows.map((r) => r.id) : [])
  }

  const handleSelectOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => (checked ? [...prev, id] : prev.filter((i) => i !== id)))
  }

  const total = productsQuery.data?.total ?? 0
  const isEmptyCatalog = !productsQuery.isPending && total === 0 && !hasActiveFilters

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Productos' }]} environment="DEV">
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">Productos</h1>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Gestiona filipinas, mandiles, pantalones y sus opciones comerciales.
            </p>
          </div>
          <Button onClick={handleCreateNew}>
            <Plus className="mr-2 h-4 w-4" />
            Nuevo producto
          </Button>
        </div>

        {feedback ? (
          <Alert>
            <AlertDescription className="font-serif">{feedback}</AlertDescription>
          </Alert>
        ) : null}

        <ProductsToolbar
          search={search}
          onSearchChange={setSearch}
          productTypeSlug={productTypeSlug}
          onProductTypeChange={setProductTypeSlug}
          productTypeOptions={productTypeFilterOptions}
          statusFilter={statusFilter}
          onStatusChange={setStatusFilter}
          customizableOnly={customizableOnly}
          onCustomizableChange={setCustomizableOnly}
          sortBy={sortBy}
          onSortChange={setSortBy}
          onClearFilters={clearFilters}
          hasActiveFilters={hasActiveFilters}
        />

        {productsQuery.isError ? (
          <AdminProductsError onRetry={() => void productsQuery.refetch()} />
        ) : productsQuery.isPending ? (
          <AdminProductsTableSkeleton />
        ) : isEmptyCatalog ? (
          <AdminProductsEmpty onCreateClick={handleCreateNew} />
        ) : tableRows.length === 0 ? (
          <AdminProductsEmpty
            title="Sin resultados"
            description="No encontramos productos con estos filtros."
          />
        ) : (
          <>
            {selectedIds.length > 0 ? (
              <div className="flex items-center gap-4 rounded-lg bg-primary/10 px-4 py-2">
                <span className="font-sans text-sm font-medium text-primary">
                  {selectedIds.length} producto{selectedIds.length > 1 ? 's' : ''} seleccionado
                  {selectedIds.length > 1 ? 's' : ''}
                </span>
                <Button variant="outline" size="sm" onClick={() => setSelectedIds([])}>
                  Deseleccionar
                </Button>
              </div>
            ) : null}

            <ProductsTable
              rows={tableRows}
              selectedIds={selectedIds}
              onSelectAll={handleSelectAll}
              onSelectOne={handleSelectOne}
              onEdit={handleEdit}
              onDuplicate={handleDuplicate}
              onArchive={handleArchiveClick}
              onStatusChange={handleStatusChange}
              actionProductId={actionProductId}
            />

            <p className="font-serif text-sm text-muted-foreground">
              Mostrando {tableRows.length} de {total} productos
            </p>
          </>
        )}
      </div>

      <ProductFormDialog
        open={drawerOpen}
        onOpenChange={setDrawerOpen}
        productId={editingProductId}
        onSaved={() => setFeedback('Producto guardado correctamente.')}
      />

      <ArchiveProductDialog
        open={archiveDialogOpen}
        onOpenChange={setArchiveDialogOpen}
        productName={archivingRow?.name ?? null}
        onConfirm={() => void handleArchiveConfirm()}
        isArchiving={archiveMutation.isPending}
      />
    </AdminPageConfig>
  )
}
