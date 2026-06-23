'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

import { LandingMediaImage } from './components/landing-media-image'
import { LandingReveal, LandingStagger, LandingStaggerItem } from './components/landing-reveal'
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
    'categoryFilipinas' | 'categoryMandiles' | 'categoryPantalones'
  >
  featured?: boolean
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
]

interface CategorySectionProps {
  className?: string
}

function CategoryCard({ cat }: { cat: LandingCategory }) {
  const media = LANDING_MEDIA[cat.mediaKey]
  const isFeatured = Boolean(cat.featured)

  return (
    <Link
      href={cat.href}
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] shadow-sm transition-all duration-500',
        'hover:-translate-y-1 hover:border-primary/25 hover:shadow-xl hover:shadow-primary/10',
        isFeatured ? 'min-h-[420px] lg:min-h-0' : 'min-h-[320px] lg:min-h-0',
      )}
    >
      <div
        className={cn(
          'relative w-full shrink-0 overflow-hidden',
          isFeatured
            ? 'aspect-[4/5] min-h-[280px] sm:min-h-[320px] lg:min-h-[360px] lg:flex-1'
            : 'aspect-[16/9] min-h-[200px] lg:h-[280px] lg:min-h-[420px] lg:aspect-auto',
        )}
      >
        <LandingMediaImage
          asset={media}
          fit="cover"
          overlay="none"
          className="absolute inset-0 h-full w-full !aspect-auto"
          imageClassName="transition-transform duration-700 group-hover:scale-[1.04]"
          sizes={isFeatured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 28vw'}
        />

        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-10 h-[38%] bg-gradient-to-t from-[#0c0f24]/90 via-[#0c0f24]/15 to-transparent lg:h-[32%]" />

        <div className="absolute inset-x-0 bottom-0 z-20 flex items-end justify-between p-4 opacity-100 transition-opacity duration-300 lg:p-5">
          <span className="inline-flex items-center gap-2 font-sans text-xs font-semibold tracking-wide text-white/90 opacity-0 transition-opacity group-hover:opacity-100 sm:text-sm">
            Explorar colección
            <ArrowRight className="size-3.5" />
          </span>
        </div>
      </div>

      <div
        className={cn(
          'relative z-10 bg-card/95 p-5 backdrop-blur-sm md:p-6',
          isFeatured && 'md:p-7',
        )}
      >
        <p className="font-serif text-xs tracking-[0.2em] uppercase text-muted-foreground">
          {cat.subtitle}
        </p>
        <h3
          className={cn(
            'mt-2 font-sans font-semibold tracking-tight text-foreground',
            isFeatured ? 'text-2xl md:text-3xl' : 'text-xl',
          )}
        >
          {cat.title}
        </h3>
        <p className="mt-2 max-w-md font-serif text-sm leading-relaxed text-muted-foreground">
          {cat.description}
        </p>
        <span className="mt-4 inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-primary transition-all group-hover:gap-2.5">
          Ver colección
          <ArrowRight className="size-3.5" />
        </span>
      </div>
    </Link>
  )
}

export function CategorySection({ className }: CategorySectionProps) {
  const [filipinas, mandiles, pantalones] = categories

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

        <LandingStagger className="mt-16 grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:grid-rows-2 lg:gap-6">
          <LandingStaggerItem className="lg:row-span-2">
            <CategoryCard cat={filipinas} />
          </LandingStaggerItem>
          <LandingStaggerItem>
            <CategoryCard cat={mandiles} />
          </LandingStaggerItem>
          <LandingStaggerItem>
            <CategoryCard cat={pantalones} />
          </LandingStaggerItem>
        </LandingStagger>
      </div>
    </section>
  )
}
