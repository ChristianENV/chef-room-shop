import type { Metadata } from 'next'
import { routes, shopCategoryUrl } from '@/src/config/routes'

import {
  SeoLandingLayout,
  SeoHero,
  BenefitsGrid,
  FAQSection,
  InternalLinksBlock,
  SeoCTA,
} from '@/src/features/storefront/landing'

/**
 * SEO Metadata for /shop/aprons
 * Target keywords:
 * - Mandiles personalizados
 * - Mandiles para restaurantes
 * - Mandiles con logo
 */
export const metadata: Metadata = {
  title: 'Mandiles Personalizados | Mandiles con Logo | Chef Room',
  description:
    'Mandiles personalizados con logo y nombre para restaurantes. Mandiles de cocina profesionales con bordado de alta calidad. Envio a todo Mexico.',
  keywords: [
    'mandiles personalizados',
    'mandiles para restaurantes',
    'mandiles con logo',
    'mandiles bordados',
    'mandiles de cocina personalizados',
    'mandiles para chef',
  ],
  openGraph: {
    title: 'Mandiles Personalizados | Chef Room by Bedolla',
    description:
      'Mandiles con logo y bordado personalizado para restaurantes y chefs.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://chefroom.mx/shop/aprons',
  },
}

const benefits = [
  {
    icon: 'shield',
    title: 'Resistencia Industrial',
    description:
      'Telas de alta durabilidad resistentes a manchas, aceites y lavados frecuentes en lavanderia industrial.',
  },
  {
    icon: 'palette',
    title: 'Logo de Tu Marca',
    description:
      'Bordado o estampado de alta calidad con el logo de tu restaurante. Refuerza tu imagen de marca.',
  },
  {
    icon: 'users',
    title: 'Ideal para Equipos',
    description:
      'Descuentos especiales en pedidos de 10+ piezas. Uniforma a todo tu equipo de cocina y servicio.',
  },
  {
    icon: 'sparkles',
    title: 'Estilos Variados',
    description:
      'Mandiles tipo bistro, completos, de cintura y con peto. Elige el estilo ideal para tu cocina.',
  },
]

const styles = [
  {
    name: 'Mandil Bistro',
    desc: 'Largo hasta la rodilla. Elegante para cocina abierta y servicio.',
    features: ['Largo: 85 cm', 'Con bolsillos', 'Tira ajustable'],
  },
  {
    name: 'Mandil de Peto',
    desc: 'Cobertura completa. Ideal para trabajo intensivo en cocina.',
    features: ['Cobertura total', 'Bolsillo frontal', 'Cintas cruzadas'],
  },
  {
    name: 'Mandil de Cintura',
    desc: 'Practico y ligero. Perfecto para baristas y servicio rapido.',
    features: ['Largo: 45 cm', '3 bolsillos', 'Cierre con velcro'],
  },
]

const faqs = [
  {
    question: 'Que estilos de mandiles ofrecen para personalizar?',
    answer:
      'Ofrecemos mandiles tipo bistro (largos), de peto (cobertura completa) y de cintura (cortos). Todos disponibles en multiples colores y personalizables con logo o nombre.',
  },
  {
    question: 'Pueden bordar el logo de mi restaurante?',
    answer:
      'Si, aceptamos logos en formato PNG, JPG o SVG. Nuestro equipo lo convertira a formato de bordado y te enviaremos una vista previa para aprobacion. Logos complejos pueden requerir digitalizacion adicional.',
  },
  {
    question: 'Cuantos mandiles necesito pedir como minimo?',
    answer:
      'No hay pedido minimo para mandiles personalizados. Sin embargo, para pedidos de 10+ piezas ofrecemos precios mayoreo con descuentos desde 10%.',
  },
  {
    question: 'Los mandiles son resistentes a lavado industrial?',
    answer:
      'Si, nuestros mandiles estan fabricados con mezclas de algodon-poliester de alta resistencia. Son aptos para lavado industrial y el bordado mantiene su calidad.',
  },
  {
    question: 'Puedo combinar mandiles con filipinas personalizadas?',
    answer:
      'Absolutamente. Muchos clientes uniforman a su equipo con filipinas y mandiles con el mismo logo. Ofrecemos descuentos al combinar productos.',
  },
]

