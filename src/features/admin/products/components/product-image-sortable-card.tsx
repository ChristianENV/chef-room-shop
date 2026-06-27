'use client'

import { useSortable } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import {
  AlertCircle,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  GripVertical,
  Loader2,
  Pencil,
  Star,
  Trash2,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { cn } from '@/lib/utils'

import type { ProductImageUploaderItem } from './product-image-uploader.types'

export type ProductImageSortableCardProps = {
  item: ProductImageUploaderItem
  index: number
  total: number
  onEdit: () => void
  onDelete: () => void
  onMoveLeft: () => void
  onMoveRight: () => void
  disabled?: boolean
}

const STATUS_LABELS: Record<ProductImageUploaderItem['status'], string> = {
  uploaded: 'Subida',
  processing: 'Procesando…',
  uploading: 'Subiendo…',
  pending: 'Pendiente',
  error: 'Error',
}

export function ProductImageSortableCard({
  item,
  index,
  total,
  onEdit,
  onDelete,
  onMoveLeft,
  onMoveRight,
  disabled = false,
}: ProductImageSortableCardProps) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: item.key,
    disabled,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const isBusy = item.status === 'processing' || item.status === 'uploading'

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-[box-shadow,opacity,transform]',
        'animate-in fade-in-0 zoom-in-95 duration-200',
        isDragging && 'z-10 opacity-80 shadow-lg ring-2 ring-primary/30',
      )}
    >
      <div className="relative aspect-square bg-muted/60">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.previewUrl}
          alt={item.alt || `Imagen ${index + 1}`}
          className="h-full w-full object-contain"
        />

        {index === 0 && (
          <Badge className="absolute left-2 top-2 gap-1 bg-primary text-primary-foreground shadow-sm">
            <Star className="h-3 w-3" aria-hidden />
            Principal
          </Badge>
        )}

        {item.status === 'uploaded' && (
          <Badge
            variant="secondary"
            className="absolute right-2 top-2 bg-background/90 text-[10px] backdrop-blur-sm"
          >
            WebP/JPG
          </Badge>
        )}

        {item.status === 'uploaded' && (
          <div className="absolute inset-0 flex items-center justify-center bg-success/10 opacity-0 transition-opacity group-hover:opacity-100">
            <CheckCircle2 className="h-8 w-8 text-success" aria-hidden />
          </div>
        )}

        {(isBusy || item.status === 'error') && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-background/80 px-3 backdrop-blur-[1px]">
            {item.status === 'error' ? (
              <>
                <AlertCircle className="h-6 w-6 text-destructive" aria-hidden />
                <p className="text-center font-serif text-[11px] text-destructive">
                  {item.errorMessage ?? 'Error al subir'}
                </p>
              </>
            ) : (
              <>
                <Loader2 className="h-6 w-6 animate-spin text-primary" aria-hidden />
                <p className="font-serif text-[11px] text-muted-foreground">
                  {STATUS_LABELS[item.status]}
                </p>
                {item.status === 'uploading' && (
                  <Progress value={item.progress} className="h-1.5 w-full" />
                )}
              </>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center gap-1 border-t border-border p-2">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 cursor-grab touch-none text-muted-foreground active:cursor-grabbing"
          aria-label={`Arrastrar imagen ${index + 1}`}
          disabled={disabled || isBusy}
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Mover imagen ${index + 1} a la izquierda`}
          disabled={disabled || isBusy || index === 0}
          onClick={onMoveLeft}
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Mover imagen ${index + 1} a la derecha`}
          disabled={disabled || isBusy || index === total - 1}
          onClick={onMoveRight}
        >
          <ChevronRight className="h-4 w-4" />
        </Button>

        <div className="flex-1" />

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          aria-label={`Editar imagen ${index + 1}`}
          disabled={disabled || isBusy}
          onClick={onEdit}
        >
          <Pencil className="h-4 w-4" />
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-destructive"
          aria-label={`Eliminar imagen ${index + 1}`}
          disabled={disabled || isBusy}
          onClick={onDelete}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
