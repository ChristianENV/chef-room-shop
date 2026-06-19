'use client'

import { useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { useCustomizerStore } from '../store/customizer.store'
import { TextPropertiesPanel } from './text-properties-panel'

type TextEditorDialogProps = {
  open: boolean
  layerId: string | null
  mode: 'create' | 'edit'
  onClose: () => void
}

/**
 * Modal text editor — the input appears immediately so the flow feels like
 * designing, not filling a form. Edits apply live to the selected layer.
 */
export function TextEditorDialog({ open, layerId, mode, onClose }: TextEditorDialogProps) {
  const { layers, deleteLayer } = useCustomizerStore()
  const layer = layers.find((item) => item.id === layerId) ?? null

  useEffect(() => {
    if (open && layerId && !layer) {
      // Layer disappeared (e.g. undo) while modal open — close to stay in sync.
      onClose()
    }
  }, [open, layerId, layer, onClose])

  const handleOpenChange = (next: boolean) => {
    if (next) return
    // Discard an empty just-created text element on cancel.
    if (mode === 'create' && layer && !layer.text?.trim()) {
      deleteLayer(layer.id)
    }
    onClose()
  }

  const handleDelete = () => {
    if (layer) deleteLayer(layer.id)
    onClose()
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent data-testid="customizer-text-editor-dialog" className="max-w-md gap-5">
        <DialogHeader>
          <DialogTitle>{mode === 'create' ? 'Agregar texto' : 'Editar texto'}</DialogTitle>
          <DialogDescription>
            Escribe tu texto y dale estilo. Se actualiza en vivo sobre la prenda.
          </DialogDescription>
        </DialogHeader>

        {layer ? <TextPropertiesPanel layer={layer} autoFocus /> : null}

        <DialogFooter className="sm:justify-between">
          {mode === 'edit' ? (
            <Button
              type="button"
              variant="ghost"
              onClick={handleDelete}
              data-testid="customizer-text-editor-delete"
              className="text-destructive hover:bg-destructive/10 hover:text-destructive"
            >
              <Trash2 className="mr-1 size-4" />
              Eliminar
            </Button>
          ) : (
            <span />
          )}
          <Button
            type="button"
            onClick={() => handleOpenChange(false)}
            data-testid="customizer-text-done-button"
          >
            Listo
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
