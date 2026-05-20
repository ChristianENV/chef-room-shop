'use client'

import { use, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
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
import { getCatalogProducts } from '@/src/features/storefront/catalog/api/catalog.api'
import { mapCatalogProductToCard } from '@/src/features/storefront/catalog/mappers/catalog-ui.mapper'
import { getProductBySlug } from '@/src/features/storefront/products/api/products.api'
import { mapProductDetailToUi } from '@/src/features/storefront/products/mappers/product-ui.mapper'
import type { Product } from '@/lib/types'
import { routes, shopCategoryUrl } from '@/src/config/routes'
import { GraphQLRequestError } from '@/src/lib/graphql/errors'

const categoryNames: Record<string, string> = {
  filipinas: 'Filipinas',
  mandiles: 'Mandiles',
  pantalones: 'Pantalones',
  accesorios: 'Accesorios',
}

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export default function ProductPage({ params }: ProductPageProps) {
  const resolvedParams = use(params)
  const router = useRouter()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const loadProduct = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const [detail, catalog] = await Promise.all([
        getProductBySlug(resolvedParams.slug),
        getCatalogProducts({ limit: 100 }),
      ])

      if (!detail) {
        setProduct(null)
        setRelatedProducts([])
        return
      }

      setProduct(mapProductDetailToUi(detail))
      setRelatedProducts(
        catalog.items
          .filter((item) => item.slug !== resolvedParams.slug)
          .map(mapCatalogProductToCard),
      )
    } catch (err) {
      const message =
        err instanceof GraphQLRequestError
          ? err.message
          : 'No se pudo cargar el producto'
      setError(message)
      setProduct(null)
      setRelatedProducts([])
    } finally {
      setIsLoading(false)
    }
  }, [resolvedParams.slug])

  useEffect(() => {
    const timer = setTimeout(() => {
      void loadProduct()
    }, 0)
    return () => clearTimeout(timer)
  }, [loadProduct])

  const handleRetry = () => {
    void loadProduct()
  }

  const handleCustomize = () => {
    router.push(routes.customize)
  }

  if (isLoading) {
    return <ProductPageSkeleton />
  }

  if (error) {
    return <ProductError onRetry={handleRetry} />
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
