'use client'

import { use, useState, useEffect } from 'react'
import { PublicLayout } from '@/components/layout'
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
} from '@/components/product'
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb'
import { MOCK_PRODUCTS, fetchProductBySlug } from '@/lib/mock-data'
import type { Product } from '@/lib/types'

// Category name mapping
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
  const [product, setProduct] = useState<Product | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // TODO: Replace with TanStack Query useQuery hook
  // const { data: product, isLoading, error, refetch } = useQuery({
  //   queryKey: ['product', slug],
  //   queryFn: () => fetchProductBySlug(slug),
  // })

  const loadProduct = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await fetchProductBySlug(resolvedParams.slug)
      setProduct(data)
    } catch {
      setError('Failed to load product')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    loadProduct()
  }, [resolvedParams.slug])

  const handleRetry = () => {
    loadProduct()
  }

  const handleCustomize = () => {
    // TODO: Navigate to customizer
    console.log('Open customizer for:', product?.id)
  }

  // Loading state
  if (isLoading) {
    return (
      <PublicLayout>
        <ProductPageSkeleton />
      </PublicLayout>
    )
  }

  // Error state
  if (error) {
    return (
      <PublicLayout>
        <ProductError onRetry={handleRetry} />
      </PublicLayout>
    )
  }

  // Not found state
  if (!product) {
    return (
      <PublicLayout>
        <ProductNotFound />
      </PublicLayout>
    )
  }

  return (
    <PublicLayout>
      <div className="mx-auto max-w-7xl px-4 py-8 md:px-6">
        {/* Breadcrumbs */}
        <Breadcrumb className="mb-6">
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/" className="font-serif text-muted-foreground hover:text-foreground">
                Inicio
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink href="/shop" className="font-serif text-muted-foreground hover:text-foreground">
                Catalogo
              </BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbLink 
                href={`/shop?categoria=${product.category}`}
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

        {/* Main Product Section */}
        <div className="grid gap-8 lg:grid-cols-2 lg:gap-12">
          {/* Left Column - Gallery */}
          <ProductGallery
            images={product.images}
            productName={product.name}
            badges={{
              customizable: product.customizable,
              popular: product.badge === 'popular',
              productionDays: 7,
            }}
          />

          {/* Right Column - Product Info */}
          <ProductInfo product={product} />
        </div>

        {/* Customization Preview Card (for customizable products) */}
        {product.customizable && (
          <div className="mt-12">
            <CustomizationSummaryCard productId={product.id} />
          </div>
        )}

        {/* Product Tabs */}
        <div className="mt-12 border-t border-border pt-12">
          <ProductTabs product={product} />
        </div>

        {/* Related Products */}
        <div className="border-t border-border">
          <RelatedProducts 
            currentProductId={product.id} 
            products={MOCK_PRODUCTS} 
          />
        </div>
      </div>

      {/* Sticky Mobile Buy Bar */}
      <StickyBuyBar 
        price={product.price} 
        onCustomize={handleCustomize} 
      />

      {/* Add padding at bottom for sticky bar on mobile */}
      <div className="h-24 md:hidden" />
    </PublicLayout>
  )
}
