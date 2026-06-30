'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { AccountDesign } from '@/src/features/storefront/account/types'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { useAddCartItemMutation } from '@/src/features/storefront/cart/api/use-add-cart-item-mutation'
import { useSession } from '@/src/lib/auth/auth-client'
import type { CustomizerProductData } from '../types/customizer-product.types'
import type { SavePhase } from '../types/customizer.types'
import { selectHasMeaningfulCustomization, useCustomizerStore } from '../store/customizer.store'
import { useCreateDesignDraftMutation } from '../api/use-create-design-draft'
import { useUpdateDesignMutation } from '../api/use-update-design'
import { ensureDesignPreviews } from '../lib/ensure-design-previews'
import { readPreviewsFromConfig } from '../lib/design-preview-config'
import { uploadDesignPreviewBlobs } from '../lib/upload-design-previews'
import { buildDesignConfigJson } from '../lib/build-design-config'
import { cacheGuestDesign } from '../lib/guest-design-cache'
import {
  clearCustomizerLocalDraft,
  loadCustomizerLocalDraft,
  saveCustomizerLocalDraft,
} from '../lib/customizer-local-draft'
import {
  shouldAutosaveDraft,
  shouldCreateDesignInDatabase,
  shouldUpdateExistingDesign,
} from '../lib/customizer-save-intent'
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
  loadedDesign?: AccountDesign | null
}

function savePhaseLabel(params: {
  phase: SavePhase
  isDirty: boolean
  saveStatus: string
  isAuthenticated: boolean
  designId: string | null
  hasLocalDraft: boolean
}): string {
  const { phase, isDirty, saveStatus, isAuthenticated, designId, hasLocalDraft } = params

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
      if (isAuthenticated && designId && saveStatus === 'saved' && !isDirty) return 'Guardado'
      if (!isAuthenticated && hasLocalDraft && !isDirty) return 'Guardado localmente'
      if (isDirty) return 'Sin guardar'
      return 'Listo para diseñar'
  }
}

