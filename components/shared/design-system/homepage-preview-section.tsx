'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  ChefRoomLogo,
  ProductCard,
  TrustBadgesRow,
  CTAButtonGroup,
  FeatureCard,
} from '@/components/brand'
import { MOCK_PRODUCTS } from '@/lib/mock-data'
import { routes } from '@/src/config/routes'
import { Edit3, Menu, ShoppingCart, User, ArrowRight, Palette, Package } from 'lucide-react'
import Link from 'next/link'

export function HomepagePreviewSection() {
  return (
    <section id="preview" className="scroll-mt-8">
      <Card className="border-border bg-card overflow-hidden">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Vista Previa - Homepage</CardTitle>
          <p className="font-serif text-muted-foreground">
            Demostración del sistema de diseño aplicado a la página principal
          </p>
        </CardHeader>
        <CardContent className="p-0">
          {/* Mini Homepage Preview */}
          <div className="border-t border-border">
            {/* Header */}
            <header className="border-b border-border bg-card px-4 py-4 md:px-6">
              <div className="mx-auto flex max-w-6xl items-center justify-between">
                <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" />

                <nav className="hidden items-center gap-6 md:flex">
                  <Link
                    href={routes.chefJackets}
                    className="font-sans text-sm font-medium text-foreground hover:text-accent"
                  >
                    Filipinas
                  </Link>
                  <Link
                    href={routes.aprons}
                    className="font-sans text-sm font-medium text-muted-foreground hover:text-accent"
                  >
                    Mandiles
                  </Link>
                  <Link
                    href={routes.pants}
                    className="font-sans text-sm font-medium text-muted-foreground hover:text-accent"
                  >
                    Pantalones
                  </Link>
                  <Link
                    href={routes.shop}
                    className="font-sans text-sm font-medium text-muted-foreground hover:text-accent"
                  >
                    Tienda
                  </Link>
                </nav>

                <div className="flex items-center gap-3">
                  <Button variant="ghost" size="icon" className="hidden md:flex">
                    <User className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon">
                    <ShoppingCart className="h-5 w-5" />
                  </Button>
                  <Button variant="ghost" size="icon" className="md:hidden">
                    <Menu className="h-5 w-5" />
                  </Button>
                </div>
              </div>
            </header>

            {/* Hero Section */}
            <section className="relative bg-chef-deep-navy px-4 py-16 md:px-6 md:py-24">
              <div className="mx-auto max-w-6xl">
                <div className="max-w-2xl">
                  <span className="mb-4 inline-block font-serif text-sm uppercase tracking-widest text-white/60">
                    Colección 2024
                  </span>
                  <h1 className="font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl text-balance">
                    Tu cocina te define, tu uniforme te distingue
                  </h1>
                  <p className="mt-4 font-serif text-lg text-white/80 max-w-lg text-pretty">
                    Uniformes de chef personalizables de la más alta calidad. Diseña el tuyo y
                    destaca en tu cocina.
                  </p>
                  <div className="mt-8 flex flex-wrap gap-4">
                    <Button size="lg" className="bg-white text-chef-deep-navy hover:bg-white/90">
                      <Edit3 className="mr-2 h-5 w-5" />
                      Personalizar Ahora
                    </Button>
                    <Button
                      size="lg"
                      variant="outline"
                      className="border-white/30 text-white hover:bg-white/10"
                    >
                      Ver Colección
                      <ArrowRight className="ml-2 h-5 w-5" />
                    </Button>
                  </div>
                </div>
              </div>
              {/* Decorative element */}
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-primary/20 to-transparent hidden lg:block" />
            </section>

            {/* Trust Badges */}
            <section className="border-b border-border bg-card px-4 py-6 md:px-6">
              <div className="mx-auto max-w-6xl">
                <TrustBadgesRow />
              </div>
            </section>

            {/* Products Grid */}
            <section className="bg-secondary px-4 py-12 md:px-6 md:py-16">
              <div className="mx-auto max-w-6xl">
                <div className="mb-8 flex items-end justify-between">
                  <div>
                    <h2 className="font-sans text-2xl font-semibold text-foreground md:text-3xl">
                      Productos Destacados
                    </h2>
                    <p className="mt-1 font-serif text-muted-foreground">
                      Los favoritos de nuestros clientes
                    </p>
                  </div>
                  <Button variant="outline" className="hidden md:flex">
                    Ver Todo
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
                <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                  {MOCK_PRODUCTS.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <div className="mt-6 text-center md:hidden">
                  <Button variant="outline">
                    Ver Todos los Productos
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </div>
            </section>

            {/* Customizer Teaser */}
            <section className="bg-primary px-4 py-12 md:px-6 md:py-16">
              <div className="mx-auto max-w-6xl">
                <div className="grid items-center gap-8 md:grid-cols-2">
                  <div>
                    <h2 className="font-sans text-2xl font-bold text-white md:text-3xl lg:text-4xl text-balance">
                      Diseña tu uniforme perfecto
                    </h2>
                    <p className="mt-4 font-serif text-lg text-white/80 text-pretty">
                      Nuestro personalizador te permite agregar tu nombre, logo o diseño único a
                      cualquier prenda. Visualiza el resultado en tiempo real.
                    </p>
                    <div className="mt-8">
                      <Button size="lg" className="bg-white text-primary hover:bg-white/90">
                        <Edit3 className="mr-2 h-5 w-5" />
                        Abrir Personalizador
                      </Button>
                    </div>
                  </div>
                  <div className="flex justify-center">
                    <div className="relative">
                      {/* Customizer preview placeholder */}
                      <div className="aspect-square w-64 rounded-lg bg-white/10 border-2 border-dashed border-white/30 flex items-center justify-center">
                        <div className="text-center text-white/60">
                          <Edit3 className="mx-auto h-12 w-12 mb-2" />
                          <span className="font-sans text-sm">Preview del Personalizador</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Features */}
            <section className="bg-card px-4 py-12 md:px-6 md:py-16">
              <div className="mx-auto max-w-6xl">
                <div className="mb-8 text-center">
                  <h2 className="font-sans text-2xl font-semibold text-foreground md:text-3xl">
                    ¿Por qué Chef Room?
                  </h2>
                  <p className="mt-2 font-serif text-muted-foreground">
                    Calidad, personalización y servicio excepcional
                  </p>
                </div>
                <div className="grid gap-6 md:grid-cols-3">
                  <FeatureCard
                    icon={<Edit3 className="h-6 w-6" />}
                    title="Personalización Total"
                    description="Agrega tu nombre, logo o diseño personalizado a cualquier prenda."
                  />
                  <FeatureCard
                    icon={<Palette className="h-6 w-6" />}
                    title="Materiales Premium"
                    description="Telas transpirables y duraderas diseñadas para cocinas profesionales."
                  />
                  <FeatureCard
                    icon={<Package className="h-6 w-6" />}
                    title="Envío Express"
                    description="Recibe tu pedido en 3-5 días hábiles a cualquier parte de México."
                  />
                </div>
              </div>
            </section>

            {/* CTA Section */}
            <section className="bg-secondary px-4 py-12 md:px-6 md:py-16">
              <div className="mx-auto max-w-2xl text-center">
                <h2 className="font-sans text-2xl font-semibold text-foreground md:text-3xl">
                  ¿Listo para destacar en tu cocina?
                </h2>
                <p className="mt-2 font-serif text-muted-foreground">
                  Crea tu uniforme personalizado hoy y recíbelo en días
                </p>
                <div className="mt-6">
                  <CTAButtonGroup
                    primaryLabel="Comenzar a Diseñar"
                    secondaryLabel="Ver Catálogo"
                    align="center"
                  />
                </div>
              </div>
            </section>

            {/* Footer */}
            <footer className="bg-chef-deep-navy px-4 py-8 md:px-6">
              <div className="mx-auto max-w-6xl">
                <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
                  <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" />
                  <p className="font-serif text-sm text-white/60">
                    © 2024 Chef Room by Bedolla. Todos los derechos reservados.
                  </p>
                </div>
              </div>
            </footer>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
