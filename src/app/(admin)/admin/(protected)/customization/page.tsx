'use client'

import { useMemo, useState } from 'react'
import { Copy, Plus } from 'lucide-react'

import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { Button } from '@/components/ui/button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  ProductSelector,
  GarmentAreaMap,
  CustomizationAreaCard,
  RuleEditorDialog,
  PricingPreviewCard,
  DeleteRuleDialog,
  DuplicateRulesDialog,
} from '@/src/features/admin/customization'
import { useAdminCustomizationProductsQuery } from '@/src/features/admin/customization/api/use-admin-customization-products-query'
import { useAdminCustomizationAreasQuery } from '@/src/features/admin/customization/api/use-admin-customization-areas-query'
import { useAdminCustomizationOptionsQuery } from '@/src/features/admin/customization/api/use-admin-customization-options-query'
import { useAdminCustomizationRulesByProductQuery } from '@/src/features/admin/customization/api/use-admin-customization-rules-by-product-query'
import { useAdminCustomizationPricingPreviewQuery } from '@/src/features/admin/customization/api/use-admin-customization-pricing-preview-query'
import { useToggleAdminCustomizationRuleMutation } from '@/src/features/admin/customization/api/use-toggle-admin-customization-rule-mutation'
import { useDeleteAdminCustomizationRuleMutation } from '@/src/features/admin/customization/api/use-delete-admin-customization-rule-mutation'
import { useDuplicateCustomizationRulesToProductMutation } from '@/src/features/admin/customization/api/use-duplicate-customization-rules-to-product-mutation'
import { AdminCustomizationPageSkeleton } from '@/src/features/admin/customization/components/admin-customization-loading'
import { AdminCustomizationError } from '@/src/features/admin/customization/components/admin-customization-error'
import { AdminCustomizationEmpty } from '@/src/features/admin/customization/components/admin-customization-empty'
import {
  groupRulesByArea,
  mapAdminCustomizationRuleToCard,
  mapPricingPreviewToUi,
  mapProductToGarmentMapType,
} from '@/src/features/admin/customization/mappers/admin-customization-ui.mapper'
import type { CustomizationRuleCardUi } from '@/src/features/admin/customization/types/admin-customization-ui.types'
import type { AdminCustomizationRule } from '@/src/features/admin/customization/types'

