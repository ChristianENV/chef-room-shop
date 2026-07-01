'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import { Plus, SlidersHorizontal } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminCategoriesEmpty,
  AdminCategoriesError,
  AdminCategoriesTable,
  AdminCategoriesTableSkeleton,
  ArchiveCategoryDialog,
  CategoryFormDialog,
} from '@/src/features/admin/product-types'
import { useAdminProductTypesQuery } from '@/src/features/admin/product-types/api/use-admin-product-types-query'
import { useArchiveAdminProductTypeMutation } from '@/src/features/admin/product-types/api/use-archive-admin-product-type-mutation'
import {
  buildDefaultCategoryFormValues,
  mapAdminProductTypeMutationError,
  mapAdminProductTypeToFormValues,
  mapAdminProductTypeToTableRow,
} from '@/src/features/admin/product-types/mappers/admin-product-types-ui.mapper'
import { routes } from '@/src/config/routes'
import type { AdminProductType } from '@/src/features/admin/product-types/types'
import type { AdminCategoryTableRow } from '@/src/features/admin/product-types/types/admin-product-types-ui.types'

export default function AdminCategoriesPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingCategory, setEditingCategory] = useState<AdminProductType | null>(null)

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archivingCategory, setArchivingCategory] = useState<AdminCategoryTableRow | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const [actionCategoryId, setActionCategoryId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const categoriesQuery = useAdminProductTypesQuery({ includeInactive: true })
  const archiveMutation = useArchiveAdminProductTypeMutation()

  const categories = useMemo(() => categoriesQuery.data ?? [], [categoriesQuery.data])

  const tableRows = useMemo(() => categories.map(mapAdminProductTypeToTableRow), [categories])

  const editingCategoryEntity = useMemo(
    () => categories.find((category) => category.id === editingCategory?.id) ?? editingCategory,
    [categories, editingCategory],
  )

  const formInitialValues = useMemo(
    () =>
      editingCategoryEntity
        ? mapAdminProductTypeToFormValues(editingCategoryEntity)
        : buildDefaultCategoryFormValues(categories),
    [editingCategoryEntity, categories],
  )

  const handleCreate = () => {
    setEditingCategory(null)
    setFormOpen(true)
  }

  const handleEdit = (row: AdminCategoryTableRow) => {
    const category = categories.find((item) => item.id === row.id) ?? null
    setEditingCategory(category)
    setFormOpen(true)
  }

  const handleArchiveClick = (row: AdminCategoryTableRow) => {
    setArchivingCategory(row)
    setArchiveError(null)
    setArchiveDialogOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (!archivingCategory) return

    setActionCategoryId(archivingCategory.id)
    setArchiveError(null)

    try {
      await archiveMutation.mutateAsync(archivingCategory.id)
      setFeedback(`"${archivingCategory.name}" desactivada.`)
      setArchiveDialogOpen(false)
      setArchivingCategory(null)
    } catch (error) {
      setArchiveError(mapAdminProductTypeMutationError(error))
    } finally {
      setActionCategoryId(null)
    }
  }

  const isEmptyCatalog = !categoriesQuery.isPending && tableRows.length === 0

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Categorías' }]}>
      <div className="space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">Categorías</h1>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Administra las familias de productos que aparecen en tienda y en formularios de
              producto.
            </p>
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button variant="outline" asChild>
              <Link href={routes.adminCategoryOptions}>
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                Opciones por tipo
              </Link>
            </Button>
            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva categoría
            </Button>
          </div>
        </div>

        {feedback ? (
          <Alert>
            <AlertDescription className="font-serif">{feedback}</AlertDescription>
          </Alert>
        ) : null}

        {categoriesQuery.isError ? (
          <AdminCategoriesError onRetry={() => void categoriesQuery.refetch()} />
        ) : categoriesQuery.isPending ? (
          <AdminCategoriesTableSkeleton />
        ) : isEmptyCatalog ? (
          <AdminCategoriesEmpty onCreateClick={handleCreate} />
        ) : (
          <AdminCategoriesTable
            rows={tableRows}
            onEdit={handleEdit}
            onArchive={handleArchiveClick}
            actionCategoryId={actionCategoryId}
          />
        )}
      </div>

      <CategoryFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingCategory={editingCategoryEntity}
        initialValues={formInitialValues}
        onSaved={() =>
          setFeedback(
            editingCategory
              ? 'Categoría actualizada correctamente.'
              : 'Categoría creada correctamente.',
          )
        }
      />

      <ArchiveCategoryDialog
        open={archiveDialogOpen}
        onOpenChange={(open) => {
          setArchiveDialogOpen(open)
          if (!open) {
            setArchivingCategory(null)
            setArchiveError(null)
          }
        }}
        categoryName={archivingCategory?.name ?? null}
        activeProductCount={archivingCategory?.activeProductCount ?? 0}
        onConfirm={() => void handleArchiveConfirm()}
        isArchiving={archiveMutation.isPending}
        errorMessage={archiveError}
      />
    </AdminPageConfig>
  )
}
