'use client'

import { useState, useEffect, useMemo } from 'react'
import { Plus } from 'lucide-react'
import { AdminPageConfig } from '@/src/features/admin/layout/admin-page-config'
import { Button } from '@/components/ui/button'
import {
  ProductSelector,
  GarmentAreaMap,
  CustomizationAreaCard,
  RuleEditorDrawer,
  PricingPreview,
  UnsavedChangesBar,
} from '@/src/features/admin/customization'
import type { ProductCategory, GarmentAreaId, CustomizationAreaRule } from '@/lib/types'
import { MOCK_CUSTOMIZATION_RULES, saveAllCustomizationRules } from '@/lib/mock-data'

export default function CustomizationRulesPage() {
  // State
  const [selectedType, setSelectedType] = useState<ProductCategory | 'all'>('filipinas')
  const [selectedProductId, setSelectedProductId] = useState<string | null>('admin-1')
  const [selectedArea, setSelectedArea] = useState<GarmentAreaId | null>(null)
  const [rules, setRules] = useState<CustomizationAreaRule[]>([])
  const [originalRules, setOriginalRules] = useState<CustomizationAreaRule[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [editingRule, setEditingRule] = useState<CustomizationAreaRule | null>(null)

  // Load rules
  // TODO: Replace with TanStack Query useQuery
  useEffect(() => {
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      const filteredRules = selectedProductId
        ? MOCK_CUSTOMIZATION_RULES.filter((r) => r.productId === selectedProductId)
        : MOCK_CUSTOMIZATION_RULES.filter((r) => 
            selectedType === 'all' || r.productType === selectedType
          )
      setRules(filteredRules)
      setOriginalRules(JSON.parse(JSON.stringify(filteredRules)))
      setIsLoading(false)
    }, 300)
  }, [selectedProductId, selectedType])

  // Check for unsaved changes
  const hasChanges = useMemo(() => {
    return JSON.stringify(rules) !== JSON.stringify(originalRules)
  }, [rules, originalRules])

  // Get area states for the map
  const areaStates = useMemo(() => {
    const states: Record<GarmentAreaId, { enabled: boolean; hasRules: boolean }> = {
      pecho: { enabled: false, hasRules: false },
      espalda: { enabled: false, hasRules: false },
      'manga-izquierda': { enabled: false, hasRules: false },
      'manga-derecha': { enabled: false, hasRules: false },
      bolsillo: { enabled: false, hasRules: false },
      cuello: { enabled: false, hasRules: false },
    }
    
    rules.forEach((rule) => {
      states[rule.areaId] = { enabled: rule.enabled, hasRules: true }
    })
    
    return states
  }, [rules])

  // Get selected rule
  const selectedRule = useMemo(() => {
    return rules.find((r) => r.areaId === selectedArea) ?? null
  }, [rules, selectedArea])

  // Handlers
  const handleToggleEnabled = (ruleId: string, enabled: boolean) => {
    setRules((prev) =>
      prev.map((r) => (r.id === ruleId ? { ...r, enabled } : r))
    )
  }

  const handleEditRule = (rule: CustomizationAreaRule) => {
    setEditingRule(rule)
    setDrawerOpen(true)
  }

  const handleSaveRule = (updatedRule: CustomizationAreaRule) => {
    setRules((prev) =>
      prev.map((r) => (r.id === updatedRule.id ? updatedRule : r))
    )
  }

  const handleSaveAllChanges = async () => {
    setIsSaving(true)
    try {
      // TODO: Replace with GraphQL mutation
      await saveAllCustomizationRules(rules)
      setOriginalRules(JSON.parse(JSON.stringify(rules)))
    } catch (error) {
      console.error('Error saving rules:', error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleDiscardChanges = () => {
    setRules(JSON.parse(JSON.stringify(originalRules)))
  }

  const handleCreateRule = () => {
    // TODO: Implement create new rule dialog
    console.log('Create new rule')
  }

  return (
    <AdminPageConfig
      breadcrumb={[{ label: 'Personalización' }, { label: 'Reglas' }]}
      environment="DEV"
    >
      <div className="space-y-6 pb-20">
        {/* Page Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="font-sans text-2xl font-bold text-foreground">
              Reglas de Personalización
            </h1>
            <p className="mt-1 font-serif text-muted-foreground">
              Define que zonas, tecnicas y restricciones estaran disponibles en cada prenda.
            </p>
          </div>
          <Button onClick={handleCreateRule}>
            <Plus className="mr-2 h-4 w-4" />
            Nueva Regla
          </Button>
        </div>

        {/* Product Selector */}
        <ProductSelector
          selectedType={selectedType}
          selectedProductId={selectedProductId}
          onTypeChange={setSelectedType}
          onProductChange={setSelectedProductId}
        />

        {/* Main Content Grid */}
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Left: Garment Map + Area Cards */}
          <div className="space-y-6 lg:col-span-2">
            {/* Garment Area Map */}
            <GarmentAreaMap
              productType={selectedType === 'all' ? 'filipinas' : selectedType}
              selectedArea={selectedArea}
              onAreaSelect={setSelectedArea}
              areaStates={areaStates}
            />

            {/* Area Cards Grid */}
            <div>
              <h2 className="mb-4 font-sans text-lg font-semibold text-foreground">
                Zonas Configuradas
              </h2>
              
              {isLoading ? (
                <div className="grid gap-4 sm:grid-cols-2">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="h-48 animate-pulse rounded-lg border border-border bg-card"
                    />
                  ))}
                </div>
              ) : rules.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border bg-card p-8 text-center">
                  <p className="font-serif text-muted-foreground">
                    No hay reglas configuradas para este producto.
                  </p>
                  <Button variant="outline" className="mt-4" onClick={handleCreateRule}>
                    <Plus className="mr-2 h-4 w-4" />
                    Crear Primera Regla
                  </Button>
                </div>
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  {rules.map((rule) => (
                    <CustomizationAreaCard
                      key={rule.id}
                      rule={rule}
                      isSelected={selectedArea === rule.areaId}
                      onSelect={() => setSelectedArea(rule.areaId)}
                      onToggleEnabled={(enabled) => handleToggleEnabled(rule.id, enabled)}
                      onEdit={() => handleEditRule(rule)}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Right: Pricing Preview */}
          <div className="lg:col-span-1">
            <div className="sticky top-20">
              <PricingPreview rule={selectedRule} />
            </div>
          </div>
        </div>
      </div>

      {/* Rule Editor Drawer */}
      <RuleEditorDrawer
        open={drawerOpen}
        onClose={() => {
          setDrawerOpen(false)
          setEditingRule(null)
        }}
        rule={editingRule}
        onSave={handleSaveRule}
      />

      {/* Unsaved Changes Bar */}
      <UnsavedChangesBar
        hasChanges={hasChanges}
        onSave={handleSaveAllChanges}
        onDiscard={handleDiscardChanges}
        isSaving={isSaving}
      />
    </AdminPageConfig>
  )
}
