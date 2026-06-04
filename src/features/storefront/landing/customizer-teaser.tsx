'use client'

import Link from 'next/link'
import { ArrowRight, Check, Layers, MousePointer2, Wand2 } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { routes } from '@/src/config/routes'

import { LandingMediaImage } from './components/landing-media-image'
import { LandingReveal } from './components/landing-reveal'
import { SectionHeader } from './components/section-header'
import { LANDING_MEDIA } from './lib/landing-media'

const features = [
  { icon: Layers, text: 'Elige colores y detalles de la prenda' },
  { icon: Wand2, text: 'Agrega nombre, texto o bordado' },
  { icon: MousePointer2, text: 'Visualiza cambios en tiempo real' },
  { icon: Check, text: 'Guarda y retoma tus diseños cuando quieras' },
] as const

interface CustomizerTeaserProps {
  className?: string
}

export function CustomizerTeaser({ className }: CustomizerTeaserProps) {
  return (
    <section className={cn('relative overflow-x-clip bg-background py-24 md:py-32', className)}>
      <div
        className="pointer-events-none absolute right-0 top-0 h-[min(50vh,480px)] w-1/2 bg-[radial-gradient(circle_at_100%_0%,var(--primary)_0%,transparent_70%)] opacity-[0.06]"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-14 lg:grid-cols-2 lg:gap-20">
          <LandingReveal className="order-2 lg:order-1">
            <div className="relative overflow-visible pb-6 pr-2 sm:pb-8 sm:pr-4">
              <div
                className="pointer-events-none absolute -inset-3 rounded-[1.75rem] bg-[radial-gradient(ellipse_85%_65%_at_50%_30%,rgba(90,111,221,0.2)_0%,transparent_70%)]"
                aria-hidden
              />

              <div className="relative overflow-visible rounded-2xl border border-white/10 bg-[#0d1024] p-1.5 shadow-2xl shadow-primary/25 ring-1 ring-primary/15 sm:p-2">
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-[#0d1024]">
                  <LandingMediaImage
                    asset={LANDING_MEDIA.customizer}
                    fit="cover"
                    sizes="(max-width: 1024px) 100vw, 50vw"
                    overlay="none"
                    frameClassName="bg-[#0d1024]"
                    className="absolute inset-0 z-10 !aspect-auto"
                  />
                </div>
              </div>

              <div className="absolute bottom-0 right-2 z-40 rounded-xl border border-white/10 bg-card/95 px-4 py-3 shadow-xl backdrop-blur-md sm:-bottom-1 sm:right-4 md:right-6">
                <p className="font-sans text-[10px] font-semibold tracking-widest uppercase text-primary">
                  Vista 3D
                </p>
                <p className="mt-0.5 font-serif text-xs text-muted-foreground">
                  Previsualización en vivo
                </p>
              </div>
            </div>
          </LandingReveal>

          <LandingReveal className="order-1 lg:order-2" delay={0.1}>
            <SectionHeader
              eyebrow="Personalizador en línea"
              title="Diseña tu uniforme, exactamente como lo imaginas"
              description="Colores, bordados, logotipos y tipografía. Todo visible al instante antes de confirmar tu pedido."
            />

            <ul className="mt-10 space-y-4">
              {features.map(({ icon: Icon, text }) => (
                <li
                  key={text}
                  className="flex items-start gap-4 rounded-xl border border-border/50 bg-card/60 px-4 py-3.5 backdrop-blur-sm"
                >
                  <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <Icon className="size-4 text-primary" aria-hidden />
                  </div>
                  <span className="pt-1 font-serif text-[15px] leading-snug text-foreground">
                    {text}
                  </span>
                </li>
              ))}
            </ul>

            <div className="mt-10 flex flex-wrap gap-4">
              <Button
                size="lg"
                className="h-12 rounded-full px-8 font-sans text-sm font-semibold tracking-wide shadow-lg shadow-primary/20"
                asChild
              >
                <Link href={routes.customize}>
                  Probar el personalizador
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
