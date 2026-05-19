'use client'

import { AlertTriangle } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface UnsavedChangesBarProps {
  hasChanges: boolean
  onSave: () => void
  onDiscard: () => void
  isSaving?: boolean
}

export function UnsavedChangesBar({
  hasChanges,
  onSave,
  onDiscard,
  isSaving = false,
}: UnsavedChangesBarProps) {
  if (!hasChanges) return null

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-warning/30 bg-warning/10 px-4 py-3 backdrop-blur-sm">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-warning" />
          <span className="font-sans text-sm font-medium text-foreground">
            Tienes cambios sin guardar
          </span>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={onDiscard} disabled={isSaving}>
            Descartar
          </Button>
          <Button onClick={onSave} disabled={isSaving}>
            {isSaving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </div>
    </div>
  )
}
