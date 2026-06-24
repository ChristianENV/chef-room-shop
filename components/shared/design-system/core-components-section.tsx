'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import {
  ProductCard,
  ProductBadge,
  PriceDisplay,
  CustomizationBadge,
  StatusBadge,
  EmptyState,
  ErrorState,
  LoadingSkeleton,
  CTAButtonGroup,
  FeatureCard,
  TrustBadge,
  TrustBadgesRow,
} from '@/components/brand'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { Edit3, Palette, Package } from 'lucide-react'

export function CoreComponentsSection() {
  const sampleProduct = MOCK_PRODUCTS[0]

  return (
    <section id="components" className="scroll-mt-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Componentes Core</CardTitle>
          <p className="font-serif text-muted-foreground">
            Componentes reutilizables de la plataforma Chef Room
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Product Cards */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Product Cards
            </h3>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {MOCK_PRODUCTS.slice(0, 4).map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <ProductCard product={sampleProduct} variant="compact" />
              <ProductCard product={sampleProduct} variant="compact" />
            </div>
          </div>

          <Separator />

          {/* Badges & Prices */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Badges y Precios
            </h3>
            <div className="space-y-4">
              <div className="flex flex-wrap gap-3">
                <ProductBadge type="nuevo" />
                <ProductBadge type="oferta" />
                <ProductBadge type="popular" />
                <ProductBadge type="personalizable" />
                <ProductBadge type="agotado" />
              </div>
              <div className="flex flex-wrap items-end gap-6">
                <div>
                  <span className="font-serif text-xs text-muted-foreground">SM</span>
                  <PriceDisplay price={599} size="sm" />
                </div>
                <div>
                  <span className="font-serif text-xs text-muted-foreground">MD</span>
                  <PriceDisplay price={1299} originalPrice={1599} size="md" />
                </div>
                <div>
                  <span className="font-serif text-xs text-muted-foreground">LG</span>
                  <PriceDisplay price={2499} originalPrice={2999} size="lg" />
                </div>
              </div>
              <div>
                <CustomizationBadge />
              </div>
            </div>
          </div>

          <Separator />

          {/* Status Badges */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Status Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              <StatusBadge status="success" text="En Stock" />
              <StatusBadge status="warning" text="Pocas unidades" />
              <StatusBadge status="error" text="Agotado" />
              <StatusBadge status="info" text="Próximamente" />
            </div>
          </div>

          <Separator />

          {/* Feature Cards */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Feature Cards
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <FeatureCard
                icon={<Edit3 className="h-6 w-6" />}
                title="Personalización Total"
                description="Agrega tu nombre, logo o diseño personalizado a cualquier prenda."
              />
              <FeatureCard
                icon={<Palette className="h-6 w-6" />}
                title="Colores Premium"
                description="Selecciona entre nuestra amplia gama de colores profesionales."
              />
              <FeatureCard
                icon={<Package className="h-6 w-6" />}
                title="Envío Express"
                description="Recibe tu pedido en 3-5 días hábiles a cualquier parte de México."
              />
            </div>
            <div className="mt-4">
              <FeatureCard
                variant="horizontal"
                icon={<Edit3 className="h-6 w-6" />}
                title="Personalización Total"
                description="Agrega tu nombre, logo o diseño personalizado a cualquier prenda."
              />
            </div>
          </div>

          <Separator />

          {/* Trust Badges */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Trust Badges
            </h3>
            <div className="rounded-lg border border-border bg-card p-6">
              <TrustBadgesRow />
            </div>
          </div>

          <Separator />

          {/* CTA Button Groups */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              CTA Button Groups
            </h3>
            <div className="space-y-4">
              <CTAButtonGroup
                primaryLabel="Agregar al Carrito"
                secondaryLabel="Personalizar"
                align="left"
              />
              <CTAButtonGroup
                primaryLabel="Comprar Ahora"
                secondaryLabel="Ver Más Productos"
                align="center"
              />
            </div>
          </div>

          <Separator />

          {/* Empty & Error States */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Estados Vacíos y de Error
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-border bg-card">
                <EmptyState
                  variant="cart"
                  title="Tu carrito esta vacio"
                  description="Explora nuestros productos y agrega los que mas te gusten."
                  action={{
                    label: 'Ver Productos',
                    onClick: () => console.log('Ver productos'),
                  }}
                />
              </div>
              <div className="rounded-lg border border-border bg-card">
                <ErrorState
                  title="Error de conexion"
                  message="No pudimos cargar los productos. Verifica tu conexion e intenta de nuevo."
                  retry={() => console.log('Retry')}
                />
              </div>
            </div>
          </div>

          <Separator />

          {/* Loading Skeletons */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Loading Skeletons
            </h3>
            <div className="grid gap-4 md:grid-cols-3">
              <LoadingSkeleton variant="product-card" />
              <LoadingSkeleton variant="list-item" count={3} />
              <LoadingSkeleton variant="hero" />
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
