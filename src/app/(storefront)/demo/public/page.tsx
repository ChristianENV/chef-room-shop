import { ResponsiveShell, SectionHeader } from '@/components/shared'
import { Button } from '@/components/ui/button'
import { ProductCard } from '@/components/brand/product-components'
import { TrustBadgesRow, FeatureCard } from '@/components/brand/cta-components'
import { MOCK_PRODUCTS, mockFeatures } from '@/lib/mock-data'
import { routes } from '@/src/config/routes'
import { ArrowRight, Sparkles } from 'lucide-react'
import Link from 'next/link'

export default function PublicLayoutDemo() {
  return (
    <>
      {/* Hero Section */}
      <section className="relative bg-primary px-4 py-16 md:px-6 md:py-24">
        <ResponsiveShell>
          <div className="mx-auto max-w-3xl text-center">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2">
              <Sparkles className="h-4 w-4 text-white" />
              <span className="font-sans text-sm font-medium text-white">Nueva Coleccion 2024</span>
            </div>
            <h1 className="font-sans text-3xl font-bold text-white md:text-5xl lg:text-6xl text-balance">
              Tu cocina te define, tu uniforme te distingue
            </h1>
            <p className="mx-auto mt-6 max-w-xl font-serif text-lg text-white/80 text-pretty">
              Uniformes de chef de alta calidad, personalizables con bordados unicos. 
              Disena el tuyo y destaca en cada servicio.
            </p>
            <div className="mt-8 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Button size="lg" className="bg-white font-sans font-semibold text-primary hover:bg-white/90">
                Ver Catalogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
              <Button size="lg" variant="outline" className="border-white/30 font-sans text-white hover:bg-white/10">
                Personalizar Uniforme
              </Button>
            </div>
          </div>
        </ResponsiveShell>
      </section>

      {/* Trust Badges */}
      <section className="border-b border-border bg-card px-4 py-6 md:px-6">
        <ResponsiveShell>
          <TrustBadgesRow />
        </ResponsiveShell>
      </section>

      {/* Products Section */}
      <section className="bg-secondary px-4 py-12 md:px-6 md:py-16">
        <ResponsiveShell>
          <SectionHeader
            title="Productos Destacados"
            subtitle="Lo mas vendido de nuestra coleccion"
            align="center"
            size="lg"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {MOCK_PRODUCTS.slice(0, 4).map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
          <div className="mt-8 text-center">
            <Button variant="outline" size="lg" asChild>
              <Link href={routes.shop}>
                Ver Todo el Catalogo
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </ResponsiveShell>
      </section>

      {/* Features Section */}
      <section className="bg-card px-4 py-12 md:px-6 md:py-16">
        <ResponsiveShell>
          <SectionHeader
            title="Por que elegirnos"
            subtitle="Calidad y servicio que nos distingue"
            align="center"
            size="lg"
          />
          <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {mockFeatures.map((feature, index) => (
              <FeatureCard key={index} feature={feature} />
            ))}
          </div>
        </ResponsiveShell>
      </section>

      {/* CTA Section */}
      <section className="bg-primary px-4 py-12 md:px-6 md:py-16">
        <ResponsiveShell>
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="font-sans text-2xl font-bold text-white md:text-3xl">
              Disena tu uniforme perfecto
            </h2>
            <p className="mt-4 font-serif text-white/80">
              Utiliza nuestro personalizador para agregar tu nombre, logo o diseno exclusivo.
            </p>
            <Button
              size="lg"
              className="mt-6 bg-white font-sans font-semibold text-primary hover:bg-white/90"
            >
              Comenzar a Personalizar
            </Button>
          </div>
        </ResponsiveShell>
      </section>
    </>
  )
}
