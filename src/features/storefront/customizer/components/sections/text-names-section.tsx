'use client'

import { useState } from 'react'
import { Pencil, Tag, Type as TypeIcon } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useCustomizerStore } from '../../store/customizer.store'
import { getEstimatedElementPrice } from '../../pricing/get-estimated-element-price'
import { TextEditorDialog } from '../text-editor-dialog'

type DialogState = {
  open: boolean
  layerId: string | null
  mode: 'create' | 'edit'
}

const CLOSED: DialogState = { open: false, layerId: null, mode: 'create' }

/**
 * Unified "Texto y nombres" flow. Adding either opens a modal editor
 * immediately so the user always knows where to type.
 */
export function TextNamesSection() {
  const { layers, addTextElement, addNameElement, selectLayer } = useCustomizerStore()
  const [dialog, setDialog] = useState<DialogState>(CLOSED)

  const textLayers = layers.filter((layer) => layer.type === 'text')
  const estimatedPrice = getEstimatedElementPrice({ type: 'text', zone: 'pecho', layers })

  const openForNewText = () => {
    addTextElement({ name: 'Texto' })
    const layerId = useCustomizerStore.getState().selectedLayerId
    setDialog({ open: true, layerId, mode: 'create' })
  }

  const openForNewName = () => {
    addNameElement()
    const layerId = useCustomizerStore.getState().selectedLayerId
    setDialog({ open: true, layerId, mode: 'create' })
  }

  const openForEdit = (layerId: string) => {
    selectLayer(layerId)
    setDialog({ open: true, layerId, mode: 'edit' })
  }

  return (
    <div className="space-y-4 p-4">
      <div>
        <h3 className="text-sm font-semibold text-foreground">Texto y nombres</h3>
        <p className="text-xs text-muted-foreground">
          Agrega frases o el nombre del chef. Al agregar, escribes directo en un editor.
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2">
        <Button
          variant="default"
          className="h-auto flex-col items-start gap-1 py-3"
          onClick={openForNewText}
          data-testid="customizer-add-text-button"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <TypeIcon className="size-4" />
            Texto
          </span>
          <span className="text-[11px] font-normal opacity-90">Frase o palabra</span>
        </Button>
        <Button
          variant="secondary"
          className="h-auto flex-col items-start gap-1 py-3"
          onClick={openForNewName}
          data-testid="customizer-add-name-button"
        >
          <span className="flex items-center gap-1.5 text-sm font-semibold">
            <Tag className="size-4" />
            Nombre
          </span>
          <span className="text-[11px] font-normal opacity-90">Nombre del chef</span>
        </Button>
      </div>

      {textLayers.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            En tu diseño
          </p>
          {textLayers.map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => openForEdit(item.id)}
              data-testid="customizer-edit-text-button"
              className="flex w-full items-center gap-2 rounded-lg border border-border bg-card px-3 py-2 text-left text-sm text-muted-foreground transition hover:border-primary/40 hover:text-foreground"
            >
              <span className="flex size-7 shrink-0 items-center justify-center rounded-md bg-secondary text-foreground">
                <TypeIcon className="size-3.5" />
              </span>
              <span className="min-w-0 flex-1 truncate">{item.text?.trim() || item.name}</span>
              <span className="flex shrink-0 items-center gap-1 text-[11px] text-primary">
                <Pencil className="size-3" />
                Editar
              </span>
            </button>
          ))}
        </div>
      ) : null}

      <p className="text-[11px] text-muted-foreground/70">
        Solo bordado. {estimatedPrice.hint ?? 'Cada elemento bordado se suma al total en tiempo real.'}
      </p>

      <TextEditorDialog
        open={dialog.open}
        layerId={dialog.layerId}
        mode={dialog.mode}
        onClose={() => setDialog(CLOSED)}
      />
    </div>
  )
}
