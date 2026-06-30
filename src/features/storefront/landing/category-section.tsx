'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Layers } from 'lucide-react'

import { cn } from '@/lib/utils'
import { shopCategoryUrl } from '@/src/config/routes'
import { useCatalogFiltersQuery } from '@/src/features/storefront/catalog/api/use-catalog-filters-query'
import {
  getNavProductTypes,
  getProductTypeDisplayName,
  getProductTypePublicSlug,
} from '@/src/features/storefront/catalog/product-type.helpers'

import { LandingReveal, LandingStagger, LandingStaggerItem } from './components/landing-reveal'
import { SectionHeader } from './components/section-header'
import { resolveLandingCategoryCardImage } from './lib/landing-category-card-image'

type LandingCategory = {
  id: string
  title: string
  subtitle: string
  description: string
  href: string
  imageSrc: string | null
  imageAlt: string
  useFallbackVisual: boolean
  featured?: boolean
}

const LANDING_SUBTITLES: Partial<Record<string, string>> = {
  filipinas: 'Uniformes de chef',
  mandiles: 'Protección con estilo',
  pantalones: 'Jornadas intensas',
  zapatos: 'Comodidad profesional',
}

const DEFAULT_SUBTITLE = 'Colección profesional'
const DEFAULT_DESCRIPTION =
  'Prendas diseñadas para la exigencia de cocinas de alto nivel, listas para personalizar.'

function buildLandingCategories(
  productTypes: ReturnType<typeof getNavProductTypes>,
): LandingCategory[] {
  return productTypes.map((type, index) => {
    const publicSlug = getProductTypePublicSlug(type)
    const title = getProductTypeDisplayName(type)
    const resolved = resolveLandingCategoryCardImage(type, title)

    return {
      id: type.id,
      title,
      subtitle: LANDING_SUBTITLES[publicSlug] ?? DEFAULT_SUBTITLE,
      description: type.description?.trim() || DEFAULT_DESCRIPTION,
      href: shopCategoryUrl(publicSlug),
      imageSrc: resolved.src,
      imageAlt: resolved.alt,
      useFallbackVisual: resolved.source === 'fallback',
      featured: index === 0,
    }
  })
}

interface CategorySectionProps {
  className?: string
}

function CategoryFallbackVisual({ title }: { title: string }) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center bg-gradient-to-br from-[#181B36] via-[#121421] to-[#0c0f24]">
      <div className="rounded-full border border-white/10 bg-white/[0.04] p-5">
        <Layers className="size-8 text-white/50" aria-hidden />
      </div>
      <p className="mt-4 px-6 text-center font-serif text-sm text-white/45">{title}</p>
    </div>
  )
}

function CategoryCard({ cat }: { cat: LandingCategory }) {
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
            : 'aspect-[3/4]',
        )}
      >
        {cat.imageSrc ? (
          <Image
            src={cat.imageSrc}
            alt={cat.imageAlt}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
            sizes={
              isFeatured ? '(max-width: 1024px) 100vw, 50vw' : '(max-width: 1024px) 100vw, 28vw'
            }
          />
        ) : cat.useFallbackVisual ? (
          <CategoryFallbackVisual title={cat.title} />
        ) : null}

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
  const { data } = useCatalogFiltersQuery()
  const categories = buildLandingCategories(getNavProductTypes(data?.productTypes ?? []))
  const [featured, ...rest] = categories
  // Editorial layout (1 large left + 2 stacked right) only works cleanly with exactly 3 categories.
  const useEditorialLayout = categories.length === 3 && featured != null
  // For 4+ categories, pick a column count that avoids orphaned cards.
  const simpleGridCols =
    categories.length <= 2
      ? 'sm:grid-cols-2'
      : categories.length === 4
        ? 'sm:grid-cols-2 lg:grid-cols-2'
        : 'sm:grid-cols-2 lg:grid-cols-3'

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

        {categories.length === 0 ? (
          <p className="mt-16 text-center font-serif text-muted-foreground">
            Las colecciones estarán disponibles pronto.
          </p>
        ) : useEditorialLayout ? (
          <LandingStagger className="mt-16 grid grid-cols-1 gap-5 sm:gap-6 lg:grid-cols-2 lg:grid-rows-2 lg:gap-6">
            <LandingStaggerItem className="lg:row-span-2">
              <CategoryCard cat={featured} />
            </LandingStaggerItem>
            {rest.map((cat) => (
              <LandingStaggerItem key={cat.id}>
                <CategoryCard cat={cat} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        ) : (
          <LandingStagger className={cn('mt-16 grid grid-cols-1 gap-5 sm:gap-6', simpleGridCols)}>
            {categories.map((cat) => (
              <LandingStaggerItem key={cat.id}>
                <CategoryCard cat={{ ...cat, featured: false }} />
              </LandingStaggerItem>
            ))}
          </LandingStagger>
        )}
      </div>
    </section>
  )
}
