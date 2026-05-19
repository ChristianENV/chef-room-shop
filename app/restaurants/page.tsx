import type { Metadata } from 'next'

import {
  SeoLandingLayout,
  SeoHero,
  BenefitsGrid,
  CategoryShowcase,
  FAQSection,
  InternalLinksBlock,
  SeoCTA,
} from '@/components/seo'

/**
 * SEO Metadata for /restaurants
 * Target keywords:
 * - Uniformes para restaurantes
 * - Uniformes corporativos gastronomicos
 * - Ropa para equipos de cocina
 */
export const metadata: Metadata = {
  title: 'Uniformes para Restaurantes | Uniformes Corporativos | Chef Room',
  description:
    'Uniformes para restaurantes con personalizacion de logo. Filipinas, mandiles y pantalones para equipos de cocina. Descuentos mayoreo. Envio a todo Mexico.',
  keywords: [
    'uniformes para restaurantes',
    'uniformes corporativos gastronomicos',
    'ropa para equipos de cocina',
    'uniformes para staff de restaurante',
    'uniformes de cocina corporativos',
    'uniformes para hoteles',
  ],
  openGraph: {
    title: 'Uniformes para Restaurantes | Chef Room by Bedolla',
    description:
      'Uniformes corporativos para restaurantes, hoteles y escuelas de gastronomia.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://chefroom.mx/restaurants',
  },
}

const benefits = [
  {
    icon: 'users',
    title: 'Pedidos para Equipos',
    description:
      'Descuentos progresivos desde 10 piezas. Mientras mas ordenas, mas ahorras.',
  },
  {
    icon: 'palette',
    title: 'Imagen Corporativa',
    description:
      'Mismo logo, colores y estilo en filipinas, mandiles y pantalones. Crea uniformidad.',
  },
  {
    icon: 'clock',
    title: 'Entrega Coordinada',
    description:
      'Produccion por lotes para entregar todo el pedido junto. Ideal para aperturas.',
  },
  {
    icon: 'shield',
    title: 'Calidad Garantizada',
    description:
      'Reemplazo gratuito de prendas con defectos. Garantia de satisfaccion total.',
  },
  {
    icon: 'sparkles',
    title: 'Asesor Dedicado',
    description:
      'Un ejecutivo de cuenta te acompana desde el diseno hasta la entrega final.',
  },
  {
    icon: 'truck',
    title: 'Envio a Sucursales',
    description:
      'Enviamos a multiples direcciones. Ideal para cadenas con varias ubicaciones.',
  },
]

const categories = [
  {
    title: 'Filipinas Corporativas',
    description:
      'Uniforma a tu brigada de cocina con filipinas de calidad profesional y logo bordado.',
    href: '/shop?categoria=filipinas',
    imagePlaceholder: 'Filipinas para equipo',
  },
  {
    title: 'Mandiles con Logo',
    description:
      'Desde la cocina hasta el salon. Mandiles personalizados para todo el staff.',
    href: '/shop?categoria=mandiles',
    imagePlaceholder: 'Mandiles corporativos',
  },
  {
    title: 'Pantalones de Cocina',
    description:
      'Completa el uniforme con pantalones comodos y resistentes para largas jornadas.',
    href: '/shop?categoria=pantalones',
    imagePlaceholder: 'Pantalones profesionales',
  },
]

const segments = [
  {
    name: 'Restaurantes Independientes',
    desc: 'Desde pequenos bistros hasta restaurantes de alta cocina.',
    min: '10+ piezas',
  },
  {
    name: 'Cadenas de Restaurantes',
    desc: 'Uniformidad en todas tus sucursales con envios coordinados.',
    min: '50+ piezas',
  },
  {
    name: 'Hoteles y Resorts',
    desc: 'Uniformes para cocina, banquetes y servicio a cuartos.',
    min: '100+ piezas',
  },
  {
    name: 'Escuelas de Gastronomia',
    desc: 'Programas especiales para instituciones educativas.',
    min: '25+ piezas',
  },
]

