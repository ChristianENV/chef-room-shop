'use client'

import { useState } from 'react'
import { PanelLeftClose } from 'lucide-react'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { cn } from '@/lib/utils'
import {
  CUSTOMIZER_ADMIN_CATEGORY,
  CUSTOMIZER_CATEGORIES,
} from '../lib/customizer-categories'
import type { CustomizerCategory, CustomizerCategoryItem } from '../lib/customizer-categories'
import { useIsAdminUser } from '@/src/features/storefront/hooks/use-is-admin-user'
import { CustomizerLeftRail } from './customizer-left-rail'
import { CustomizerLeftAccordionPanel } from './customizer-left-accordion-panel'

interface LeftSidebarProps {
  productOptions?: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
  onUploadLogo?: (file: File) => Promise<void>
}

export function LeftSidebar({
  productOptions = [],
  selectedProductSlug,
  onSelectProduct,
  onUploadLogo,
}: LeftSidebarProps) {
  const isAdmin = useIsAdminUser()
  const [active, setActive] = useState<CustomizerCategory>('producto')
  const [collapsed, setCollapsed] = useState(false)

  const railCategories: CustomizerCategoryItem[] = isAdmin
    ? [...CUSTOMIZER_CATEGORIES, CUSTOMIZER_ADMIN_CATEGORY]
    : CUSTOMIZER_CATEGORIES

  const activeLabel = railCategories.find((item) => item.id === active)?.label ?? 'Opciones'

  return (
    <div className="flex h-full">
      <CustomizerLeftRail
        categories={railCategories}
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
        <CustomizerLeftAccordionPanel
          productOptions={productOptions}
          selectedProductSlug={selectedProductSlug}
          onSelectProduct={onSelectProduct}
          onUploadLogo={onUploadLogo}
          activeRailCategory={active}
          isAdmin={isAdmin}
          panelCollapsed={collapsed}
        />
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
