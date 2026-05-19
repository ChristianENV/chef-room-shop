import type { Metadata } from 'next'
import { routes, shopCategoryUrl } from '@/src/config/routes'

import {
  SeoLandingLayout,
  SeoHero,
  BenefitsGrid,
  CategoryShowcase,
  FAQSection,
  InternalLinksBlock,
  SeoCTA,
} from '@/src/features/storefront/landing'

/**
 * SEO Metadata for /uniformes-para-chef
 * Target keywords:
 * - Uniformes para chef
 * - Ropa profesional de cocina
 * - Uniformes gastronomicos
 */
export const metadata: Metadata = {
  title: 'Uniformes para Chef | Ropa Profesional de Cocina | Chef Room',
  description:
    'Descubre uniformes para chef de alta calidad. Filipinas, mandiles y pantalones profesionales para cocina. Personalizacion con bordados y logos. Envio a todo Mexico.',
  keywords: [
    'uniformes para chef',
    'ropa profesional de cocina',
    'uniformes gastronomicos',
    'filipinas para chef',
    'mandiles profesionales',
    'uniformes de cocina',
  ],
  openGraph: {
    title: 'Uniformes para Chef | Chef Room by Bedolla',
    description:
      'Uniformes profesionales para chefs. Filipinas, mandiles y pantalones de alta calidad con personalizacion.',
    type: 'website',
    // TODO: Add OG image
    // images: [{ url: '/og/uniformes-para-chef.jpg' }],
  },
  alternates: {
    canonical: 'https://chefroom.mx/uniformes-para-chef',
  },
}

const benefits = [
  {
    icon: 'shield',
    title: 'Calidad Profesional',
    description:
      'Telas premium resistentes a manchas, lavados frecuentes y altas temperaturas de cocina.',
  },
  {
    icon: 'palette',
    title: 'Personalizacion Total',
    description:
      'Agrega tu nombre, logo de restaurante o diseno exclusivo con bordados de alta calidad.',
  },
  {
    icon: 'truck',
    title: 'Envio a Todo Mexico',
    description:
      'Entrega rapida en 3-5 dias habiles. Envio gratis en pedidos mayores a $999.',
  },
  {
    icon: 'users',
    title: 'Pedidos para Equipos',
    description:
      'Descuentos especiales para restaurantes y escuelas de gastronomia. Cotiza tu pedido.',
  },
  {
    icon: 'award',
    title: 'Garantia de Satisfaccion',
    description:
      '30 dias de garantia. Si no quedas satisfecho, te devolvemos tu dinero.',
  },
  {
    icon: 'clock',
    title: 'Produccion Rapida',
    description:
      'Uniformes personalizados listos en 5-7 dias habiles. Opcion express disponible.',
  },
]

const categories = [
  {
    title: 'Filipinas para Chef',
    description:
      'Filipinas ejecutivas, clasicas y slim fit. Disponibles en blanco, negro y colores personalizados.',
    href: shopCategoryUrl('filipinas'),
    imagePlaceholder: 'Filipinas profesionales',
  },
  {
    title: 'Mandiles Profesionales',
    description:
      'Mandiles tipo bistro, completos y de cintura. Ideales para cocina y servicio.',
    href: shopCategoryUrl('mandiles'),
    imagePlaceholder: 'Mandiles de cocina',
  },
  {
    title: 'Pantalones de Chef',
    description:
      'Pantalones cargo, clasicos con cuadros y slim. Comodos para largas jornadas.',
    href: shopCategoryUrl('pantalones'),
    imagePlaceholder: 'Pantalones de cocina',
  },
]

