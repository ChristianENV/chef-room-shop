'use client'

import { useMemo, useState } from 'react'
import { Plus } from 'lucide-react'

import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import {
  AdminColorsEmpty,
  AdminColorsError,
  AdminColorsTable,
  AdminColorsTableSkeleton,
  ArchiveColorDialog,
  ColorFormDialog,
} from '@/src/features/admin/colors'
import { useAdminColorsQuery } from '@/src/features/admin/colors/api/use-admin-colors-query'
import { useArchiveAdminColorMutation } from '@/src/features/admin/colors/api/use-archive-admin-color-mutation'
import {
  mapAdminColorMutationError,
  mapAdminColorToFormValues,
  mapAdminColorToTableRow,
} from '@/src/features/admin/colors/mappers/admin-colors-ui.mapper'
import type { AdminColor } from '@/src/features/admin/colors/types'
import type { AdminColorTableRow } from '@/src/features/admin/colors/types/admin-colors-ui.types'

export default function AdminColorsPage() {
  const [formOpen, setFormOpen] = useState(false)
  const [editingColor, setEditingColor] = useState<AdminColor | null>(null)

  const [archiveDialogOpen, setArchiveDialogOpen] = useState(false)
  const [archivingColor, setArchivingColor] = useState<AdminColorTableRow | null>(null)
  const [archiveError, setArchiveError] = useState<string | null>(null)

  const [actionColorId, setActionColorId] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  const colorsQuery = useAdminColorsQuery({ includeInactive: true })
  const archiveMutation = useArchiveAdminColorMutation()

  const colors = colorsQuery.data ?? []
  const tableRows = useMemo(() => colors.map(mapAdminColorToTableRow), [colors])

  const formInitialValues = useMemo(() => mapAdminColorToFormValues(editingColor), [editingColor])

  const handleCreate = () => {
    setEditingColor(null)
    setFormOpen(true)
  }

  const handleEdit = (row: AdminColorTableRow) => {
    const color = colors.find((item) => item.id === row.id) ?? null
    setEditingColor(color)
    setFormOpen(true)
  }

  const handleArchiveClick = (row: AdminColorTableRow) => {
    setArchivingColor(row)
    setArchiveError(null)
    setArchiveDialogOpen(true)
  }

  const handleArchiveConfirm = async () => {
    if (!archivingColor) return

    setActionColorId(archivingColor.id)
    setArchiveError(null)

    try {
      await archiveMutation.mutateAsync(archivingColor.id)
      setFeedback(`"${archivingColor.name}" se desactivó correctamente.`)
      setArchiveDialogOpen(false)
      setArchivingColor(null)
    } catch (error) {
      setArchiveError(mapAdminColorMutationError(error))
    } finally {
      setActionColorId(null)
    }
  }

  return (
    <AdminPageConfig breadcrumb={[{ label: 'Colores' }]} environment="DEV">
      <div className="min-w-0 w-full max-w-full space-y-6">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">Colores</h1>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Administra los colores disponibles para telas, variantes comerciales y productos
              generales.
            </p>
          </div>
          <Button onClick={handleCreate} className="shrink-0 self-start">
            <Plus className="mr-2 h-4 w-4" />
            Nuevo color
          </Button>
        </div>

        {feedback ? (
          <Alert>
            <AlertDescription className="font-serif">{feedback}</AlertDescription>
          </Alert>
        ) : null}

        {colorsQuery.isError ? (
          <AdminColorsError onRetry={() => void colorsQuery.refetch()} />
        ) : colorsQuery.isPending ? (
          <AdminColorsTableSkeleton />
        ) : tableRows.length === 0 ? (
          <AdminColorsEmpty onCreateClick={handleCreate} />
        ) : (
          <AdminColorsTable
            rows={tableRows}
            onEdit={handleEdit}
            onArchive={handleArchiveClick}
            actionColorId={actionColorId}
          />
        )}
      </div>

      <ColorFormDialog
        open={formOpen}
        onOpenChange={setFormOpen}
        editingColor={editingColor}
        initialValues={formInitialValues}
        onSaved={() => setFeedback('Color guardado correctamente.')}
      />

      <ArchiveColorDialog
        open={archiveDialogOpen}
        onOpenChange={(open) => {
          setArchiveDialogOpen(open)
          if (!open) {
            setArchivingColor(null)
            setArchiveError(null)
          }
        }}
        color={archivingColor}
        onConfirm={() => void handleArchiveConfirm()}
        isArchiving={archiveMutation.isPending}
        errorMessage={archiveError}
      />
    </AdminPageConfig>
  )
}
