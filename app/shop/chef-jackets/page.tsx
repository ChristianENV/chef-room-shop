import type { Metadata } from 'next'

import {
  SeoLandingLayout,
  SeoHero,
  BenefitsGrid,
  FAQSection,
  InternalLinksBlock,
  SeoCTA,
} from '@/components/seo'

/**
 * SEO Metadata for /shop/chef-jackets
 * Target keywords:
 * - Filipinas personalizadas
 * - Filipinas bordadas
 * - Filipinas con logo
 */
export const metadata: Metadata = {
  title: 'Filipinas Personalizadas | Bordados y Logos | Chef Room',
  description:
    'Filipinas personalizadas con bordado de nombre y logo. Filipinas para chef de alta calidad con personalizacion profesional. Envio a todo Mexico.',
  keywords: [
    'filipinas personalizadas',
    'filipinas bordadas',
    'filipinas con logo',
    'filipinas para chef personalizadas',
    'filipinas con nombre bordado',
    'filipinas de cocina personalizadas',
  ],
  openGraph: {
    title: 'Filipinas Personalizadas | Chef Room by Bedolla',
    description:
      'Filipinas con bordado de nombre y logo. Personalizacion profesional para chefs.',
    type: 'website',
  },
  alternates: {
    canonical: 'https://chefroom.mx/shop/chef-jackets',
  },
}

const benefits = [
  {
    icon: 'sparkles',
    title: 'Bordado Premium',
    description:
      'Bordados de alta densidad con hilos resistentes. Tu nombre o logo lucira impecable lavado tras lavado.',
  },
  {
    icon: 'palette',
    title: 'Multiples Areas',
    description:
      'Personaliza pecho, espalda, mangas o bolsillo. Combina diferentes elementos en una sola prenda.',
  },
  {
    icon: 'clock',
    title: 'Listo en 5 Dias',
    description:
      'Produccion rapida de filipinas bordadas. Recibe tu pedido en 5-7 dias habiles.',
  },
  {
    icon: 'shield',
    title: 'Colores que Duran',
    description:
      'Hilos de bordado resistentes a decoloracion. Mas de 15 colores disponibles.',
  },
]

const faqs = [
  {
    question: 'Que tipo de personalizacion puedo agregar a mi filipina?',
    answer:
      'Puedes agregar bordado de nombre, iniciales, logo de restaurante o diseno personalizado. Ofrecemos bordado en pecho izquierdo, derecho, espalda y mangas.',
  },
  {
    question: 'Cuanto cuesta el bordado en filipinas?',
    answer:
      'El bordado de nombre basico inicia en $150 MXN. Los logos tienen un costo desde $199 MXN dependiendo del tamano y complejidad. Veras el precio exacto en nuestro personalizador.',
  },
  {
    question: 'Puedo subir mi propio logo para bordar?',
    answer:
      'Si, acepta formatos PNG, JPG y SVG. Nuestro equipo convertira tu logo a formato de bordado. Te enviaremos una vista previa para aprobacion antes de producir.',
  },
  {
    question: 'Las filipinas personalizadas se pueden devolver?',
    answer:
      'Por ser prendas personalizadas, no aceptamos devoluciones salvo defectos de fabricacion. Te mostramos una vista previa detallada antes de confirmar tu pedido.',
  },
  {
    question: 'Que filipinas puedo personalizar?',
    answer:
      'Todos nuestros modelos de filipinas son personalizables: Executive, Slim Fit, Clasica y Mujer. Elige tu estilo favorito y agregale tu toque personal.',
  },
]

const internalLinks = [
  { label: 'Ver Todas las Filipinas', href: '/shop?categoria=filipinas' },
  { label: 'Filipina Executive Blanca', href: '/products/filipina-executive-blanca' },
  { label: 'Filipina Slim Fit Negra', href: '/products/filipina-slim-fit-negra' },
  { label: 'Uniformes para Chef', href: '/uniformes-para-chef' },
  { label: 'Mandiles Personalizados', href: '/shop/aprons' },
  { label: 'Guia de Bordados', href: '/guia-bordados' },
]

export default function FilipinasPersonalizadasPage() {
  return (
    <SeoLandingLayout>
      <SeoHero
        subtitle="Personalizacion Profesional"
        title="Filipinas Personalizadas con Bordado"
        description="Destaca en la cocina con filipinas bordadas con tu nombre o logo. Disena tu filipina ideal en minutos con nuestro configurador visual."
        primaryCta={{ label: 'Disenar Mi Filipina', href: '/customize?tipo=filipinas' }}
        secondaryCta={{ label: 'Ver Modelos', href: '/shop?categoria=filipinas' }}
      />

      {/* Product Showcase */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-6xl">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <div className="order-2 lg:order-1">
              <span className="font-sans text-sm font-medium uppercase tracking-wider text-primary">
                Bordado de Alta Calidad
              </span>
              <h2 className="mt-2 font-sans text-3xl font-bold text-foreground md:text-4xl">
                Tu Nombre, Tu Identidad
              </h2>
              <p className="mt-4 font-serif text-lg text-muted-foreground">
                El bordado personalizado transforma una filipina comun en una prenda unica.
                Ya sea tu nombre, el logo de tu restaurante o un diseno especial, cada puntada
                refleja tu profesionalismo.
              </p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {[
                  { area: 'Pecho Izquierdo', desc: 'Ideal para nombre' },
                  { area: 'Pecho Derecho', desc: 'Logo pequeno' },
                  { area: 'Espalda', desc: 'Logos grandes' },
                  { area: 'Mangas', desc: 'Iniciales o simbolos' },
                ].map((item, i) => (
                  <div key={i} className="rounded-lg border border-border bg-card p-4">
                    <p className="font-sans font-semibold text-foreground">{item.area}</p>
                    <p className="mt-1 font-serif text-sm text-muted-foreground">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="order-1 aspect-square rounded-xl bg-muted lg:order-2">
              <div className="flex h-full items-center justify-center">
                <span className="font-sans text-sm text-muted-foreground">
                  Filipina con bordado
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <BenefitsGrid
        title="Ventajas del Bordado Profesional"
        subtitle="Calidad que se nota en cada detalle."
        benefits={benefits}
        columns={4}
        className="bg-secondary"
      />

      {/* Process Section */}
      <section className="px-4 py-16 md:px-6 md:py-20">
        <div className="mx-auto max-w-4xl text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">
            Como Personalizar Tu Filipina
          </h2>
          <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
            Proceso simple y rapido para disenar tu filipina perfecta.
          </p>
          <div className="mt-12 grid gap-8 md:grid-cols-4">
            {[
              { step: '1', title: 'Elige tu Filipina', desc: 'Selecciona modelo, color y talla.' },
              { step: '2', title: 'Agrega Bordado', desc: 'Nombre, logo o diseno personalizado.' },
              { step: '3', title: 'Vista Previa', desc: 'Confirma tu diseno en 3D.' },
              { step: '4', title: 'Recibe en Casa', desc: 'Listo en 5-7 dias habiles.' },
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
        title="Preguntas sobre Filipinas Personalizadas"
        faqs={faqs}
        className="bg-secondary"
      />

      <InternalLinksBlock title="Productos relacionados" links={internalLinks} />

      <SeoCTA
        title="Crea Tu Filipina Unica"
        description="Disena una filipina que refleje tu estilo y profesionalismo. Bordado de calidad garantizado."
        primaryCta={{ label: 'Personalizar Ahora', href: '/customize?tipo=filipinas' }}
        secondaryCta={{ label: 'Ver Catalogo', href: '/shop?categoria=filipinas' }}
      />
    </SeoLandingLayout>
  )
}