export function CustomizerShell({
  product,
  productOptions = [],
  selectedProductSlug,
  onSelectProduct,
  loadedDesign = null,
}: CustomizerShellProps) {
  const { data: session } = useSession()
  const isAuthenticated = Boolean(session?.user)

  const {
    initFromProduct,
    hydrateFromDesign,
    hydrateFromLocalDraft,
    syncProductCatalog,
    setDesignId,
    setSaveStatus,
    setLastSavedAt,
    markDirty,
    setHasLocalDraft,
    designId,
    isDirty,
    saveStatus,
    hasLocalDraft,
    interactionCount,
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
    syncLayerAssets,
  } = useCustomizerStore()

  const meaningfulCustomization = useCustomizerStore(selectHasMeaningfulCustomization)

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
  const hydratedDesignIdRef = useRef<string | null>(null)
  const hydratedProductRef = useRef<string | null>(null)
  const pendingLogoByLayerRef = useRef<Map<string, File>>(new Map())

  const [cartActionError, setCartActionError] = useState<string | null>(null)
  const [addToCartSuccessOpen, setAddToCartSuccessOpen] = useState(false)
  const [addToCartSuccessPreviewUrl, setAddToCartSuccessPreviewUrl] = useState<string | null>(null)
  const [savePhase, setSavePhase] = useState<SavePhase>('idle')
  const [previewWarning, setPreviewWarning] = useState<string | null>(null)
  const [lastPreviewSuccess, setLastPreviewSuccess] = useState(false)
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)

  const cartVariantValidation = useMemo(
    () => validateCustomizerCartVariant(catalogProduct, { baseColor, size }),
    [catalogProduct, baseColor, size],
  )

  const canAddToCart = cartVariantValidation.status === 'ok'
  const isEditingSavedDesign = Boolean(loadedDesign?.id)

  const buildConfigPayload = useCallback(
    (overrides?: { productVariantId?: string | null }) => {
      const existingPreviews = readPreviewsFromConfig(configJsonRef.current)
      const variantId = overrides?.productVariantId ?? selectedVariantId
      const payloadBase = buildDesignConfigJson({
        product,
        productVariantId: variantId,
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
        layers: useCustomizerStore.getState().layers,
      })
      return existingPreviews ? { ...payloadBase, previews: existingPreviews } : payloadBase
    },
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
    ],
  )

  // Initialize or hydrate store before paint so panels never use fallback on first frame.
  useLayoutEffect(() => {
    if (loadedDesign && hydratedDesignIdRef.current !== loadedDesign.id) {
      hydrateFromDesign(product, {
        designId: loadedDesign.id,
        configJson: loadedDesign.configJson,
        updatedAt: loadedDesign.updatedAt,
      })
      previewUrlRef.current = loadedDesign.previewUrl
      configJsonRef.current = loadedDesign.configJson
      hydratedDesignIdRef.current = loadedDesign.id
      hydratedProductRef.current = product.id
      return
    }

    if (loadedDesign) return

    if (hydratedProductRef.current === product.id) return

    const localDraft = loadCustomizerLocalDraft(product.slug)
    if (localDraft?.productId === product.id) {
      hydrateFromLocalDraft(product, localDraft.configJson)
      configJsonRef.current = localDraft.configJson
      hydratedProductRef.current = product.id
      hydratedDesignIdRef.current = null
      return
    }

    initFromProduct(product)
    hydratedProductRef.current = product.id
    hydratedDesignIdRef.current = null
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset only when switching products
  }, [
    product.id,
    product.slug,
    loadedDesign,
    hydrateFromDesign,
    hydrateFromLocalDraft,
    initFromProduct,
  ])

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

  const uploadPendingLogos = useCallback(
    async (targetDesignId: string) => {
      const state = useCustomizerStore.getState()
      for (const layer of state.layers) {
        const pendingFile = pendingLogoByLayerRef.current.get(layer.id)
        if (!pendingFile) continue
        if (!layer.assetUrl?.startsWith('blob:')) continue

        const uploaded = await uploadDesignLogo({
          file: pendingFile,
          designId: targetDesignId,
        })
        syncLayerAssets(layer.id, {
          assetUrl: uploaded.assetUrl,
          assetPublicId: uploaded.assetPublicId,
        })
        URL.revokeObjectURL(layer.assetUrl)
        pendingLogoByLayerRef.current.delete(layer.id)
      }
    },
    [syncLayerAssets],
  )

  const persistToDatabase = useCallback(
    async (options?: {
      force?: boolean
      productVariantId?: string | null
    }): Promise<string | null> => {
      if (!product) return null

      const force = options?.force ?? false
      const state = useCustomizerStore.getState()
      const meaningful = selectHasMeaningfulCustomization(state)

      if (!state.designId) {
        if (
          !shouldCreateDesignInDatabase({
            isAuthenticated,
            force,
            interactionCount: state.interactionCount,
            meaningful,
          })
        ) {
          return null
        }
      } else if (
        !shouldUpdateExistingDesign({
          isAuthenticated,
          force,
          isDirty: state.isDirty,
          interactionCount: state.interactionCount,
          meaningful,
        })
      ) {
        return state.designId
      }

      let activeDesignId = state.designId

      if (!activeDesignId) {
        const payload = buildConfigPayload({ productVariantId: options?.productVariantId })
        const created = await createDraft.mutateAsync({
          productId: product.id,
          productVariantId: options?.productVariantId ?? selectedVariantId,
          configJson: payload,
        })
        activeDesignId = created.id
        setDesignId(created.id)
        previewUrlRef.current = created.previewUrl
        configJsonRef.current = created.configJson
        cacheGuestDesign(created)
      }

      if (activeDesignId && pendingLogoByLayerRef.current.size > 0) {
        await uploadPendingLogos(activeDesignId)
      }

      const payload = buildConfigPayload({ productVariantId: options?.productVariantId })
      const updated = await updateDesign.mutateAsync({
        designId: activeDesignId,
        configJson: payload,
      })
      previewUrlRef.current = updated.previewUrl
      configJsonRef.current = updated.configJson
      cacheGuestDesign(updated)
      return activeDesignId
    },
    [
      product,
      isAuthenticated,
      createDraft,
      selectedVariantId,
      buildConfigPayload,
      setDesignId,
      updateDesign,
      uploadPendingLogos,
    ],
  )

  const persistLocalDraft = useCallback(() => {
    if (!product) return
    const payload = buildConfigPayload()
    saveCustomizerLocalDraft({
      productId: product.id,
      productSlug: product.slug,
      savedAt: new Date().toISOString(),
      configJson: payload,
    })
    configJsonRef.current = payload
    setHasLocalDraft(true)
    setLastSavedAt(new Date().toISOString())
    markDirty(false)
    setSaveStatus('saved')
    setSavePhase('idle')
  }, [product, buildConfigPayload, setHasLocalDraft, setLastSavedAt, markDirty, setSaveStatus])

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
        setPreviewWarning('Guardamos la configuración, pero no pudimos generar la vista previa.')
        return false
      }

      try {
        setSavePhase('capturing_front')
        const blobs = await capture.captureDesignPreviews()
        if (!blobs) {
          setPreviewWarning('Guardamos la configuración, pero no pudimos generar la vista previa.')
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

    const state = useCustomizerStore.getState()
    const meaningful = selectHasMeaningfulCustomization(state)
    if (
      !shouldAutosaveDraft({
        isDirty: state.isDirty,
        interactionCount: state.interactionCount,
        meaningful,
      })
    ) {
      return state.designId
    }

    setSaveStatus('saving')
    setSavePhase('saving_config')
    try {
      if (isAuthenticated) {
        const id = await persistToDatabase({ force: false })
        if (id) {
          setLastSavedAt(new Date().toISOString())
          markDirty(false)
          setSaveStatus('saved')
        } else {
          setSaveStatus('idle')
        }
        setSavePhase('idle')
        return id
      }

      persistLocalDraft()
      return null
    } catch {
      setSaveStatus('error')
      setSavePhase('error')
      return null
    }
  }, [
    product,
    isAuthenticated,
    persistToDatabase,
    persistLocalDraft,
    setSaveStatus,
    setLastSavedAt,
    markDirty,
  ])

  /** Manual save: config + front/back previews for auth; local draft for guests. */
  const runSaveWithPreviews = useCallback(async (): Promise<string | null> => {
    if (!product) return null
    setSaveStatus('saving')
    setSavePhase('saving_config')
    setPreviewWarning(null)
    setLastPreviewSuccess(false)

    try {
      if (!isAuthenticated) {
        persistLocalDraft()
        setSaveStatus('saved')
        setSavePhase('idle')
        return null
      }

      const id = await persistToDatabase({ force: true })
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
    isAuthenticated,
    persistToDatabase,
    persistLocalDraft,
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
    const resolvedVariantId = resolvedVariant?.id ?? null

    if (resolvedVariantId && resolvedVariantId !== selectedVariantId) {
      setSelectedVariant(resolvedVariantId)
    }

    let ensuredDesignId = designId
    if (!ensuredDesignId || isDirty || pendingLogoByLayerRef.current.size > 0) {
      ensuredDesignId = await persistToDatabase({
        force: true,
        productVariantId: resolvedVariantId,
      })
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
        productVariantId: resolvedVariantId,
        designId: ensuredDesignId,
        quantity,
      })

      clearCustomizerLocalDraft()
      setHasLocalDraft(false)
      markDirty(false)
      setSaveStatus('saved')

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
    configJson,
    viewMode,
    addToCart,
    selectedVariantId,
    setSelectedVariant,
    baseColor,
    size,
    quantity,
    persistToDatabase,
    setHasLocalDraft,
    markDirty,
    setSaveStatus,
  ])

  const handleUploadLogo = useCallback(
    async (file: File) => {
      setLogoUploadError(null)

      if (designId) {
        try {
          const uploaded = await uploadDesignLogo({
            file,
            designId,
          })
          addLogoElement({
            name: 'Logotipo',
            assetUrl: uploaded.assetUrl,
            assetPublicId: uploaded.assetPublicId,
            zone: 'pecho',
          })
        } catch (error) {
          const message = error instanceof Error ? error.message : 'No pudimos subir el logotipo.'
          setLogoUploadError(message)
          throw error
        }
        return
      }

      const blobUrl = URL.createObjectURL(file)
      addLogoElement({
        name: 'Logotipo',
        assetUrl: blobUrl,
        zone: 'pecho',
      })
      const layerId = useCustomizerStore.getState().selectedLayerId
      if (layerId) {
        pendingLogoByLayerRef.current.set(layerId, file)
      }
    },
    [addLogoElement, designId],
  )

  useEffect(() => {
    if (!isDirty || !product) return
    if (savePhase !== 'idle' && savePhase !== 'saved' && savePhase !== 'preview_failed') {
      return
    }

    const state = useCustomizerStore.getState()
    const meaningful = selectHasMeaningfulCustomization(state)
    if (
      !shouldAutosaveDraft({
        isDirty: state.isDirty,
        interactionCount: state.interactionCount,
        meaningful,
      })
    ) {
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
  }, [isDirty, product, runSaveConfig, savePhase, interactionCount, meaningfulCustomization])

  const isSaving =
    saveStatus === 'saving' ||
    savePhase === 'saving_config' ||
    savePhase === 'capturing_front' ||
    savePhase === 'capturing_back' ||
    savePhase === 'uploading_previews' ||
    savePhase === 'confirming_previews'

  const saveStatusLabel = savePhaseLabel({
    phase: savePhase,
    isDirty,
    saveStatus,
    isAuthenticated,
    designId,
    hasLocalDraft,
  })

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
      {isEditingSavedDesign ? (
        <div
          className="border-b border-primary/20 bg-primary/5 px-4 py-2 text-sm text-foreground"
          data-testid="customizer-editing-saved-design-banner"
        >
          Editando diseño guardado
        </div>
      ) : null}
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
