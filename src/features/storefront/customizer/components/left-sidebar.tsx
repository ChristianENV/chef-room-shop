'use client'

import { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { cn } from '@/lib/utils'
import { useCustomizerStore } from '../store/customizer.store'
import { CUSTOMIZER_CATEGORIES } from '../lib/customizer-categories'
import type { CustomizerCategory } from '../lib/customizer-categories'
import { CustomizerLeftRail } from './customizer-left-rail'
import { CustomizerProductSelector } from './customizer-product-selector'
import { ColorSection } from './sections/color-section'
import { SizeSection } from './sections/size-section'
import { GarmentStyleSection } from './sections/garment-style-section'
import { PersonalizationSection } from './sections/personalization-section'
import { SavedDesignsSection } from './sections/saved-designs-section'
import { ElementAddSection } from './sections/element-add-section'

interface LeftSidebarProps {
  productOptions?: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
}

function CategoryContent({
  category,
  productOptions,
  selectedProductSlug,
  onSelectProduct,
}: {
  category: CustomizerCategory
  productOptions: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
}) {
  const product = useCustomizerStore((state) => state.product)

  switch (category) {
    case 'producto':
      return (
        <div className="space-y-4 p-4">
          <div>
            <h3 className="text-sm font-semibold text-foreground">Producto</h3>
            <p className="text-xs text-muted-foreground">Elige la prenda a personalizar.</p>
          </div>
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
      return <ColorSection />
    case 'texto':
      return (
        <ElementAddSection
          title="Texto"
          description="Agrega una frase o palabra a tu prenda."
          ctaLabel="Agregar texto"
          elementType="text"
          elementName="Texto"
          matchTypes={['text']}
          variant="text"
        />
      )
    case 'logotipos':
      return (
        <ElementAddSection
          title="Logotipos"
          description="Coloca el logo de tu marca en la prenda."
          ctaLabel="Agregar logo"
          elementType="logo"
          elementName="Logo"
          matchTypes={['logo']}
          note="La carga de archivos de logo llegará pronto."
        />
      )
    case 'nombres':
      return (
        <ElementAddSection
          title="Nombres"
          description="Agrega el nombre del chef o del equipo."
          ctaLabel="Agregar nombre"
          elementType="text"
          elementName="Nombre"
          matchTypes={['text']}
          variant="name"
        />
      )
    case 'extras':
      return (
        <>
          <GarmentStyleSection />
          <div className="border-t border-border/30" />
          <SizeSection />
          <div className="border-t border-border/30" />
          <PersonalizationSection />
        </>
      )
    case 'disenos':
      return <SavedDesignsSection />
    default:
      return null
  }
}

export function LeftSidebar({
  productOptions = [],
  selectedProductSlug,
  onSelectProduct,
}: LeftSidebarProps) {
  const [active, setActive] = useState<CustomizerCategory>('producto')
  const [collapsed, setCollapsed] = useState(false)

  const activeLabel = CUSTOMIZER_CATEGORIES.find((item) => item.id === active)?.label ?? ''

  return (
    <div className="flex h-full">
      <CustomizerLeftRail
        active={active}
        onChange={(category) => {
          setActive(category)
          setCollapsed(false)
        }}
      />
      <div
        className={cn(
          'flex h-full flex-col border-r border-border/40 bg-card/30 transition-all',
          collapsed ? 'w-0 overflow-hidden' : 'w-[300px]',
        )}
      >
        <div className="flex items-center justify-between border-b border-border/40 px-4 py-3">
          <span className="text-sm font-semibold text-foreground">{activeLabel}</span>
          <button
            type="button"
            onClick={() => setCollapsed(true)}
            title="Ocultar panel"
            className="text-muted-foreground hover:text-foreground"
          >
            <PanelLeftClose className="size-4" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto">
          <CategoryContent
            category={active}
            productOptions={productOptions}
            selectedProductSlug={selectedProductSlug}
            onSelectProduct={onSelectProduct}
          />
        </div>
      </div>
      {collapsed ? (
        <button
          type="button"
          onClick={() => setCollapsed(false)}
          className="flex h-full w-6 items-center justify-center border-r border-border/40 bg-card/30 text-muted-foreground hover:text-foreground"
          title="Mostrar panel"
        >
          <PanelLeftClose className="size-4 rotate-180" />
        </button>
      ) : null}
    </div>
  )
}
