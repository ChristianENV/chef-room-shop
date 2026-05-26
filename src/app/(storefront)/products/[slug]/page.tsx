'use client'

import { useMemo } from 'react'
import { useParams, useRouter } from 'next/navigation'
import {
  ProductGallery,
  ProductInfo,
  CustomizationSummaryCard,
  ProductTabs,
  RelatedProducts,
  StickyBuyBar,
  ProductPageSkeleton,
  ProductNotFound,
  ProductError,
} from '@/src/features/storefront/products'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { useProductsQuery } from '@/src/features/storefront/catalog/api/use-products-query'
import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import { useProductQuery } from '@/src/features/storefront/products/api/use-product-query'
import { mapProductDetailToUi } from '@/src/features/storefront/products/mappers/product-ui.mapper'
import { routes, shopCategoryUrl } from '@/src/config/routes'

const categoryNames: Record<string, string> = {
  filipinas: 'Filipinas',
  mandiles: 'Mandiles',
  pantalones: 'Pantalones',
  accesorios: 'Accesorios',
}

export default function ProductPage() {
  const router = useRouter()
  const params = useParams()
  const slug = typeof params.slug === 'string' ? params.slug : ''

  const {
    data: detail,
    isLoading: isProductLoading,
    isError: isProductError,
    refetch: refetchProduct,
  } = useProductQuery(slug)

  const { data: catalogData } = useProductsQuery({ limit: 100 })

  const product = useMemo(
    () => (detail ? mapProductDetailToUi(detail) : null),
    [detail],
  )

  const relatedProducts = useMemo(() => {
    if (!catalogData) return []
    return catalogData.items
      .filter((item) => item.slug !== slug)
      .map(mapCatalogProductToCard)
  }, [catalogData, slug])

  const handleCustomize = () => {
    router.push(routes.customize)
  }

  if (isProductLoading) {
    return <ProductPageSkeleton />
  }

  if (isProductError) {
    return (
      <ProductError
        onRetry={() => {
          void refetchProduct()
        }}
      />
    )
  }

  if (!product) {
    return <ProductNotFound />
  }

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink
                href={routes.home}
                className="font-serif text-muted-foreground hover:text-foreground"
              >
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={routes.shop}
                className="font-serif text-muted-foreground hover:text-foreground"
              >
                Catálogo
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink
                href={shopCategoryUrl(product.category)}
                className="font-serif text-muted-foreground hover:text-foreground"
              >
                {categoryNames[product.category] || product.category}
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-serif text-foreground">
                {product.name}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>

        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery
            images={product.images}
            productName={product.name}
            badges={{
              customizable: product.customizable,
              popular: product.badge === 'popular',
              productionDays: 7,
            }}
          />

          <ProductInfo
            key={product.id}
            product={product}
            onCustomize={handleCustomize}
          />
        </div>

        {product.customizable && (
          <div className="mt-12">
            <CustomizationSummaryCard productId={product.id} />
          </div>
        )}

        <div className="mt-12 border-t border-border pt-12">
          <ProductTabs product={product} />
        </div>

        <div className="border-t border-border">
          <RelatedProducts
            currentProductId={product.id}
            products={relatedProducts}
          />
        </div>
      </div>

      <StickyBuyBar price={product.price} onCustomize={handleCustomize} />

      <div className="h-24 md:hidden" />
    </>
  )
}
