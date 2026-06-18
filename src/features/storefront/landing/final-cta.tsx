'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

import { LandingMediaImage } from './components/landing-media-image'
import { LandingReveal } from './components/landing-reveal'
import { LANDING_MEDIA } from './lib/landing-media'

interface FinalCTAProps {
  className?: string
}

export function FinalCTA({ className }: FinalCTAProps) {
  return (
    <section className={cn('relative overflow-hidden py-24 md:py-32', className)}>
      <div className="absolute inset-0">
        <LandingMediaImage
          asset={LANDING_MEDIA.finalCta}
          className="!aspect-auto h-full min-h-[320px] w-full"
          overlay="dramatic"
          sizes="100vw"
        />
        <div
          className="absolute inset-0 bg-background/85 backdrop-blur-[2px] dark:bg-background/90"
          aria-hidden
        />
      </div>

      <div className="relative mx-auto max-w-3xl px-6 text-center lg:px-8">
        <LandingReveal>
          <p className="font-sans text-[11px] font-semibold tracking-[0.28em] uppercase text-primary">
            Comienza ahora
          </p>
          <h2 className="mt-6 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-[2.75rem] lg:leading-[1.1] text-balance">
            Crea un uniforme tan profesional como tu cocina.
          </h2>
          <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
            Diseña tu uniforme personalizado hoy y destaca en cada servicio. Envío gratis en pedidos
            mayores a $1999 MXN.
          </p>
          <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
            <Button
              size="lg"
              className="h-13 min-w-[200px] rounded-full px-10 font-sans text-sm font-semibold tracking-wide shadow-lg shadow-primary/25"
              asChild
            >
              <Link href={routes.customize}>
                Comenzar ahora
                <ArrowRight className="ml-2 size-4" />
              </Link>
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="h-13 min-w-[200px] rounded-full border-border/80 bg-card/60 px-10 font-sans text-sm font-semibold tracking-wide backdrop-blur-sm"
              asChild
            >
              <Link href={routes.contact}>Contactar ventas</Link>
            </Button>
          </div>
        </LandingReveal>
      </div>
    </section>
  )
}
