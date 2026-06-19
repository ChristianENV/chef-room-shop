'use client'

import { cn } from '@/lib/utils'

import { LandingMediaImage } from './components/landing-media-image'
import { LandingReveal } from './components/landing-reveal'
import { LANDING_MEDIA } from './lib/landing-media'

interface BrandStorySectionProps {
  className?: string
}

export function BrandStorySection({ className }: BrandStorySectionProps) {
  return (
    <section
      className={cn(
        'relative overflow-hidden bg-primary py-24 text-primary-foreground md:py-32',
        className,
      )}
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_50%_at_0%_100%,rgba(255,255,255,0.08)_0%,transparent_60%)]"
        aria-hidden
      />

      <div className="relative mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <LandingReveal>
            <div className="overflow-hidden rounded-2xl ring-1 ring-white/10">
              <LandingMediaImage
                asset={LANDING_MEDIA.story}
                sizes="(max-width: 1024px) 100vw, 45vw"
                overlay="none"
                className="min-h-[360px] !aspect-[4/5]"
              />
            </div>
          </LandingReveal>

          <LandingReveal delay={0.1}>
            <p className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-primary-foreground/50">
              Nuestra historia
            </p>
            <h2 className="mt-6 font-sans text-3xl font-bold leading-[1.12] tracking-tight md:text-4xl lg:text-5xl text-balance">
              Diseño, calidad y pasión por la cocina profesional.
            </h2>
            <p className="mt-8 font-serif text-lg leading-relaxed text-primary-foreground/75">
              En Chef Room creemos que cada chef merece un uniforme que refleje su pasión y
              profesionalismo. Materiales de primera con un proceso de personalización único para
              prendas que resisten el ritmo de una cocina exigente.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-primary-foreground/75">
              Desde Puebla para todo México, más de una década vistiendo a los mejores equipos del
              país.
            </p>

            <div className="mt-12 grid grid-cols-3 gap-6 border-t border-white/15 pt-10 sm:gap-8">
              {[
                { value: '10+', label: 'Años de experiencia' },
                { value: '5,000+', label: 'Chefs equipados' },
                { value: '98%', label: 'Satisfacción' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-sans text-2xl font-bold md:text-3xl">{stat.value}</p>
                  <p className="mt-2 font-serif text-xs text-primary-foreground/55 sm:text-sm">
                    {stat.label}
                  </p>
                </div>
              ))}
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