const faqs = [
  {
    question: 'Que tallas de uniformes para chef tienen disponibles?',
    answer:
      'Manejamos tallas desde XS hasta 3XL en la mayoria de nuestros productos. Cada prenda incluye una guia de tallas detallada para que elijas la correcta. Si necesitas tallas especiales, contactanos.',
  },
  {
    question: 'Como funciona la personalizacion de uniformes?',
    answer:
      'Puedes agregar tu nombre, iniciales o logo usando nuestro personalizador en linea. Selecciona el area de bordado, tipo de letra y colores. Veras una vista previa antes de confirmar tu pedido.',
  },
  {
    question: 'Cuanto tiempo tarda la entrega de uniformes personalizados?',
    answer:
      'Los uniformes estandar se envian en 2-3 dias habiles. Los uniformes con personalizacion requieren 5-7 dias habiles de produccion mas el tiempo de envio.',
  },
  {
    question: 'Ofrecen descuentos para restaurantes o escuelas?',
    answer:
      'Si, tenemos precios especiales para pedidos de 10 o mas prendas. Contacta a nuestro equipo de ventas mayoreo para recibir una cotizacion personalizada.',
  },
  {
    question: 'Que materiales usan en sus uniformes?',
    answer:
      'Usamos mezclas de algodon y poliester de alta calidad, resistentes a manchas y faciles de lavar. Las filipinas premium tienen tratamiento antimicrobiano.',
  },
]

const internalLinks = [
  { label: 'Filipinas Personalizadas', href: routes.chefJackets },
  { label: 'Mandiles con Logo', href: routes.aprons },
  { label: 'Uniformes para Restaurantes', href: routes.restaurants },
  { label: 'Ver Catálogo Completo', href: routes.shop },
  { label: 'Diseñar Mi Uniforme', href: routes.customize },
  { label: 'Guía de Tallas', href: routes.sizeGuide },
]

export default function UniformesParaChefPage() {
  return (
    <SeoLandingLayout>
      <SeoHero
        subtitle="Chef Room by Bedolla"
        title="Uniformes para Chef Profesionales"
        description="Equipate con uniformes de cocina de alta calidad. Filipinas, mandiles y pantalones disenados para el chef moderno. Personalizacion con bordados y logos."
        primaryCta={{ label: 'Diseñar Mi Uniforme', href: routes.customize }}
        secondaryCta={{ label: 'Ver Catálogo', href: routes.shop }}
      />

      <BenefitsGrid
        title="Por Que Elegir Chef Room"
        subtitle="Uniformes profesionales que combinan calidad, comodidad y estilo para el chef exigente."
        benefits={benefits}
      />

      <CategoryShowcase
        title="Explora Nuestras Categorias"
        subtitle="Encuentra el uniforme perfecto para tu cocina."
        categories={categories}
      />

      {/* Customization Section */}
      <section className="bg-card px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div>
              <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
                Personaliza Tu Uniforme
              </h2>
              <p className="mt-4 font-serif text-lg text-muted-foreground">
                Nuestro configurador visual te permite disenar uniformes unicos para tu equipo.
                Agrega nombres, logos y elige colores en minutos.
              </p>
              <ul className="mt-6 space-y-3">
                {[
                  'Bordado de nombre en pecho, manga o espalda',
                  'Logo de tu restaurante en alta definicion',
                  'Mas de 10 colores de hilo disponibles',
                  'Vista previa en tiempo real',
                  'Guardado de disenos para pedidos futuros',
                ].map((item, i) => (
                  <li key={i} className="flex items-center gap-3">
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary">
                      {i + 1}
                    </span>
                    <span className="font-serif text-muted-foreground">{item}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="aspect-square rounded-xl bg-muted">
              <div className="flex h-full items-center justify-center">
                <span className="font-sans text-sm text-muted-foreground">
                  Personalizador de uniformes
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <FAQSection
        title="Preguntas Frecuentes"
        subtitle="Resolvemos tus dudas sobre nuestros uniformes para chef."
        faqs={faqs}
      />

      <InternalLinksBlock title="Explora mas opciones" links={internalLinks} />

      <SeoCTA
        title="Listo para Disenar Tu Uniforme?"
        description="Crea uniformes unicos para tu equipo de cocina. Personalizacion facil, calidad garantizada."
        primaryCta={{ label: 'Comenzar Ahora', href: routes.customize }}
        secondaryCta={{ label: 'Contactar Ventas', href: routes.contact }}
      />
    </SeoLandingLayout>
  )
}
