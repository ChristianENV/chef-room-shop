'use client'

import dynamic from 'next/dynamic'
import type { RefObject } from 'react'
import { motion } from 'framer-motion'
import { Layers, SlidersHorizontal } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { LeftSidebar } from './left-sidebar'
import { RightSidebar } from './right-sidebar'
import { TopToolbar, ViewportControls, BottomActionBar } from './toolbar'
import type { ViewportCaptureHandle } from './viewport-3d'

// Dynamic import for 3D viewport to avoid SSR issues
const Viewport3D = dynamic(() => import('./viewport-3d'), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center bg-gradient-to-br from-[#0a0a12] via-[#0f0f1a] to-[#0a0a12]">
      <div className="text-muted-foreground">Cargando visor 3D...</div>
    </div>
  ),
})

interface DesignerLayoutProps {
  onSaveDesign?: () => void
  onAddToCart?: () => void
  isSaving?: boolean
  isAddingToCart?: boolean
  isAddToCartDisabled?: boolean
  saveStatusLabel?: string
  viewportCaptureRef?: RefObject<ViewportCaptureHandle | null>
  productOptions?: CatalogProduct[]
  selectedProductSlug?: string | null
  onSelectProduct?: (slug: string) => void
  onUploadLogo?: (file: File) => Promise<void>
}

export function DesignerLayout({
  onSaveDesign,
  onAddToCart,
  isSaving,
  isAddingToCart,
  isAddToCartDisabled = false,
  saveStatusLabel,
  viewportCaptureRef,
  productOptions = [],
  selectedProductSlug,
  onSelectProduct,
  onUploadLogo,
}: DesignerLayoutProps) {
  return (
    <div className="relative flex h-full w-full overflow-hidden bg-background">
      {/* Left region (rail + contextual panel) — desktop / tablet */}
      <motion.div
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 hidden h-full md:block"
      >
        <LeftSidebar
          productOptions={productOptions}
          selectedProductSlug={selectedProductSlug}
          onSelectProduct={onSelectProduct}
          onUploadLogo={onUploadLogo}
        />
      </motion.div>

      {/* Main viewport area */}
      <div className="relative flex-1">
        <TopToolbar
          onSaveDesign={onSaveDesign}
          onAddToCart={onAddToCart}
          isSaving={isSaving}
          isAddingToCart={isAddingToCart}
          isAddToCartDisabled={isAddToCartDisabled}
          saveStatusLabel={saveStatusLabel}
        />

        <div className="h-full w-full">
          <Viewport3D ref={viewportCaptureRef} />
        </div>

        <ViewportControls />

        {/* Mobile panel triggers */}
        <div className="absolute left-1/2 top-32 z-20 flex -translate-x-1/2 gap-2 md:hidden">
          <Sheet>
            <SheetTrigger className="customizer-glass flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium">
              <SlidersHorizontal className="size-3.5" />
              Diseño
            </SheetTrigger>
            <SheetContent side="left" className="w-[88vw] max-w-sm p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Opciones de diseño</SheetTitle>
              </SheetHeader>
              <div className="h-full overflow-hidden">
                <LeftSidebar
                  productOptions={productOptions}
                  selectedProductSlug={selectedProductSlug}
                  onSelectProduct={onSelectProduct}
                  onUploadLogo={onUploadLogo}
                />
              </div>
            </SheetContent>
          </Sheet>

          <Sheet>
            <SheetTrigger className="customizer-glass flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-medium">
              <Layers className="size-3.5" />
              Elementos
            </SheetTrigger>
            <SheetContent side="right" className="flex w-[88vw] max-w-[420px] flex-col p-0">
              <SheetHeader className="sr-only">
                <SheetTitle>Elementos del diseño</SheetTitle>
              </SheetHeader>
              <div className="flex min-h-0 flex-1 flex-col overflow-hidden">
                <RightSidebar />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        <BottomActionBar
          onAddToCart={onAddToCart}
          isAddingToCart={isAddingToCart}
          isAddToCartDisabled={isAddToCartDisabled}
        />
      </div>

      {/* Right panel — large screens */}
      <motion.div
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.3 }}
        className="relative z-10 hidden h-full min-h-0 shrink-0 xl:block"
      >
        <RightSidebar />
      </motion.div>
    </div>
  )
}
