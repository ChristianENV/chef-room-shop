'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { useAddCartItemMutation } from '@/src/features/storefront/cart/api/use-add-cart-item-mutation'
import type { CustomizerProductData } from '../types/customizer-product.types'
import type { SavePhase } from '../types/customizer.types'
import { useCustomizerStore } from '../store/customizer.store'
import { useCreateDesignDraftMutation } from '../api/use-create-design-draft'
import { useUpdateDesignMutation } from '../api/use-update-design'
import { ensureDesignPreviews } from '../lib/ensure-design-previews'
import { readPreviewsFromConfig } from '../lib/design-preview-config'
import { uploadDesignPreviewBlobs } from '../lib/upload-design-previews'
import { buildDesignConfigJson } from '../lib/build-design-config'
import {
  CUSTOMIZER_CART_VARIANT_MESSAGES,
  validateCustomizerCartVariant,
} from '../lib/resolve-customizer-variant'
import { uploadDesignLogo } from '../lib/upload-design-logo'
import { CustomizerAddToCartSuccessDialog } from './customizer-add-to-cart-success-dialog'
import { DesignerLayout } from './designer-layout'
import type { ViewportCaptureHandle } from './viewport-3d'
import '../customizer.css'

interface CustomizerShellProps {
  product: CustomizerProductData
  productOptions?: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
}

function savePhaseLabel(phase: SavePhase, isDirty: boolean, saveStatus: string): string {
  switch (phase) {
    case 'saving_config':
      return 'Guardando configuración…'
    case 'capturing_front':
      return 'Generando vista frontal…'
    case 'capturing_back':
      return 'Generando vista trasera…'
    case 'uploading_previews':
      return 'Subiendo vistas…'
    case 'confirming_previews':
      return 'Subiendo vistas…'
    case 'saved':
      return 'Diseño guardado con vistas frontal y trasera.'
    case 'preview_failed':
      return 'Configuración guardada; vista previa pendiente.'
    case 'error':
      return 'Error al guardar'
    case 'idle':
    default:
      if (saveStatus === 'saved' && !isDirty) return 'Guardado'
      if (isDirty) return 'Cambios sin guardar'
      return 'Listo para diseñar'
  }
}

