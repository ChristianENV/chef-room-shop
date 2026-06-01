'use client'

import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react'

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { useDeleteAdminProductImageMutation } from '../api/use-delete-admin-product-image-mutation'
import { useReorderAdminProductImagesMutation } from '../api/use-reorder-admin-product-images-mutation'
import type { AdminProductImageUi } from '../types/admin-products-ui.types'
import { useProductImageUploadMutation } from '@/src/features/uploads/api/use-product-image-upload-mutation'
import { createObjectUrl } from '@/src/features/uploads/lib/image-processing'
import { MAX_PRODUCT_IMAGES } from '@/src/features/uploads/lib/product-image-processing'
import type { UploadProgressEvent } from '@/src/features/uploads/types'

import { ProductImageDropzone } from './product-image-dropzone'
import { ProductImageEditorDialog } from './product-image-editor-dialog'
import { ProductImageGrid } from './product-image-grid'
import type {
  ProductImageUploaderHandle,
  ProductImageUploaderItem,
} from './product-image-uploader.types'

export type ProductImageUploaderProps = {
  productId: string | null
  initialImages?: AdminProductImageUi[]
  disabled?: boolean
}

function newLocalKey(): string {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

function mapPersistedImage(img: AdminProductImageUi, index: number): ProductImageUploaderItem {
  return {
    key: img.id,
    id: img.id,
    previewUrl: img.url,
    url: img.url,
    alt: img.alt,
    sortOrder: img.sortOrder ?? index,
    isPrimary: img.isPrimary,
    status: 'uploaded',
    progress: 100,
    errorMessage: null,
  }
}

function normalizePrimaryFlags(items: ProductImageUploaderItem[]): ProductImageUploaderItem[] {
  return items.map((item, index) => ({
    ...item,
    sortOrder: index,
    isPrimary: index === 0,
  }))
}

function swapItems(
  items: ProductImageUploaderItem[],
  fromKey: string,
  toKey: string,
): ProductImageUploaderItem[] {
  const fromIndex = items.findIndex((i) => i.key === fromKey)
  const toIndex = items.findIndex((i) => i.key === toKey)
  if (fromIndex < 0 || toIndex < 0 || fromIndex === toIndex) return items
  const next = [...items]
  const [removed] = next.splice(fromIndex, 1)
  if (!removed) return items
  next.splice(toIndex, 0, removed)
  return normalizePrimaryFlags(next)
}

function moveItem(
  items: ProductImageUploaderItem[],
  key: string,
  direction: -1 | 1,
): ProductImageUploaderItem[] {
  const index = items.findIndex((i) => i.key === key)
  const target = index + direction
  if (index < 0 || target < 0 || target >= items.length) return items
  const next = [...items]
  const tmp = next[index]!
  next[index] = next[target]!
  next[target] = tmp
  return normalizePrimaryFlags(next)
}

type EditorContext = {
  imageSrc: string
  itemKey: string | null
  originalFileName?: string
  sourceObjectUrl?: string
  initialAlt: string
  isReplace: boolean
}

/**
 * Admin product image uploader with drag-and-drop, editing, R2 upload and reorder.
 */
export const ProductImageUploader = forwardRef<
  ProductImageUploaderHandle,
  ProductImageUploaderProps
>(function ProductImageUploader({ productId, initialImages = [], disabled = false }, ref) {
  const uploadMutation = useProductImageUploadMutation()
  const deleteMutation = useDeleteAdminProductImageMutation()
  const reorderMutation = useReorderAdminProductImagesMutation()

  const [items, setItems] = useState<ProductImageUploaderItem[]>(() =>
    normalizePrimaryFlags(
      [...initialImages]
        .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0))
        .map(mapPersistedImage),
    ),
  )
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorContext, setEditorContext] = useState<EditorContext | null>(null)
  const [fileQueue, setFileQueue] = useState<File[]>([])
  const [deleteTargetKey, setDeleteTargetKey] = useState<string | null>(null)
  const [globalError, setGlobalError] = useState<string | null>(null)
  const [isApplying, setIsApplying] = useState(false)

  const objectUrlsRef = useRef<Set<string>>(new Set())

  const trackObjectUrl = useCallback((url: string) => {
    objectUrlsRef.current.add(url)
  }, [])

  const revokeObjectUrl = useCallback((url: string | undefined) => {
    if (!url) return
    if (objectUrlsRef.current.has(url)) {
      URL.revokeObjectURL(url)
      objectUrlsRef.current.delete(url)
    }
  }, [])

  useEffect(() => {
    const urls = objectUrlsRef.current
    return () => {
      urls.forEach((url) => URL.revokeObjectURL(url))
      urls.clear()
    }
  }, [])

  const updateItem = useCallback(
    (key: string, patch: Partial<ProductImageUploaderItem>) => {
      setItems((prev) => prev.map((item) => (item.key === key ? { ...item, ...patch } : item)))
    },
    [],
  )

  const persistReorder = useCallback(
    async (nextItems: ProductImageUploaderItem[]) => {
      if (!productId) return
      const uploaded = nextItems.filter((i) => i.status === 'uploaded' && i.id)
      if (uploaded.length !== nextItems.length || uploaded.length === 0) return
      try {
        await reorderMutation.mutateAsync({
          productId,
          imageIds: uploaded.map((i) => i.id!),
        })
      } catch {
        setGlobalError('No pudimos guardar el orden de las imágenes.')
      }
    },
    [productId, reorderMutation],
  )

  const handleReorder = useCallback(
    (activeKey: string, overKey: string) => {
      setItems((prev) => {
        const next = swapItems(prev, activeKey, overKey)
        void persistReorder(next)
        return next
      })
    },
    [persistReorder],
  )

  const handleMoveLeft = useCallback(
    (key: string) => {
      setItems((prev) => {
        const next = moveItem(prev, key, -1)
        void persistReorder(next)
        return next
      })
    },
    [persistReorder],
  )

  const handleMoveRight = useCallback(
    (key: string) => {
      setItems((prev) => {
        const next = moveItem(prev, key, 1)
        void persistReorder(next)
        return next
      })
    },
    [persistReorder],
  )

  const openEditorForFile = useCallback(
    (file: File, itemKey: string | null, initialAlt = '') => {
      const url = createObjectUrl(file)
      trackObjectUrl(url)
      setEditorContext({
        imageSrc: url,
        itemKey,
        originalFileName: file.name,
        sourceObjectUrl: url,
        initialAlt,
        isReplace: Boolean(itemKey),
      })
      setEditorOpen(true)
    },
    [trackObjectUrl],
  )

  const openEditorForExisting = useCallback(
    (key: string) => {
      const item = items.find((i) => i.key === key)
      if (!item) return
      setEditorContext({
        imageSrc: item.previewUrl,
        itemKey: key,
        initialAlt: item.alt,
        isReplace: true,
      })
      setEditorOpen(true)
    },
    [items],
  )

  const processNextQueuedFile = useCallback(
    (queue: File[]) => {
      if (queue.length === 0) return
      const [next, ...rest] = queue
      setFileQueue(rest)
      if (next) openEditorForFile(next, null)
    },
    [openEditorForFile],
  )

  const handleFilesSelected = useCallback(
    (files: File[]) => {
      setGlobalError(null)
      const available = MAX_PRODUCT_IMAGES - items.length
      if (available <= 0) {
        setGlobalError(`Máximo ${MAX_PRODUCT_IMAGES} imágenes por producto.`)
        return
      }
      const batch = files.slice(0, available)
      if (batch.length === 0) return
      const [first, ...rest] = batch
      setFileQueue(rest)
      openEditorForFile(first!, null)
    },
    [items.length, openEditorForFile],
  )

  const uploadSingleItem = useCallback(
    async (item: ProductImageUploaderItem, targetProductId: string, sortOrder: number) => {
      if (!item.processed) {
        throw new Error('Faltan archivos procesados para subir.')
      }

      updateItem(item.key, { status: 'uploading', progress: 0, errorMessage: null })

      let accumulated = 0
      const onProgress = (event: UploadProgressEvent) => {
        const weights = { webp: 0.5, jpg: 0.35, thumb: 0.15 } as const
        accumulated = Math.min(
          99,
          Math.round(accumulated + event.progress * weights[event.slot] * 100),
        )
        updateItem(item.key, { progress: accumulated })
      }

      try {
        const result = await uploadMutation.mutateAsync({
          files: {
            productId: targetProductId,
            imageId: item.id,
            webp: item.processed.webp,
            jpg: item.processed.jpg,
            thumb: item.processed.thumb,
            originalFileName: item.originalFileName ?? null,
            altText: item.alt || null,
            isPrimary: sortOrder === 0,
            sortOrder,
          },
          onProgress,
        })

        setItems((prev) =>
          prev.map((entry) =>
            entry.key === item.key
              ? {
                  ...entry,
                  id: result.id,
                  key: result.id,
                  url: result.url,
                  previewUrl: result.url,
                  status: 'uploaded' as const,
                  progress: 100,
                  errorMessage: null,
                  processed: undefined,
                  isPrimary: sortOrder === 0,
                  sortOrder,
                }
              : entry,
          ),
        )
      } catch (err) {
        updateItem(item.key, {
          status: 'error',
          errorMessage:
            err instanceof Error ? err.message : 'No pudimos subir la imagen.',
        })
        throw err
      }
    },
    [updateItem, uploadMutation],
  )

  const handleEditorApply = useCallback(
    async (result: {
      alt: string
      processed: ProductImageUploaderItem['processed']
      previewUrl: string
      originalFileName?: string
    }) => {
      if (!result.processed) return
      setIsApplying(true)
      setGlobalError(null)

      try {
        const ctx = editorContext
        const sortOrder = ctx?.itemKey
          ? items.findIndex((i) => i.key === ctx.itemKey)
          : items.length

        if (ctx?.itemKey) {
          const existing = items.find((i) => i.key === ctx.itemKey)
          if (!existing) return

          revokeObjectUrl(ctx.sourceObjectUrl)

          const patched: ProductImageUploaderItem = {
            ...existing,
            alt: result.alt,
            previewUrl: result.previewUrl,
            processed: result.processed,
            originalFileName: ctx.originalFileName,
            status: productId ? 'processing' : 'pending',
            progress: 0,
            errorMessage: null,
          }

          setItems((prev) =>
            prev.map((item) => (item.key === ctx.itemKey ? patched : item)),
          )

          if (productId) {
            await uploadSingleItem(patched, productId, sortOrder >= 0 ? sortOrder : 0)
          }

          setEditorOpen(false)
          setEditorContext(null)
          processNextQueuedFile(fileQueue)
          return
        }

        const newItem: ProductImageUploaderItem = {
          key: newLocalKey(),
          id: null,
          previewUrl: result.previewUrl,
          url: null,
          alt: result.alt,
          sortOrder: items.length,
          isPrimary: items.length === 0,
          status: productId ? 'processing' : 'pending',
          progress: 0,
          errorMessage: null,
          processed: result.processed,
          originalFileName: ctx?.originalFileName,
          sourceObjectUrl: ctx?.sourceObjectUrl,
        }

        setItems((prev) => normalizePrimaryFlags([...prev, newItem]))

        if (productId) {
          await uploadSingleItem(newItem, productId, items.length)
        }

        setEditorOpen(false)
        revokeObjectUrl(ctx?.sourceObjectUrl)
        setEditorContext(null)
        processNextQueuedFile(fileQueue)
      } catch {
        setGlobalError('Revisa las imágenes con error e intenta de nuevo.')
      } finally {
        setIsApplying(false)
      }
    },
    [
      editorContext,
      fileQueue,
      items,
      processNextQueuedFile,
      productId,
      revokeObjectUrl,
      uploadSingleItem,
    ],
  )

  const uploadPendingImages = useCallback(
    async (targetProductId: string) => {
      const pending = items.filter((i) => i.status === 'pending' && i.processed)
      for (let index = 0; index < pending.length; index++) {
        const item = pending[index]!
        const sortIndex = items.findIndex((i) => i.key === item.key)
        await uploadSingleItem(item, targetProductId, sortIndex >= 0 ? sortIndex : index)
      }
    },
    [items, uploadSingleItem],
  )

  useImperativeHandle(ref, () => ({
    uploadPendingImages,
    hasPendingUploads: () => items.some((i) => i.status === 'pending' && i.processed),
  }))

  const confirmDelete = useCallback(async () => {
    if (!deleteTargetKey) return
    const item = items.find((i) => i.key === deleteTargetKey)
    if (!item) {
      setDeleteTargetKey(null)
      return
    }

    try {
      if (item.id && productId) {
        await deleteMutation.mutateAsync({ id: item.id, productId })
      }
      revokeObjectUrl(item.sourceObjectUrl)
      if (item.previewUrl.startsWith('blob:')) revokeObjectUrl(item.previewUrl)
      setItems((prev) => normalizePrimaryFlags(prev.filter((i) => i.key !== deleteTargetKey)))
    } catch {
      setGlobalError('No pudimos eliminar la imagen.')
    } finally {
      setDeleteTargetKey(null)
    }
  }, [deleteMutation, deleteTargetKey, items, productId, revokeObjectUrl])

  const showCreateHint = !productId
  const canAddMore = items.length < MAX_PRODUCT_IMAGES

  const pendingCount = useMemo(
    () => items.filter((i) => i.status === 'pending').length,
    [items],
  )

  return (
    <div className="space-y-4">
      <div>
        <p className="font-sans text-sm font-medium text-foreground">Imágenes del producto</p>
        <p className="font-serif text-xs text-muted-foreground">
          Máximo {MAX_PRODUCT_IMAGES} imágenes · La primera es la principal en tienda.
        </p>
      </div>

      {showCreateHint && pendingCount > 0 && (
        <Alert>
          <AlertDescription className="font-serif text-sm">
            Las imágenes se subirán a Cloudflare R2 al guardar el producto.
          </AlertDescription>
        </Alert>
      )}

      {showCreateHint && items.length === 0 && (
        <Alert variant="default" className="border-border bg-muted/30">
          <AlertDescription className="font-serif text-sm">
            Puedes seleccionar imágenes ahora; se optimizarán y subirán cuando guardes el
            producto.
          </AlertDescription>
        </Alert>
      )}

      {globalError ? (
        <p className="font-serif text-sm text-destructive" role="alert">
          {globalError}
        </p>
      ) : null}

      {items.length === 0 ? (
        <ProductImageDropzone
          onFilesSelected={handleFilesSelected}
          disabled={disabled}
          currentCount={items.length}
          maxFiles={MAX_PRODUCT_IMAGES}
        />
      ) : (
        <>
          <ProductImageGrid
            items={items}
            disabled={disabled}
            onReorder={handleReorder}
            onMoveLeft={handleMoveLeft}
            onMoveRight={handleMoveRight}
            onEdit={openEditorForExisting}
            onDelete={setDeleteTargetKey}
          />
          {canAddMore && (
            <ProductImageDropzone
              compact
              onFilesSelected={handleFilesSelected}
              disabled={disabled}
              currentCount={items.length}
              maxFiles={MAX_PRODUCT_IMAGES}
            />
          )}
        </>
      )}

      <ProductImageEditorDialog
        open={editorOpen}
        onOpenChange={(open) => {
          if (!open && !isApplying) {
            revokeObjectUrl(editorContext?.sourceObjectUrl)
            setEditorOpen(false)
            setEditorContext(null)
            setFileQueue([])
          }
        }}
        imageSrc={editorContext?.imageSrc ?? null}
        initialAlt={editorContext?.initialAlt ?? ''}
        isApplying={isApplying}
        onApply={handleEditorApply}
      />

      <AlertDialog open={Boolean(deleteTargetKey)} onOpenChange={() => setDeleteTargetKey(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans">Eliminar imagen</AlertDialogTitle>
            <AlertDialogDescription className="font-serif">
              Esta acción quita la imagen del producto. Si era la principal, la siguiente pasará
              a serlo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
              onClick={() => void confirmDelete()}
            >
              Eliminar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
})
