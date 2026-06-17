'use client'

import Link from 'next/link'
import { ArrowRight, Image, Palette, Sparkles, Type } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'
import { cn } from '@/lib/utils'

import { ChefAvatarStack } from './components/chef-avatar-stack'
import { HeroEditorialAtmosphere } from './components/hero-editorial-atmosphere'
import { HERO_3D_STAGE } from './components/hero-3d/hero-3d-config'
import { Hero3DShowcase } from './components/hero-3d/hero-3d-showcase'
import { LandingFloat, LandingReveal } from './components/landing-reveal'
import { LANDING_CHEF_AVATARS } from './lib/landing-media'

const floatingFeatures = [
  { icon: Palette, label: 'Colores premium' },
  { icon: Type, label: 'Bordado' },
  { icon: Image, label: 'Tu logo' },
] as const

const floatPositions = [
  'left-0 top-[10%] md:-left-6 lg:-left-12',
  'right-0 top-[18%] md:-right-5 lg:-right-10',
  'bottom-[6%] left-1/2 -translate-x-1/2 md:bottom-[8%]',
] as const

export function HeroSection() {

  return (
    <section className="relative overflow-x-hidden bg-background">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_70%_0%,var(--primary)_0%,transparent_55%)] opacity-[0.07]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-32 top-1/3 h-[28rem] w-[28rem] rounded-full bg-primary/5 blur-3xl"
        aria-hidden
      />

      <div className="mx-auto max-w-7xl px-6 pb-16 pt-12 md:pb-24 md:pt-16 lg:px-8 lg:pb-28 lg:pt-20">
        <div className="grid items-start gap-12 lg:grid-cols-[minmax(0,2fr)_minmax(440px,1fr)] lg:gap-12 xl:grid-cols-[minmax(0,2fr)_minmax(480px,1fr)] xl:gap-14">
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
              pensados para tu estilo de cocina. Producción con acabados premium.
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

          <LandingReveal className="relative w-full lg:pl-0 xl:pl-2" delay={0.12}>
            <div
              className={cn(
                'relative mx-auto w-full overflow-visible',
                'max-w-[min(100%,420px)] sm:max-w-[480px] md:max-w-[1540px]',
                'lg:mx-0 lg:max-w-none',
                HERO_3D_STAGE.maxWidthClass,
              )}
            >
              <HeroEditorialAtmosphere className="pointer-events-none absolute inset-0 -z-10 overflow-visible" />

              <div
                className={cn(
                  'relative z-10 w-full',
                  HERO_3D_STAGE.minHeightClass,
                  HERO_3D_STAGE.smMinHeightClass,
                  HERO_3D_STAGE.lgMinHeightClass,
                )}
              >
                <Hero3DShowcase priority className="absolute inset-0 h-full w-full" />
              </div>

              {floatingFeatures.map((feat, i) => (
                <LandingFloat
                  key={feat.label}
                  delay={0.24 + i * 0.1}
                  className={cn('absolute z-20 hidden sm:block', floatPositions[i])}
                >
                  <div className="flex items-center gap-2.5 rounded-full border border-white/70 bg-white/85 px-3.5 py-2 shadow-[0_10px_40px_-18px_rgba(43,50,128,0.45)] backdrop-blur-md">
                    <div className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary/10">
                      <feat.icon className="size-3.5 text-primary" aria-hidden />
                    </div>
                    <p className="whitespace-nowrap font-sans text-[11px] font-semibold tracking-wide text-foreground">
                      {feat.label}
                    </p>
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
