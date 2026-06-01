'use client'

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core'
import {
  SortableContext,
  rectSortingStrategy,
  sortableKeyboardCoordinates,
} from '@dnd-kit/sortable'

import { ProductImageSortableCard } from './product-image-sortable-card'
import type { ProductImageUploaderItem } from './product-image-uploader.types'

export type ProductImageGridProps = {
  items: ProductImageUploaderItem[]
  onReorder: (activeKey: string, overKey: string) => void
  onMoveLeft: (key: string) => void
  onMoveRight: (key: string) => void
  onEdit: (key: string) => void
  onDelete: (key: string) => void
  disabled?: boolean
}

export function ProductImageGrid({
  items,
  onReorder,
  onMoveLeft,
  onMoveRight,
  onEdit,
  onDelete,
  disabled = false,
}: ProductImageGridProps) {
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (!over || active.id === over.id) return
    onReorder(String(active.id), String(over.id))
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
      <SortableContext items={items.map((i) => i.key)} strategy={rectSortingStrategy}>
        <div
          className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4"
          role="list"
          aria-label="Imágenes del producto"
        >
          {items.map((item, index) => (
            <div key={item.key} role="listitem">
              <ProductImageSortableCard
                item={item}
                index={index}
                total={items.length}
                disabled={disabled}
                onEdit={() => onEdit(item.key)}
                onDelete={() => onDelete(item.key)}
                onMoveLeft={() => onMoveLeft(item.key)}
                onMoveRight={() => onMoveRight(item.key)}
              />
            </div>
          ))}
        </div>
      </SortableContext>
    </DndContext>
  )
}
