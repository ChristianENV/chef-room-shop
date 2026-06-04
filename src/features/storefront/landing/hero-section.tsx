'use client'

import Link from 'next/link'
import { ArrowRight, Image, Palette, Play, Sparkles, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { cn } from '@/lib/utils'

import { ChefAvatarStack } from './components/chef-avatar-stack'
import { LandingFloat, LandingReveal } from './components/landing-reveal'
import { LandingMediaImage } from './components/landing-media-image'
import { LANDING_CHEF_AVATARS, LANDING_MEDIA } from './lib/landing-media'

const floatingFeatures = [
  { icon: Palette, label: 'Colores', detail: 'Paleta premium' },
  { icon: Type, label: 'Bordado', detail: 'Nombre o texto' },
  { icon: Image, label: 'Logo', detail: 'Alta resolución' },
] as const

const floatPositions = [
  'left-0 top-[18%] md:-left-6 lg:-left-10',
  'right-0 top-[38%] md:-right-6 lg:-right-8',
  'left-4 bottom-[22%] md:left-0 lg:-left-4',
] as const

export function HeroSection() {
  const heroVideoReady = Boolean(LANDING_MEDIA.heroPoster.src?.trim())

  return (
    <section className="relative overflow-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,var(--primary)_0%,transparent_55%)] opacity-[0.07]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:pb-24 md:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,0.95fr)_minmax(520px,1.1fr)] lg:gap-14 xl:gap-16">
          <LandingReveal className="relative z-10 max-w-xl lg:max-w-none">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-card/80 px-4 py-1.5 shadow-sm backdrop-blur-sm">
              <Sparkles className="size-3.5 text-primary" aria-hidden />
              <span className="font-sans text-[11px] font-semibold tracking-[0.2em] uppercase text-primary">
                Uniformes de chef personalizados
              </span>
            </div>

            <h1 className="mt-8 font-sans text-[2.35rem] font-bold leading-[1.05] tracking-tight text-foreground sm:text-5xl lg:text-[3.35rem] xl:text-6xl">
              Tu cocina te define,{' '}
              <span className="bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                tu uniforme te distingue.
              </span>
            </h1>

            <p className="mt-8 max-w-lg font-serif text-lg leading-relaxed text-muted-foreground md:text-xl">
              Diseña uniformes profesionales con colores, bordados, logotipos y detalles
              pensados para tu estilo de cocina. Producción a medida con acabados premium.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row sm:items-center">
              <Button
                size="lg"
                className="h-13 rounded-full px-8 font-sans text-sm font-semibold tracking-wide shadow-lg shadow-primary/25"
                asChild
              >
                <Link href={routes.customize}>
                  Diseñar mi uniforme
                  <ArrowRight className="ml-2 size-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border/80 bg-card/50 px-8 font-sans text-sm font-semibold tracking-wide backdrop-blur-sm"
                asChild
              >
                <Link href={routes.shop}>Explorar colección</Link>
              </Button>
            </div>

            <div className="mt-14 flex flex-wrap items-center gap-5 border-t border-border/60 pt-10 sm:gap-6">
              <ChefAvatarStack
                avatars={LANDING_CHEF_AVATARS}
                size={36}
                overlap={9}
                className="sm:hidden"
              />
              <ChefAvatarStack
                avatars={LANDING_CHEF_AVATARS}
                size={44}
                overlap={11}
                className="hidden sm:block"
              />
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">
                  +500 chefs profesionales
                </p>
                <p className="font-serif text-xs text-muted-foreground">
                  confían en Chef Room en México
                </p>
              </div>
            </div>
          </LandingReveal>

          <LandingReveal className="relative lg:pl-2 xl:pl-4" delay={0.12}>
            <div className="relative mx-auto w-full max-w-lg lg:max-w-none">
              <div className="relative overflow-hidden rounded-[1.75rem] border border-border/60 bg-[#121421] shadow-2xl shadow-primary/10 ring-1 ring-border/40">
                <LandingMediaImage
                  asset={LANDING_MEDIA.hero}
                  priority
                  fit="contain"
                  sizes="(max-width: 1024px) 92vw, 52vw"
                  overlay="none"
                  frameClassName="bg-[#121421]"
                  className="min-h-[300px] sm:min-h-[380px] md:min-h-[460px] lg:min-h-[520px] !aspect-auto"
                />

                {heroVideoReady ? (
                  <button
                    type="button"
                    className="absolute left-1/2 top-1/2 flex size-16 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary/90 text-primary-foreground shadow-xl backdrop-blur-sm transition hover:scale-105"
                    aria-label="Reproducir video"
                  >
                    <Play className="ml-0.5 size-7 fill-current" />
                  </button>
                ) : (
                  <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-xl border border-white/10 bg-black/40 px-4 py-2.5 text-white backdrop-blur-md">
                    <span className="font-sans text-[10px] font-medium tracking-widest uppercase opacity-80">
                      Video editorial — próximamente
                    </span>
                    <Play className="size-4 opacity-50" aria-hidden />
                  </div>
                )}
              </div>

              {floatingFeatures.map((feat, i) => (
                <LandingFloat
                  key={feat.label}
                  delay={0.2 + i * 0.12}
                  className={cn('absolute z-20 hidden sm:block', floatPositions[i])}
                >
                  <div className="flex items-center gap-3 rounded-2xl border border-border/80 bg-card/95 px-4 py-3 shadow-lg backdrop-blur-md">
                    <div className="flex size-10 items-center justify-center rounded-xl bg-primary/10">
                      <feat.icon className="size-4 text-primary" aria-hidden />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold text-foreground">{feat.label}</p>
                      <p className="font-serif text-[11px] text-muted-foreground">{feat.detail}</p>
                    </div>
                  </div>
                </LandingFloat>
              ))}
            </div>
          </LandingReveal>
        </div>
      </div>
    </section>
  )
}