export default function CustomizationRulesPage() {
  const [productSearch, setProductSearch] = useState('')
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null)
  const [selectedAreaSlug, setSelectedAreaSlug] = useState<string | null>(null)
  const [selectedRuleId, setSelectedRuleId] = useState<string | null>(null)
  const [previewWidth, setPreviewWidth] = useState(8)
  const [previewHeight, setPreviewHeight] = useState(8)
  const [mobileTab, setMobileTab] = useState('zonas')

  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<AdminCustomizationRule | null>(null)
  const [presetAreaId, setPresetAreaId] = useState<string | null>(null)

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deletingRule, setDeletingRule] = useState<CustomizationRuleCardUi | null>(null)

  const [duplicateDialogOpen, setDuplicateDialogOpen] = useState(false)
  const [feedback, setFeedback] = useState<string | null>(null)
  const [togglingRuleId, setTogglingRuleId] = useState<string | null>(null)

  const productsQuery = useAdminCustomizationProductsQuery({ customizable: true })
  const areasQuery = useAdminCustomizationAreasQuery()
  const optionsQuery = useAdminCustomizationOptionsQuery()

  const products = useMemo(() => productsQuery.data ?? [], [productsQuery.data])

  const activeProductId = useMemo(() => {
    if (selectedProductId && products.some((p) => p.id === selectedProductId)) {
      return selectedProductId
    }
    return products[0]?.id ?? null
  }, [selectedProductId, products])

  const selectedProduct = products.find((p) => p.id === activeProductId) ?? null

  const rulesQuery = useAdminCustomizationRulesByProductQuery(
    activeProductId ?? '',
    !!activeProductId,
  )

  const ruleCards = useMemo(
    () => (rulesQuery.data ?? []).map(mapAdminCustomizationRuleToCard),
    [rulesQuery.data],
  )

  const areaGroups = useMemo(() => {
    if (!areasQuery.data) return []
    return groupRulesByArea(rulesQuery.data ?? [], areasQuery.data)
  }, [rulesQuery.data, areasQuery.data])

  const filteredGroups = useMemo(() => {
    if (!selectedAreaSlug) return areaGroups
    return areaGroups.filter((g) => g.areaSlug === selectedAreaSlug)
  }, [areaGroups, selectedAreaSlug])

  const garmentType = selectedProduct ? mapProductToGarmentMapType(selectedProduct) : 'filipinas'

  const areaStates = useMemo(() => {
    const states: Record<string, { enabled: boolean; hasRules: boolean }> = {}
    for (const group of areaGroups) {
      states[group.areaSlug] = {
        hasRules: group.ruleCount > 0,
        enabled: group.hasAnyEnabled,
      }
    }
    return states
  }, [areaGroups])

  const selectedRule = ruleCards.find((r) => r.id === selectedRuleId) ?? null

  const pricingInput =
    selectedRule && activeProductId
      ? {
          productId: activeProductId,
          areaId: selectedRule.areaId,
          optionId: selectedRule.optionId,
          widthCm: previewWidth,
          heightCm: previewHeight,
        }
      : null

  const pricingQuery = useAdminCustomizationPricingPreviewQuery(pricingInput, !!pricingInput)

  const pricingUi = useMemo(() => {
    if (!pricingQuery.data) return null
    return mapPricingPreviewToUi(pricingQuery.data, previewWidth, previewHeight)
  }, [pricingQuery.data, previewWidth, previewHeight])

  const toggleMutation = useToggleAdminCustomizationRuleMutation()
  const deleteMutation = useDeleteAdminCustomizationRuleMutation()
  const duplicateMutation = useDuplicateCustomizationRulesToProductMutation()

  const openCreateRule = (areaId?: string) => {
    setEditingRule(null)
    setPresetAreaId(areaId ?? null)
    setDrawerOpen(true)
  }

  const openEditRule = (card: CustomizationRuleCardUi) => {
    setEditingRule(card.rule)
    setPresetAreaId(null)
    setDrawerOpen(true)
  }

  const handleMapAreaSelect = (areaSlug: string) => {
    setSelectedAreaSlug((prev) => (prev === areaSlug ? null : areaSlug))
    const group = areaGroups.find((g) => g.areaSlug === areaSlug)
    if (group?.rules[0]) {
      setSelectedRuleId(group.rules[0]!.id)
    }
  }

  const handleToggleRule = async (card: CustomizationRuleCardUi, enabled: boolean) => {
    setTogglingRuleId(card.id)
    setFeedback(null)
    try {
      await toggleMutation.mutateAsync({ id: card.id, enabled })
      setFeedback(enabled ? 'Regla activada.' : 'Regla desactivada.')
    } catch (error) {
      setFeedback('No pudimos cambiar el estado de la regla.')
      if (process.env.NODE_ENV === 'development') console.error(error)
    } finally {
      setTogglingRuleId(null)
    }
  }

  const handleDeleteConfirm = async () => {
    if (!deletingRule) return
    try {
      await deleteMutation.mutateAsync({
        id: deletingRule.id,
        productId: deletingRule.productId,
      })
      setFeedback('Regla eliminada.')
      if (selectedRuleId === deletingRule.id) setSelectedRuleId(null)
      setDeleteDialogOpen(false)
      setDeletingRule(null)
    } catch (error) {
      setFeedback('No pudimos eliminar la regla.')
      if (process.env.NODE_ENV === 'development') console.error(error)
    }
  }

  const handleDuplicate = async (toProductId: string, overwriteExisting: boolean) => {
    if (!activeProductId) return
    try {
      const created = await duplicateMutation.mutateAsync({
        fromProductId: activeProductId,
        toProductId,
        overwriteExisting,
      })
      setFeedback(
        created.length > 0
          ? `Se copiaron ${created.length} reglas al producto destino.`
          : 'No se crearon reglas nuevas (ya existían en destino).',
      )
      setDuplicateDialogOpen(false)
      setSelectedProductId(toProductId)
    } catch (error) {
      setFeedback('No pudimos duplicar las reglas.')
      if (process.env.NODE_ENV === 'development') console.error(error)
    }
  }

  const catalogError = areasQuery.isError || optionsQuery.isError
  const initialLoading = productsQuery.isPending || areasQuery.isPending || optionsQuery.isPending

  const rulesContent = () => {
    if (rulesQuery.isError) {
      return (
        <AdminCustomizationError
          message="No pudimos cargar las reglas de este producto."
          onRetry={() => void rulesQuery.refetch()}
        />
      )
    }
    if (rulesQuery.isPending) {
      return (
        <div className="grid gap-4 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="h-48 animate-pulse rounded-lg border border-border bg-card" />
          ))}
        </div>
      )
    }
    if (ruleCards.length === 0) {
      return <AdminCustomizationEmpty onAction={() => openCreateRule()} />
    }
    return (
      <div className="grid gap-4 sm:grid-cols-2">
        {filteredGroups.map((group) => (
          <CustomizationAreaCard
            key={group.areaId}
            group={group}
            isSelected={selectedAreaSlug === group.areaSlug}
            onSelectArea={() =>
              setSelectedAreaSlug((prev) => (prev === group.areaSlug ? null : group.areaSlug))
            }
            onAddRule={() => openCreateRule(group.areaId)}
            onEditRule={openEditRule}
            onToggleRule={handleToggleRule}
            onDeleteRule={(card) => {
              setDeletingRule(card)
              setDeleteDialogOpen(true)
            }}
            togglingRuleId={togglingRuleId}
          />
        ))}
      </div>
    )
  }

  const mapSection = (
    <GarmentAreaMap
      garmentType={garmentType}
      selectedAreaSlug={selectedAreaSlug}
      onAreaSelect={handleMapAreaSelect}
      areaStates={areaStates}
    />
  )

  const pricingSection = (
    <PricingPreviewCard
      rules={ruleCards}
      selectedRuleId={selectedRuleId}
      onSelectRule={setSelectedRuleId}
      widthCm={previewWidth}
      heightCm={previewHeight}
      onWidthChange={setPreviewWidth}
      onHeightChange={setPreviewHeight}
      preview={pricingUi}
      isLoading={pricingQuery.isFetching}
      isError={pricingQuery.isError}
    />
  )

  if (initialLoading) {
    return (
      <AdminPageConfig
        breadcrumb={[{ label: 'Personalización' }, { label: 'Reglas' }]}
        environment="DEV"
      >
        <AdminCustomizationPageSkeleton />
      </AdminPageConfig>
    )
  }

  if (productsQuery.isError) {
    return (
      <AdminPageConfig
        breadcrumb={[{ label: 'Personalización' }, { label: 'Reglas' }]}
        environment="DEV"
      >
        <AdminCustomizationError onRetry={() => void productsQuery.refetch()} />
      </AdminPageConfig>
    )
  }

  if (products.length === 0) {
    return (
      <AdminPageConfig
        breadcrumb={[{ label: 'Personalización' }, { label: 'Reglas' }]}
        environment="DEV"
      >
        <AdminCustomizationEmpty
          title="Sin productos personalizables"
          description="No hay productos disponibles para configurar. Marca productos como personalizables en el catálogo."
          actionLabel={undefined}
        />
      </AdminPageConfig>
    )
  }

  return (
    <AdminPageConfig
      breadcrumb={[{ label: 'Personalización' }, { label: 'Reglas' }]}
      environment="DEV"
    >
      <div className="space-y-6 pb-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Reglas de personalización
            </h1>
            <p className="mt-1 font-serif text-sm text-muted-foreground">
              Define qué zonas, técnicas y restricciones estarán disponibles en cada prenda.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              disabled={!activeProductId || ruleCards.length === 0}
              onClick={() => setDuplicateDialogOpen(true)}
            >
              <Copy className="mr-2 h-4 w-4" />
              Duplicar reglas
            </Button>
            <Button onClick={() => openCreateRule()} disabled={catalogError}>
              <Plus className="mr-2 h-4 w-4" />
              Nueva regla
            </Button>
          </div>
        </div>

        {feedback ? (
          <Alert>
            <AlertDescription className="font-serif">{feedback}</AlertDescription>
          </Alert>
        ) : null}

        {catalogError ? (
          <Alert variant="destructive">
            <AlertDescription className="font-serif">
              Error al cargar catálogo de áreas u opciones. Recarga la página.
            </AlertDescription>
          </Alert>
        ) : null}

        <ProductSelector
          products={products}
          selectedProductId={selectedProductId}
          search={productSearch}
          onSearchChange={setProductSearch}
          onProductChange={(id) => {
            setSelectedProductId(id)
            setSelectedAreaSlug(null)
            setSelectedRuleId(null)
          }}
        />

        {/* Desktop layout */}
        <div className="hidden lg:grid lg:grid-cols-3 lg:gap-6">
          <div className="space-y-6 lg:col-span-2">
            {mapSection}
            <div>
              <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
                Reglas por zona
                {selectedAreaSlug ? (
                  <Button
                    variant="link"
                    className="ml-2 h-auto p-0 font-sans text-sm"
                    onClick={() => setSelectedAreaSlug(null)}
                  >
                    Ver todas
                  </Button>
                ) : null}
              </h2>
              {rulesContent()}
            </div>
          </div>
          <div className="lg:col-span-1">
            <div className="sticky top-20">{pricingSection}</div>
          </div>
        </div>

        {/* Mobile tabs */}
        <div className="lg:hidden">
          <Tabs value={mobileTab} onValueChange={setMobileTab}>
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="zonas" className="font-sans text-xs">
                Zonas
              </TabsTrigger>
              <TabsTrigger value="reglas" className="font-sans text-xs">
                Reglas
              </TabsTrigger>
              <TabsTrigger value="precio" className="font-sans text-xs">
                Precio
              </TabsTrigger>
            </TabsList>
            <TabsContent value="zonas" className="mt-4">
              {mapSection}
            </TabsContent>
            <TabsContent value="reglas" className="mt-4">
              {rulesContent()}
            </TabsContent>
            <TabsContent value="precio" className="mt-4">
              {pricingSection}
            </TabsContent>
          </Tabs>
        </div>
      </div>

      {activeProductId && selectedProduct && areasQuery.data && optionsQuery.data ? (
        <RuleEditorDialog
          open={drawerOpen}
          onOpenChange={setDrawerOpen}
          productId={activeProductId}
          productName={selectedProduct.name}
          rule={editingRule}
          areas={areasQuery.data}
          options={optionsQuery.data}
          presetAreaId={presetAreaId}
          existingRules={rulesQuery.data ?? []}
          onSaved={() => setFeedback('Regla guardada correctamente.')}
        />
      ) : null}

      <DeleteRuleDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        ruleLabel={deletingRule ? `${deletingRule.areaName} · ${deletingRule.optionName}` : null}
        onConfirm={() => void handleDeleteConfirm()}
        isDeleting={deleteMutation.isPending}
      />

      <DuplicateRulesDialog
        open={duplicateDialogOpen}
        onOpenChange={setDuplicateDialogOpen}
        sourceProduct={selectedProduct}
        targetProducts={products}
        onConfirm={(toId, overwrite) => void handleDuplicate(toId, overwrite)}
        isDuplicating={duplicateMutation.isPending}
      />
    </AdminPageConfig>
  )
}
