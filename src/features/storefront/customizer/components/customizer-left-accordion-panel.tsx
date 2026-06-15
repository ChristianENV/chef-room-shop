'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { AlertCircle } from 'lucide-react'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { cn } from '@/lib/utils'
import type { CustomizerCategory } from '../lib/customizer-categories'
import {
  CUSTOMIZER_ACCORDION_SECTIONS,
  CUSTOMIZER_ADMIN_ACCORDION_SECTION,
  type CustomizerAccordionSectionId,
  railScrollTarget,
} from '../lib/customizer-accordion-sections'
import {
  loadCustomizerAccordionOpen,
  saveCustomizerAccordionOpen,
} from '../lib/customizer-accordion-storage'
import { useCustomizerStore } from '../store/customizer.store'
import { CustomizerProductSelector } from './customizer-product-selector'
import { ColorSection } from './sections/color-section'
import { SizeSection } from './sections/size-section'
import { GarmentStyleSection } from './sections/garment-style-section'
import { PersonalizationSection } from './sections/personalization-section'
import { SavedDesignsSection } from './sections/saved-designs-section'
import { TextNamesSection } from './sections/text-names-section'
import { LogoUploadSection } from './sections/logo-upload-section'
import { Debug3dSection } from './sections/debug-3d-section'

interface CustomizerLeftAccordionPanelProps {
  productOptions: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
  onUploadLogo?: (file: File) => Promise<void>
  activeRailCategory: CustomizerCategory
  isAdmin: boolean
  panelCollapsed: boolean
}

function SectionErrorBadge() {
  return (
    <span
      className="inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-destructive/15 text-destructive"
      aria-hidden
    >
      <AlertCircle className="size-3.5" />
    </span>
  )
}

export function CustomizerLeftAccordionPanel({
  productOptions,
  selectedProductSlug,
  onSelectProduct,
  onUploadLogo,
  activeRailCategory,
  isAdmin,
  panelCollapsed,
}: CustomizerLeftAccordionPanelProps) {
  const product = useCustomizerStore((state) => state.product)
  const [openSections, setOpenSections] = useState<CustomizerAccordionSectionId[]>(() =>
    loadCustomizerAccordionOpen(),
  )
  const [logoUploadError, setLogoUploadError] = useState<string | null>(null)
  const sectionRefs = useRef<Partial<Record<CustomizerAccordionSectionId, HTMLDivElement>>>({})

  const sections = useMemo(
    () =>
      isAdmin
        ? [...CUSTOMIZER_ACCORDION_SECTIONS, CUSTOMIZER_ADMIN_ACCORDION_SECTION]
        : CUSTOMIZER_ACCORDION_SECTIONS,
    [isAdmin],
  )

  const sectionErrors = useMemo(() => {
    const errors: Partial<Record<CustomizerAccordionSectionId, boolean>> = {}
    if (!product) return errors

    const requiresVariant = product.variants.length > 0
    if (requiresVariant && product.colors.length === 0) {
      errors.colores = true
    }
    if (requiresVariant && product.sizes.length === 0) {
      errors.talla = true
    }
    if (logoUploadError) {
      errors.logotipos = true
    }
    return errors
  }, [product, logoUploadError])

  const handleOpenChange = useCallback((next: string[]) => {
    const valid = next.filter((id): id is CustomizerAccordionSectionId =>
      [
        'producto',
        'colores',
        'texto',
        'logotipos',
        'extras',
        'talla',
        'bordados',
        'disenos',
        'debug3d',
      ].includes(id),
    )
    setOpenSections(valid)
    saveCustomizerAccordionOpen(valid)
  }, [])

  const focusRailCategory = useCallback(
    (category: CustomizerCategory) => {
      const target = railScrollTarget(category)
      setOpenSections((current) => {
        const fromRail =
          category === 'extras'
            ? (['extras', 'talla', 'bordados'] as const)
            : ([target] as const)
        const merged = [...new Set([...current, ...fromRail])]
        saveCustomizerAccordionOpen(merged)
        return merged
      })

      window.requestAnimationFrame(() => {
        const node = sectionRefs.current[target]
        if (!node) return
        node.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      })
    },
    [],
  )

  useEffect(() => {
    if (panelCollapsed) return
    focusRailCategory(activeRailCategory)
  }, [activeRailCategory, panelCollapsed, focusRailCategory])

  const renderSectionContent = (sectionId: CustomizerAccordionSectionId) => {
    switch (sectionId) {
      case 'producto':
        return (
          <div className="px-1 pb-2">
            {productOptions.length > 0 && onSelectProduct ? (
              <CustomizerProductSelector
                products={productOptions}
                selectedSlug={selectedProductSlug ?? product?.slug ?? null}
                onSelectProduct={onSelectProduct}
              />
            ) : (
              <div className="rounded-lg border border-border/60 bg-card px-3 py-2 text-sm font-medium">
                {product?.name ?? 'Producto'}
              </div>
            )}
          </div>
        )
      case 'colores':
        return <ColorSection embedded />
      case 'texto':
        return <TextNamesSection embedded />
      case 'logotipos':
        return onUploadLogo ? (
          <LogoUploadSection
            embedded
            onUploadLogo={onUploadLogo}
            onErrorChange={setLogoUploadError}
          />
        ) : null
      case 'extras':
        return <GarmentStyleSection embedded />
      case 'talla':
        return <SizeSection embedded />
      case 'bordados':
        return <PersonalizationSection embedded />
      case 'disenos':
        return <SavedDesignsSection embedded />
      case 'debug3d':
        return <Debug3dSection />
      default:
        return null
    }
  }

  return (
    <div className="min-h-0 flex-1 overflow-y-auto customizer-panel-scroll">
      <Accordion
        type="multiple"
        value={openSections}
        onValueChange={handleOpenChange}
        className="px-2"
      >
        {sections.map((section) => {
          const hasError = sectionErrors[section.id] === true
          return (
            <div
              key={section.id}
              ref={(node) => {
                if (node) sectionRefs.current[section.id] = node
              }}
            >
            <AccordionItem
              value={section.id}
              data-testid={section.testId}
              className="border-border/40"
            >
              <AccordionTrigger
                className={cn(
                  'px-2 py-3 text-sm font-semibold hover:no-underline',
                  hasError && 'text-destructive',
                )}
              >
                <span className="flex min-w-0 flex-1 items-center gap-2">
                  <span className="truncate">{section.label}</span>
                  {hasError ? <SectionErrorBadge /> : null}
                </span>
              </AccordionTrigger>
              <AccordionContent className="px-0" forceMount>
                {renderSectionContent(section.id)}
              </AccordionContent>
            </AccordionItem>
            </div>
          )
        })}
      </Accordion>
    </div>
  )
}
