'use client'

import { useCallback, useMemo, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import type { CatalogProduct } from '@/src/features/storefront/catalog/types'
import { useProductQuery } from '@/src/features/storefront/products/api/use-product-query'
import { useCustomizationRulesByProductQuery } from '@/src/features/storefront/products/api/use-customization-rules-by-product-query'
import { useCustomizableProductsQuery } from '../api/use-customizable-products-query'
import { mapProductToCustomizer } from '../mappers/product-to-customizer.mapper'
import { pickDefaultCustomizableProduct } from '../lib/pick-default-customizable-product'
import { useCustomizerStore } from '../store/customizer.store'
import { CustomizerShell } from './customizer-shell'
import { CustomizerError } from './customizer-error'
import { CustomizerLoading } from './customizer-loading'

interface CustomizerExperienceProps {
  initialProductSlug?: string | null
}

function resolveEffectiveSlug(
  initialProductSlug: string | null | undefined,
  products: CatalogProduct[],
): string | null {
  if (initialProductSlug) return initialProductSlug
  return pickDefaultCustomizableProduct(products)?.slug ?? null
}

export function CustomizerExperience({ initialProductSlug }: CustomizerExperienceProps) {
  const router = useRouter()
  const isDirty = useCustomizerStore((state) => state.isDirty)
  const [pendingSlug, setPendingSlug] = useState<string | null>(null)

  const {
    data: catalogData,
    isLoading: isCatalogLoading,
    isError: isCatalogError,
    refetch: refetchCatalog,
  } = useCustomizableProductsQuery()

  const customizableProducts = useMemo(
    () =>
      (catalogData?.items ?? []).filter(
        (product) => product.isCustomizable && product.status === 'ACTIVE',
      ),
    [catalogData?.items],
  )

  const effectiveSlug = useMemo(
    () => resolveEffectiveSlug(initialProductSlug, customizableProducts),
    [initialProductSlug, customizableProducts],
  )

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useProductQuery(effectiveSlug ?? '')

  const productId = product?.id
  const {
    data: rules = [],
    isLoading: isRulesLoading,
    isError: isRulesError,
    refetch: refetchRules,
  } = useCustomizationRulesByProductQuery(productId)

  const mappedProduct = useMemo(() => {
    if (!product) return null
    const sourceRules = rules.length > 0 ? rules : product.customizationRules
    return mapProductToCustomizer(product, sourceRules)
  }, [product, rules])

  const applyProductSlug = useCallback(
    (slug: string) => {
      if (slug === effectiveSlug) return
      router.replace(routes.customizeProduct(slug))
    },
    [effectiveSlug, router],
  )

  const handleSelectProduct = useCallback(
    (slug: string) => {
      if (slug === effectiveSlug) return
      if (isDirty) {
        setPendingSlug(slug)
        return
      }
      applyProductSlug(slug)
    },
    [applyProductSlug, effectiveSlug, isDirty],
  )

  const handleConfirmSwitch = useCallback(() => {
    if (!pendingSlug) return
    applyProductSlug(pendingSlug)
    setPendingSlug(null)
  }, [applyProductSlug, pendingSlug])

  if (isCatalogLoading) {
    return <CustomizerLoading />
  }

  if (isCatalogError) {
    return (
      <CustomizerError
        onRetry={() => {
          void refetchCatalog()
        }}
      />
    )
  }

  if (customizableProducts.length === 0) {
    return (
      <CustomizerError message="No hay prendas personalizables disponibles en este momento." />
    )
  }

  if (initialProductSlug && !isProductLoading && !isProductError && !product) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-sans text-xl font-bold text-foreground">Producto no encontrado</h1>
        <p className="mt-2 max-w-md font-serif text-muted-foreground">
          No encontramos esa prenda para personalizar. Elige otra desde el customizador.
        </p>
        <Button asChild className="mt-8 font-sans">
          <Link href={routes.customize}>Elegir otra prenda</Link>
        </Button>
      </div>
    )
  }

  if (initialProductSlug && product && !product.isCustomizable) {
    return (
      <div className="flex h-dvh flex-col items-center justify-center px-6 text-center">
        <h1 className="font-sans text-xl font-bold text-foreground">
          Esta prenda no tiene personalización disponible
        </h1>
        <p className="mt-2 max-w-md font-serif text-muted-foreground">
          Selecciona otra prenda personalizable para comenzar tu diseño.
        </p>
        <Button asChild className="mt-8 font-sans">
          <Link href={routes.customize}>Elegir otra prenda</Link>
        </Button>
      </div>
    )
  }

  if (!effectiveSlug || isProductLoading || (productId && isRulesLoading)) {
    return <CustomizerLoading />
  }

  if (isProductError || isRulesError) {
    return (
      <CustomizerError
        onRetry={() => {
          void refetchProduct()
          void refetchRules()
        }}
      />
    )
  }

  if (!mappedProduct) {
    return (
      <CustomizerError message="No pudimos preparar esta prenda para personalizar." />
    )
  }

  return (
    <>
      <CustomizerShell
        product={mappedProduct}
        productOptions={customizableProducts}
        selectedProductSlug={effectiveSlug}
        onSelectProduct={handleSelectProduct}
      />

      <AlertDialog
        open={pendingSlug != null}
        onOpenChange={(open) => {
          if (!open) setPendingSlug(null)
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cambiar de prenda?</AlertDialogTitle>
            <AlertDialogDescription>
              Cambiar de prenda reiniciará tu diseño actual.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Seguir diseñando</AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmSwitch}>
              Cambiar prenda
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