const internalLinks = [
  { label: 'Ver Todos los Mandiles', href: shopCategoryUrl('mandiles') },
  { label: 'Mandil Profesional Chef', href: routes.productDetail('mandil-profesional-chef') },
  { label: 'Mandil Bistro Premium', href: routes.productDetail('mandil-bistro-premium') },
  { label: 'Filipinas Personalizadas', href: routes.chefJackets },
  { label: 'Uniformes para Restaurantes', href: routes.restaurants },
  { label: 'Contactar Ventas Mayoreo', href: routes.contact },
]

export default function MandilesPersonalizadosPage() {
  return (
    <SeoLandingLayout>
      <SeoHero
        subtitle="Mandiles Profesionales"
        title="Mandiles Personalizados con Logo"
        description="Destaca la imagen de tu restaurante con mandiles personalizados. Bordado de logo, nombre y colores corporativos. Ideales para equipos de cocina y servicio."
        primaryCta={{ label: 'Diseñar Mandil', href: `${routes.customize}?tipo=mandiles` }}
        secondaryCta={{ label: 'Ver Estilos', href: shopCategoryUrl('mandiles') }}
      />

      {/* Styles Section */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
              Estilos de Mandiles
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
              Elige el estilo que mejor se adapte a tu cocina y servicio.
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3">
            {styles.map((style, index) => (
              <div key={index} className="overflow-hidden rounded-xl border border-border bg-card">
                <div className="aspect-[4/3] bg-muted">
                  <div className="flex h-full items-center justify-center">
                    <span className="font-sans text-sm text-muted-foreground">{style.name}</span>
                  </div>
                </div>
                <div className="p-6">
                  <h3 className="font-sans text-xl font-semibold text-foreground">{style.name}</h3>
                  <p className="mt-2 font-serif text-sm text-muted-foreground">{style.desc}</p>
                  <ul className="mt-4 space-y-2">
                    {style.features.map((feature, i) => (
                      <li key={i} className="flex items-center gap-2 font-serif text-sm text-muted-foreground">
                        <span className="h-1.5 w-1.5 rounded-full bg-primary" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <BenefitsGrid
        title="Ventajas de Nuestros Mandiles"
        subtitle="Calidad profesional para tu equipo de cocina."
        benefits={benefits}
        columns={4}
        className="bg-secondary"
      />

      {/* Team Section */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="aspect-video rounded-xl bg-muted lg:aspect-square">
              <div className="flex h-full items-center justify-center">
                <span className="font-sans text-sm text-muted-foreground">
                  Equipo uniformado
                </span>
              </div>
            </div>
            <div>
              <span className="font-sans text-sm font-medium uppercase tracking-wider text-primary">
                Para Restaurantes
              </span>
              <h2 className="mt-2 font-sans text-3xl font-bold text-foreground md:text-4xl">
                Uniforma a Todo Tu Equipo
              </h2>
              <p className="mt-4 font-serif text-lg text-muted-foreground">
                Los mandiles personalizados refuerzan la identidad de tu restaurante y crean
                una imagen profesional unificada. Desde la cocina hasta el servicio.
              </p>
              <ul className="mt-6 space-y-4">
                {[
                  'Precios mayoreo desde 10 piezas',
                  'Mismo logo en toda la linea de productos',
                  'Coordinacion de colores corporativos',
                  'Asesor de cuenta dedicado',
                  'Facturacion empresarial',
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <span className="mt-1 flex h-5 w-5 items-center justify-center rounded-full bg-success/10">
                      <span className="h-2 w-2 rounded-full bg-success" />
                    </span>
                    <span className="font-serif text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        title="Preguntas sobre Mandiles Personalizados"
        faqs={faqs}
        className="bg-secondary"
      />

      <InternalLinksBlock title="Productos relacionados" links={internalLinks} />

      <SeoCTA
        title="Disena el Mandil Perfecto"
        description="Agrega tu logo y crea una imagen profesional para tu restaurante. Pedidos individuales o para equipo."
        primaryCta={{ label: 'Comenzar Diseño', href: `${routes.customize}?tipo=mandiles` }}
        secondaryCta={{ label: 'Cotizar Mayoreo', href: routes.contact }}
      />
    </SeoLandingLayout>
  )
}
