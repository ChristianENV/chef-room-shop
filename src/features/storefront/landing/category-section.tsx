'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

import { LandingMediaImage } from './components/landing-media-image'
import {
  LandingReveal,
  LandingStagger,
  LandingStaggerItem,
} from './components/landing-reveal'
import { SectionHeader } from './components/section-header'
import { LANDING_MEDIA, type LandingMediaKey } from './lib/landing-media'

type LandingCategory = {
  id: string
  title: string
  subtitle: string
  description: string
  href: string
  mediaKey: Extract<
    LandingMediaKey,
    'categoryFilipinas' | 'categoryMandiles' | 'categoryPantalones' | 'categoryAccesorios'
  >
  featured?: boolean
  comingSoon?: boolean
}

const categories: LandingCategory[] = [
  {
    id: 'filipinas',
    title: 'Filipinas',
    subtitle: 'Uniformes de chef',
    description:
      'Ejecutivas, slim fit y clásicas. Bordados, logos y colores a la medida de tu restaurante.',
    href: routes.chefJackets,
    mediaKey: 'categoryFilipinas',
    featured: true,
  },
  {
    id: 'mandiles',
    title: 'Mandiles',
    subtitle: 'Protección con estilo',
    description: 'Funcionales, resistentes y listos para personalizar con tu identidad.',
    href: routes.aprons,
    mediaKey: 'categoryMandiles',
  },
  {
    id: 'pantalones',
    title: 'Pantalones',
    subtitle: 'Jornadas intensas',
    description: 'Comodidad y durabilidad para el ritmo de cocina profesional.',
    href: routes.pants,
    mediaKey: 'categoryPantalones',
  },
  {
    id: 'accesorios',
    title: 'Accesorios',
    subtitle: 'Detalles finales',
    description: 'Gorros, pañuelos y complementos para completar tu look.',
    href: routes.shop,
    mediaKey: 'categoryAccesorios',
    comingSoon: true,
  },
]

interface CategorySectionProps {
  className?: string
}

export function CategorySection({ className }: CategorySectionProps) {
  return (
    <section className={cn('relative bg-muted/40 py-24 md:py-32', className)}>
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-border to-transparent"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <LandingReveal>
          <SectionHeader
            eyebrow="Colecciones"
            title="Encuentra tu prenda ideal"
            description="Una curaduría editorial de piezas pensadas para la exigencia de cocinas de alto nivel."
          />
        </LandingReveal>

        <LandingStagger className="mt-16 grid gap-5 md:grid-cols-2 lg:grid-cols-12 lg:gap-6">
          {categories.map((cat) => {
            const media = LANDING_MEDIA[cat.mediaKey]
            const cardClassName = cn(
              'relative flex h-full min-h-[320px] flex-col overflow-hidden rounded-2xl border border-border/70 bg-card shadow-sm transition-all duration-500',
              !cat.comingSoon &&
                'group hover:-translate-y-1 hover:border-primary/30 hover:shadow-xl hover:shadow-primary/5',
              cat.comingSoon && 'pointer-events-none opacity-95',
            )

            const cardInner = (
              <>
                  <div className="relative flex-1 overflow-hidden">
                    <LandingMediaImage
                      asset={{ ...media, aspectClass: cat.featured ? 'aspect-[16/10]' : 'aspect-[5/4]' }}
                      className="absolute inset-0 h-full !aspect-auto"
                      imageClassName="transition-transform duration-700 group-hover:scale-[1.03]"
                      overlay="soft"
                      sizes={cat.featured ? '(max-width: 1024px) 100vw, 58vw' : '40vw'}
                    />

                    {cat.comingSoon ? (
                      <div className="absolute right-4 top-4 z-10">
                        <Badge className="border-0 bg-primary/95 font-sans text-[10px] font-semibold tracking-wider uppercase">
                          Próximamente
                        </Badge>
                      </div>
                    ) : (
                      <div className="absolute inset-0 z-10 flex items-end bg-gradient-to-t from-background/90 via-background/20 to-transparent p-6 opacity-0 transition-opacity duration-300 group-hover:opacity-100 md:items-center md:justify-center md:bg-primary/75 md:opacity-0 md:group-hover:opacity-100">
                        <span className="inline-flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-foreground md:text-white">
                          Explorar colección
                          <ArrowRight className="size-4" />
                        </span>
                      </div>
                    )}
                  </div>

                  <div className={cn('relative z-10 p-6 md:p-8', cat.featured && 'md:p-9')}>
                    <p className="font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground">
                      {cat.subtitle}
                    </p>
                    <h3
                      className={cn(
                        'mt-2 font-sans font-semibold tracking-tight text-foreground',
                        cat.featured ? 'text-2xl md:text-3xl' : 'text-xl',
                      )}
                    >
                      {cat.title}
                    </h3>
                    <p className="mt-3 max-w-md font-serif text-sm leading-relaxed text-muted-foreground">
                      {cat.description}
                    </p>
                    {!cat.comingSoon ? (
                      <span className="mt-5 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-primary transition-all group-hover:gap-2.5">
                        Ver colección
                        <ArrowRight className="size-3.5" />
                      </span>
                    ) : null}
                  </div>
              </>
            )

            return (
              <LandingStaggerItem
                key={cat.id}
                className={cn(
                  cat.featured ? 'lg:col-span-7' : 'lg:col-span-5',
                  cat.id === 'pantalones' && 'lg:col-start-8',
                )}
              >
                {cat.comingSoon ? (
                  <div className={cardClassName}>{cardInner}</div>
                ) : (
                  <Link href={cat.href} className={cn(cardClassName, 'block')}>
                    {cardInner}
                  </Link>
                )}
              </LandingStaggerItem>
            )
          })}
        </LandingStagger>
      </div>
    </section>
  )
}
