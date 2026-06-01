'use client'

import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { CustomizerProductData } from '../types/customizer-product.types'
import { useCustomizerStore } from '../store/customizer.store'
import { DesignerLayout } from './designer-layout'
import '../customizer.css'

interface CustomizerShellProps {
  product?: CustomizerProductData | null
}

export function CustomizerShell({ product }: CustomizerShellProps) {
  const { initFromProduct, resetCustomizer } = useCustomizerStore()

  useEffect(() => {
    if (product) {
      initFromProduct(product)
      return
    }
    resetCustomizer()
  }, [product, initFromProduct, resetCustomizer])

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
        <DesignerLayout />
      </div>
    </div>
  )
}