const faqs = [
  {
    question: 'Cual es el pedido minimo para uniformes corporativos?',
    answer:
      'No hay minimo estricto, pero los precios mayoreo aplican desde 10 piezas del mismo modelo. Para pedidos mixtos (filipinas + mandiles), el total debe ser de al menos 15 piezas.',
  },
  {
    question: 'Pueden producir uniformes para multiples sucursales?',
    answer:
      'Si, manejamos pedidos para cadenas con multiples ubicaciones. Podemos enviar a cada sucursal por separado y coordinar entregas simultaneas para aperturas.',
  },
  {
    question: 'Como funciona el proceso de cotizacion?',
    answer:
      'Contactanos con los detalles de tu pedido: cantidad, productos, personalizacion y direcciones de entrega. Te enviamos cotizacion en 24-48 horas con desglose de precios y tiempos.',
  },
  {
    question: 'Ofrecen credito o facturacion empresarial?',
    answer:
      'Si, para clientes recurrentes ofrecemos linea de credito a 30 dias. Facturamos a nombre de tu empresa con todos los requisitos fiscales mexicanos.',
  },
  {
    question: 'Pueden replicar uniformes que ya tenemos?',
    answer:
      'Si, envianos fotos o muestras de tus uniformes actuales. Podemos replicar el estilo, colores y personalizacion, incluso mejorar la calidad si lo deseas.',
  },
  {
    question: 'Que pasa si un empleado nuevo necesita uniforme?',
    answer:
      'Guardamos tu configuracion de diseno. Puedes reordenar piezas individuales con el mismo logo y especificaciones sin pedido minimo para reposiciones.',
  },
]

const internalLinks = [
  { label: 'Uniformes para Chef', href: '/uniformes-para-chef' },
  { label: 'Filipinas Personalizadas', href: '/shop/chef-jackets' },
  { label: 'Mandiles Personalizados', href: '/shop/aprons' },
  { label: 'Catalogo Completo', href: '/shop' },
  { label: 'Contactar Ventas Mayoreo', href: '/mayoreo' },
  { label: 'Solicitar Cotizacion', href: '/contact' },
]

export default function UniformesParaRestaurantesPage() {
  return (
    <SeoLandingLayout>
      <SeoHero
        subtitle="Soluciones Corporativas"
        title="Uniformes para Restaurantes"
        description="Equipa a todo tu equipo con uniformes profesionales personalizados. Filipinas, mandiles y pantalones con el logo de tu restaurante. Precios mayoreo y entrega coordinada."
        primaryCta={{ label: 'Solicitar Cotizacion', href: '/mayoreo' }}
        secondaryCta={{ label: 'Ver Catalogo', href: '/shop' }}
      />

      <CategoryShowcase
        title="Uniformes para Todo Tu Equipo"
        subtitle="Desde la cocina hasta el salon, tenemos todo lo que necesitas."
        categories={categories}
      />

      <BenefitsGrid
        title="Ventajas del Programa Corporativo"
        subtitle="Servicio especializado para restaurantes y empresas gastronomicas."
        benefits={benefits}
        className="bg-secondary"
      />

      {/* Segments Section */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
              Atendemos Todo Tipo de Negocios
            </h2>
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
              Experiencia trabajando con diferentes segmentos de la industria gastronomica.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
            {segments.map((segment, index) => (
              <div
                key={index}
                className="rounded-xl border border-border bg-card p-6"
              >
                <h3 className="font-sans font-semibold text-foreground">{segment.name}</h3>
                <p className="mt-2 font-serif text-sm text-muted-foreground">{segment.desc}</p>
                <p className="mt-4 font-sans text-sm font-medium text-primary">
                  Desde {segment.min}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Process Section */}
      <section className="bg-secondary px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
            Proceso Simple para Pedidos Corporativos
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
            Te acompanamos en cada paso para asegurar uniformes perfectos.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-5">
            {[
              { step: '1', title: 'Consulta', desc: 'Platicamos sobre tus necesidades' },
              { step: '2', title: 'Cotizacion', desc: 'Precio detallado en 24-48 hrs' },
              { step: '3', title: 'Diseno', desc: 'Aprobacion de muestras digitales' },
              { step: '4', title: 'Produccion', desc: '7-14 dias segun cantidad' },
              { step: '5', title: 'Entrega', desc: 'Envio a tu(s) direccion(es)' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary font-sans text-xl font-bold text-white">
                  {item.step}
                </div>
                <h3 className="mt-4 font-sans font-semibold text-foreground">{item.title}</h3>
                <p className="mt-2 font-serif text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <FAQSection
        title="Preguntas sobre Pedidos Corporativos"
        faqs={faqs}
      />

      <InternalLinksBlock title="Explora nuestros productos" links={internalLinks} />

      <SeoCTA
        title="Uniforma a Tu Equipo Hoy"
        description="Solicita una cotizacion personalizada para tu restaurante. Atencion dedicada y precios competitivos."
        primaryCta={{ label: 'Solicitar Cotizacion', href: '/mayoreo' }}
        secondaryCta={{ label: 'Hablar con Asesor', href: '/contact' }}
      />
    </SeoLandingLayout>
  )
}