export function CustomizerShell({
  product,
  productOptions = [],
  selectedProductSlug,
  onSelectProduct,
}: CustomizerShellProps) {
  const {
    initFromProduct,
    syncProductCatalog,
    setDesignId,
    setSaveStatus,
    setLastSavedAt,
    markDirty,
    designId,
    isDirty,
    saveStatus,
    selectedVariantId,
    setSelectedVariant,
    baseColor,
    detailColor,
    collarStyle,
    sleeveStyle,
    sleeveOption,
    buttonStyle,
    size,
    quantity,
    viewMode,
    viewAngle,
    layers,
    addLogoElement,
  } = useCustomizerStore()

  const storeProduct = useCustomizerStore((state) => state.product)

  const catalogProduct = useMemo(() => {
    if (storeProduct?.id === product.id) return storeProduct
    return product
  }, [storeProduct, product])

  const createDraft = useCreateDesignDraftMutation()
  const updateDesign = useUpdateDesignMutation()
  const addToCart = useAddCartItemMutation()
  const autosaveTimerRef = useRef<number | null>(null)
  const viewportCaptureRef = useRef<ViewportCaptureHandle>(null)
  const previewUrlRef = useRef<string | null>(null)
  const configJsonRef = useRef<unknown>(null)

  const [cartActionError, setCartActionError] = useState<string | null>(null)
  const [addToCartSuccessOpen, setAddToCartSuccessOpen] = useState(false)
  const [addToCartSuccessPreviewUrl, setAddToCartSuccessPreviewUrl] = useState<string | null>(
    null,
  )
  const [savePhase, setSavePhase] = useState<SavePhase>('idle')
  const [previewWarning, setPreviewWarning] = useState<string | null>(null)
  const [lastPreviewSuccess, setLastPreviewSuccess] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)

  const cartVariantValidation = useMemo(
    () => validateCustomizerCartVariant(catalogProduct, { baseColor, size }),
    [catalogProduct, baseColor, size],
  )

  const canAddToCart = cartVariantValidation.status === 'ok'

  // Initialize store before paint so color/size panels never use fallback on first frame.
  useLayoutEffect(() => {
    initFromProduct(product)
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching products
  }, [product.id, product.slug, initFromProduct])

  // Keep catalog variants/colors/sizes in sync when BFF data refreshes (rules, stock).
  useEffect(() => {
    syncProductCatalog(product)
  }, [product, syncProductCatalog])

  const configJson = useMemo(
    () =>
      buildDesignConfigJson({
        product,
        productVariantId: selectedVariantId,
        baseColor,
        detailColor,
        collarStyle,
        sleeveStyle,
        sleeveOption,
        buttonStyle,
        size,
        quantity,
        viewMode,
        viewAngle,
        layers,
      }),
    [
      product,
      selectedVariantId,
      baseColor,
      detailColor,
      collarStyle,
      sleeveStyle,
      sleeveOption,
      buttonStyle,
      size,
      quantity,
      viewMode,
      viewAngle,
      layers,
    ],
  )

  const persistConfig = useCallback(async (): Promise<string | null> => {
    if (!product) return null
    const existingPreviews = readPreviewsFromConfig(configJsonRef.current)
    const payload = existingPreviews
      ? { ...configJson, previews: existingPreviews }
      : configJson

    if (!designId) {
      const created = await createDraft.mutateAsync({
        productId: product.id,
        productVariantId: selectedVariantId,
        configJson: payload,
      })
      setDesignId(created.id)
      previewUrlRef.current = created.previewUrl
      configJsonRef.current = created.configJson
      return created.id
    }

    const updated = await updateDesign.mutateAsync({
      designId,
      configJson: payload,
    })
    previewUrlRef.current = updated.previewUrl
    configJsonRef.current = updated.configJson
    return designId
  }, [
    product,
    configJson,
    designId,
    createDraft,
    selectedVariantId,
    setDesignId,
    updateDesign,
  ])

  const captureAndUploadPreviews = useCallback(
    async (targetDesignId: string): Promise<boolean> => {
      if (viewMode !== '3D') {
        setPreviewWarning(
          'Guardamos la configuración, pero no pudimos generar la vista previa. Cambia a vista 3D y vuelve a guardar.',
        )
        return false
      }

      const capture = viewportCaptureRef.current
      if (!capture) {
        setPreviewWarning(
          'Guardamos la configuración, pero no pudimos generar la vista previa.',
        )
        return false
      }

      try {
        setSavePhase('capturing_front')
        const blobs = await capture.captureDesignPreviews()
        if (!blobs) {
          setPreviewWarning(
            'Guardamos la configuración, pero no pudimos generar la vista previa.',
          )
          return false
        }

        setSavePhase('capturing_back')
        setSavePhase('uploading_previews')

        const result = await uploadDesignPreviewBlobs(targetDesignId, blobs, (phase) => {
          if (phase === 'confirming') setSavePhase('confirming_previews')
        })

        previewUrlRef.current = result.previewUrl
        configJsonRef.current = result.configJson
        setPreviewWarning(result.warning ?? null)
        setLastPreviewSuccess(true)
        return true
      } catch {
        setPreviewWarning(
          'Guardamos la configuración, pero no pudimos generar la vista previa. Intenta de nuevo.',
        )
        return false
      }
    },
    [viewMode],
  )

  /** Saves config only (autosave). Does not capture previews. */
  const runSaveConfig = useCallback(async (): Promise<string | null> => {
    if (!product) return null
    setSaveStatus('saving')
    setSavePhase('saving_config')
    try {
      const id = await persistConfig()
      setLastSavedAt(new Date().toISOString())
      markDirty(false)
      setSaveStatus('saved')
      setSavePhase('idle')
      return id
    } catch {
      setSaveStatus('error')
      setSavePhase('error')
      return null
    }
  }, [product, persistConfig, setSaveStatus, setLastSavedAt, markDirty])

  /** Manual save: config + front/back previews. */
  const runSaveWithPreviews = useCallback(async (): Promise<string | null> => {
    if (!product) return null
    setSaveStatus('saving')
    setSavePhase('saving_config')
    setPreviewWarning(null)
    setLastPreviewSuccess(false)

    try {
      const id = await persistConfig()
      if (!id) {
        setSaveStatus('error')
        setSavePhase('error')
        return null
      }

      const previewsOk = await captureAndUploadPreviews(id)
      setLastSavedAt(new Date().toISOString())
      markDirty(false)
      setSaveStatus('saved')
      setSavePhase(previewsOk ? 'saved' : 'preview_failed')
      return id
    } catch {
      setSaveStatus('error')
      setSavePhase('error')
      return null
    }
  }, [
    product,
    persistConfig,
    captureAndUploadPreviews,
    setSaveStatus,
    setLastSavedAt,
    markDirty,
  ])

  const handleAddToCart = useCallback(async () => {
    if (!product) return
    setCartActionError(null)
    setAddToCartSuccessOpen(false)

    const validation = validateCustomizerCartVariant(catalogProduct, {
      baseColor,
      size,
    })

    if (validation.status === 'error') {
      setCartActionError(CUSTOMIZER_CART_VARIANT_MESSAGES[validation.reason])
      return
    }

    const resolvedVariant = validation.variant

    if (resolvedVariant && resolvedVariant.id !== selectedVariantId) {
      setSelectedVariant(resolvedVariant.id)
    }

    let ensuredDesignId = designId
    if (!ensuredDesignId || isDirty) {
      ensuredDesignId = await runSaveConfig()
    }

    if (!ensuredDesignId) {
      setCartActionError('No pudimos guardar el diseño antes de agregarlo al carrito.')
      return
    }

    const previewResult = await ensureDesignPreviews({
      designId: ensuredDesignId,
      previewUrl: previewUrlRef.current,
      configJson: configJsonRef.current ?? configJson,
      viewMode,
      captureRef: viewportCaptureRef,
      onPhase: (phase) => {
        if (phase === 'capturing') setSavePhase('capturing_front')
        if (phase === 'uploading' || phase === 'confirming') setSavePhase('uploading_previews')
      },
    })

    if (!previewResult.ok) {
      if (previewResult.reason === 'no_3d') {
        setPreviewWarning(
          'Para agregar al carrito, genera al menos la vista frontal en modo 3D y guarda de nuevo.',
        )
      }
      setCartActionError('No pudimos generar la vista previa del diseño. Intenta de nuevo.')
      return
    }

    try {
      await addToCart.mutateAsync({
        productId: product.id,
        productVariantId: resolvedVariant?.id ?? null,
        designId: ensuredDesignId,
        quantity,
      })

      const previewFromConfig = readPreviewsFromConfig(configJsonRef.current)?.front?.url
      setAddToCartSuccessPreviewUrl(
        previewUrlRef.current ?? previewFromConfig ?? previewResult.previewUrl ?? null,
      )
      setAddToCartSuccessOpen(true)
      setSavePhase('idle')
    } catch {
      setCartActionError('No pudimos agregar el diseño personalizado al carrito.')
    }
  }, [
    product,
    catalogProduct,
    designId,
    isDirty,
    runSaveConfig,
    configJson,
    viewMode,
    addToCart,
    selectedVariantId,
    setSelectedVariant,
    baseColor,
    size,
    quantity,
  ])

  const handleUploadLogo = useCallback(
    async (file: File) => {
      setLogoUploadError(null)
      const ensuredDesignId = designId ?? (await persistConfig())
      if (!ensuredDesignId) {
        throw new Error('No pudimos preparar el diseño para subir el logotipo.')
      }

      try {
        const uploaded = await uploadDesignLogo({
          file,
          designId: ensuredDesignId,
        })
        addLogoElement({
          name: 'Logotipo',
          assetUrl: uploaded.assetUrl,
          assetPublicId: uploaded.assetPublicId,
          zone: 'pecho',
        })
      } catch (error) {
        const message =
          error instanceof Error ? error.message : 'No pudimos subir el logotipo.'
        setLogoUploadError(message)
        throw error
      }
    },
    [addLogoElement, designId, persistConfig],
  )

  useEffect(() => {
    if (!isDirty || !product) return
    if (savePhase !== 'idle' && savePhase !== 'saved' && savePhase !== 'preview_failed') {
      return
    }
    if (autosaveTimerRef.current) {
      window.clearTimeout(autosaveTimerRef.current)
    }
    autosaveTimerRef.current = window.setTimeout(() => {
      void runSaveConfig()
    }, 1200)
    return () => {
      if (autosaveTimerRef.current) {
        window.clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [isDirty, product, runSaveConfig, savePhase])

  const isSaving =
    saveStatus === 'saving' ||
    savePhase === 'saving_config' ||
    savePhase === 'capturing_front' ||
    savePhase === 'capturing_back' ||
    savePhase === 'uploading_previews' ||
    savePhase === 'confirming_previews'

  const saveStatusLabel = savePhaseLabel(savePhase, isDirty, saveStatus)

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
        <p className="text-xs text-muted-foreground">Diseña tu uniforme</p>
      </header>
      {previewWarning ? (
        <div className="border-b border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm text-amber-800 dark:text-amber-200">
          {previewWarning}
          <Button
            size="sm"
            variant="link"
            className="ml-2 h-auto p-0 text-amber-900 dark:text-amber-100"
            onClick={() => {
              void runSaveWithPreviews()
            }}
          >
            Reintentar vista previa
          </Button>
        </div>
      ) : null}
      {lastPreviewSuccess && savePhase === 'saved' ? (
        <div className="border-b border-emerald-500/30 bg-emerald-500/10 px-4 py-2 text-sm text-emerald-800 dark:text-emerald-200">
          Diseño guardado con vistas frontal y trasera.
        </div>
      ) : null}
      {cartActionError ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 font-serif text-sm text-destructive">
          {cartActionError}
        </div>
      ) : null}
      {logoUploadError ? (
        <div className="border-b border-destructive/30 bg-destructive/10 px-4 py-2 text-sm text-destructive">
          {logoUploadError}
        </div>
      ) : null}
      <CustomizerAddToCartSuccessDialog
        open={addToCartSuccessOpen && !addToCart.isPending}
        onOpenChange={setAddToCartSuccessOpen}
        productName={product.name}
        previewUrl={addToCartSuccessPreviewUrl}
        cartHref={routes.cart}
        onContinueDesigning={() => {
          setAddToCartSuccessOpen(false)
          setAddToCartSuccessPreviewUrl(null)
        }}
      />
      <div className="min-h-0 flex-1">
        <DesignerLayout
          onSaveDesign={() => {
            void runSaveWithPreviews()
          }}
          onAddToCart={() => {
            void handleAddToCart()
          }}
          isSaving={isSaving}
          isAddingToCart={addToCart.isPending}
          isAddToCartDisabled={!canAddToCart}
          saveStatusLabel={saveStatusLabel}
          viewportCaptureRef={viewportCaptureRef}
          productOptions={productOptions}
          selectedProductSlug={selectedProductSlug ?? product.slug}
          onSelectProduct={onSelectProduct}
          onUploadLogo={handleUploadLogo}
        />
      </div>
    </div>
  )
}
