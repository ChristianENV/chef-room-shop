'use client'

import { useMemo } from 'react'
import { useParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { CustomizerShell } from '@/src/features/storefront/customizer'
import { mapProductToCustomizer } from '@/src/features/storefront/customizer/mappers/product-to-customizer.mapper'
import { useProductQuery } from '@/src/features/storefront/products/api/use-product-query'
import { useCustomizationRulesByProductQuery } from '@/src/features/storefront/products/api/use-customization-rules-by-product-query'

export default function CustomizeProductPage() {
  const params = useParams()
  const productSlug =
    typeof params.productSlug === 'string' ? params.productSlug : ''

  const {
    data: product,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useProductQuery(productSlug)

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

  if (isProductLoading || (productId && isRulesLoading)) {
    return (
      <div className="mx-auto max-w-5xl px-6 py-24">
        <p className="font-sans text-sm text-muted-foreground">
          Cargando customizador...
        </p>
      </div>
    )
  }

  if (isProductError || isRulesError) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-sans text-lg font-semibold text-foreground">
          No pudimos cargar este producto para personalizar.
        </p>
        <p className="mt-2 font-serif text-muted-foreground">
          Intenta de nuevo en unos segundos.
        </p>
        <div className="mt-6 flex gap-3">
          <Button onClick={() => void refetchProduct()}>Reintentar producto</Button>
          <Button
            variant="outline"
            onClick={() => {
              void refetchRules()
            }}
          >
            Reintentar reglas
          </Button>
        </div>
      </div>
    )
  }

  if (!mappedProduct) {
    return (
      <div className="mx-auto max-w-3xl px-6 py-24">
        <p className="font-sans text-lg font-semibold text-foreground">
          Producto no encontrado.
        </p>
      </div>
    )
  }

  return <CustomizerShell product={mappedProduct} />
}
