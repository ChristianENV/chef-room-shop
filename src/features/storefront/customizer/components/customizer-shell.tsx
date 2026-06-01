'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { CustomizerProductData } from '../types/customizer-product.types'
import { useCustomizerStore } from '../store/customizer.store'
import { useCreateDesignDraftMutation } from '../api/use-create-design-draft'
import { useUpdateDesignMutation } from '../api/use-update-design'
import { useAddCartItemMutation } from '@/src/features/storefront/cart/api/use-add-cart-item-mutation'
import { DesignerLayout } from './designer-layout'
import '../customizer.css'

interface CustomizerShellProps {
  product?: CustomizerProductData | null
}

export function CustomizerShell({ product }: CustomizerShellProps) {
  const {
    initFromProduct,
    resetCustomizer,
    setDesignId,
    setSaveStatus,
    setLastSavedAt,
    markDirty,
    designId,
    isDirty,
    saveStatus,
    selectedVariantId,
    baseColor,
    detailColor,
    collarStyle,
    sleeveStyle,
    sleeveOption,
    buttonStyle,
    size,
    viewMode,
    viewAngle,
    layers,
  } = useCustomizerStore()
  const createDraft = useCreateDesignDraftMutation()
  const updateDesign = useUpdateDesignMutation()
  const addToCart = useAddCartItemMutation()
  const autosaveTimerRef = useRef<number | null>(null)
  const [cartActionError, setCartActionError] = useState<string | null>(null)
  const [addedToCart, setAddedToCart] = useState(false)

  useEffect(() => {
    if (product) {
      initFromProduct(product)
      return
    }
    resetCustomizer()
  }, [product, initFromProduct, resetCustomizer])

  const configJson = useMemo(
    () => ({
      productId: product?.id ?? null,
      productSlug: product?.slug ?? null,
      productName: product?.name ?? null,
      productVariantId: selectedVariantId,
      style: {
        baseColor,
        detailColor,
        collarStyle,
        sleeveStyle,
        sleeveOption,
        buttonStyle,
        size,
      },
      view: { mode: viewMode, angle: viewAngle },
      layers,
    }),
    [
      product?.id,
      product?.name,
      product?.slug,
      selectedVariantId,
      baseColor,
      detailColor,
      collarStyle,
      sleeveStyle,
      sleeveOption,
      buttonStyle,
      size,
      viewMode,
      viewAngle,
      layers,
    ],
  )

  const runSave = useCallback(async (): Promise<string | null> => {
    if (!product) return null
    setSaveStatus('saving')
    try {
      if (!designId) {
        const created = await createDraft.mutateAsync({
          productId: product.id,
          productVariantId: selectedVariantId,
          configJson,
        })
        setDesignId(created.id)
        setLastSavedAt(new Date().toISOString())
        markDirty(false)
        setSaveStatus('saved')
        return created.id
      } else {
        await updateDesign.mutateAsync({
          designId,
          configJson,
        })
        setSaveStatus('saved')
        setLastSavedAt(new Date().toISOString())
        markDirty(false)
        return designId
      }
    } catch {
      setSaveStatus('error')
      return null
    }
  }, [
    product,
    setSaveStatus,
    designId,
    createDraft,
    selectedVariantId,
    configJson,
    setDesignId,
    updateDesign,
    setLastSavedAt,
    markDirty,
  ])

  const handleAddToCart = useCallback(async () => {
    if (!product) return
    setCartActionError(null)
    setAddedToCart(false)

    let ensuredDesignId = designId
    if (!ensuredDesignId || isDirty) {
      ensuredDesignId = await runSave()
    }

    if (!ensuredDesignId) {
      setCartActionError('No pudimos guardar el diseño antes de agregarlo al carrito.')
      return
    }

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        productVariantId: selectedVariantId ?? null,
        designId: ensuredDesignId,
        quantity: 1,
      })
      setAddedToCart(true)
    } catch {
      setCartActionError('No pudimos agregar el diseño personalizado al carrito.')
    }
  }, [
    product,
    designId,
    isDirty,
    runSave,
    addToCart,
    selectedVariantId,
  ])

  useEffect(() => {
    if (!isDirty || !product) return
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = window.setTimeout(() => {
      void runSave()
    }, 1200)
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [isDirty, product, runSave])

  const saveStatusLabel =
    saveStatus === 'saving'
      ? 'Guardando...'
      : saveStatus === 'saved'
      ? 'Guardado'
      : saveStatus === 'error'
      ? 'Error al guardar'
      : 'Demo tecnica'

  return (
    <div
      className="flex h-dvh flex-col overflow-hidden bg-background"
      data-testid="customizer-root"
    >
      <header className="flex items-center justify-between border-b border-border/40 bg-card/80 px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.shop}>
            <ArrowLeft className="mr-2 size-4" />
            Volver a tienda
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">Customizador conectado a diseños y carrito</p>
      </header>
      {cartActionError ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 font-serif text-sm text-destructive">
          {cartActionError}
        </div>
      ) : null}
      {addedToCart ? (
        <div className="flex flex-wrap items-center gap-2 border-b border-success/30 bg-success/10 px-4 py-2">
          <span className="font-sans text-sm text-foreground">
            Diseño personalizado agregado al carrito.
          </span>
          <Button size="sm" variant="outline" asChild>
            <Link href={routes.cart}>Ver carrito</Link>
          </Button>
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setAddedToCart(false)}
          >
            Seguir diseñando
          </Button>
        </div>
      ) : null}
      <div className="min-h-0 flex-1">
        <DesignerLayout
          onSaveDesign={() => {
            void runSave()
          }}
          onAddToCart={() => {
            void handleAddToCart()
          }}
          isSaving={saveStatus === 'saving'}
          isAddingToCart={addToCart.isPending}
          saveStatusLabel={saveStatusLabel}
        />
      </div>
    </div>
  )
}
