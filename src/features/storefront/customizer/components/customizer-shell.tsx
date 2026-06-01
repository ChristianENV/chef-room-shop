'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useMemo, useRef } from 'react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { CustomizerProductData } from '../types/customizer-product.types'
import { useCustomizerStore } from '../store/customizer.store'
import { useCreateDesignDraftMutation } from '../api/use-create-design-draft'
import { useUpdateDesignMutation } from '../api/use-update-design'
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
  const autosaveTimerRef = useRef<number | null>(null)

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

  const runSave = useCallback(async () => {
    if (!product) return
    setSaveStatus('saving')
    try {
      if (!designId) {
        const created = await createDraft.mutateAsync({
          productId: product.id,
          productVariantId: selectedVariantId,
          configJson,
        })
        setDesignId(created.id)
      } else {
        await updateDesign.mutateAsync({
          designId,
          configJson,
        })
      }
      setSaveStatus('saved')
      setLastSavedAt(new Date().toISOString())
      markDirty(false)
    } catch {
      setSaveStatus('error')
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
    <div className="flex h-dvh flex-col overflow-hidden bg-background">
      <header className="flex items-center justify-between border-b border-border/40 bg-card/80 px-4 py-2">
        <Button variant="ghost" size="sm" asChild>
          <Link href={routes.shop}>
            <ArrowLeft className="mr-2 size-4" />
            Volver a tienda
          </Link>
        </Button>
        <p className="text-xs text-muted-foreground">Demo tecnica - sin carrito ni guardado</p>
      </header>
      <div className="min-h-0 flex-1">
        <DesignerLayout
          onSaveDesign={() => {
            void runSave()
          }}
          isSaving={saveStatus === 'saving'}
          saveStatusLabel={saveStatusLabel}
        />
      </div>
    </div>
  )
}
