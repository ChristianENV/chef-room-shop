'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight, Palette, Type, Image } from 'lucide-react'

const floatingFeatures = [
  { icon: Palette, label: 'Colores', detail: '12 opciones' },
  { icon: Type, label: 'Bordado', detail: 'Tu nombre' },
  { icon: Image, label: 'Logo', detail: 'Sube tu archivo' },
]

export function HeroSection() {
  return (
    <section className="relative overflow-hidden bg-background">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 pb-20 pt-16 md:pb-28 md:pt-20 lg:grid-cols-2 lg:gap-20 lg:pb-32 lg:pt-24">
          {/* Left - Editorial content */}
          <div>
            <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
              Uniformes de chef personalizados
            </p>

            <h1 className="mt-6 font-sans text-4xl font-bold leading-[1.1] tracking-tight text-foreground md:text-5xl lg:text-6xl">
              Tu cocina te define,{' '}
              <span className="text-primary">tu uniforme te distingue.</span>
            </h1>

            <p className="mt-8 max-w-lg font-serif text-lg leading-relaxed text-muted-foreground">
              Disena uniformes profesionales con colores, bordados, logotipos y
              detalles pensados para tu estilo de cocina. Produccion a medida con
              calidad premium.
            </p>

            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <Button
                size="lg"
                className="h-13 rounded-full bg-primary px-8 font-sans text-sm font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl hover:shadow-primary/30"
                asChild
              >
                <Link href="/customize">
                  Disenar mi uniforme
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="h-13 rounded-full border-border px-8 font-sans text-sm font-semibold tracking-wide transition-all hover:border-primary hover:text-primary"
                asChild
              >
                <Link href="/shop">Ver tienda</Link>
              </Button>
            </div>

            {/* Social proof */}
            <div className="mt-14 flex items-center gap-4 border-t border-border pt-8">
              <div className="flex -space-x-2">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div
                    key={i}
                    className="h-9 w-9 rounded-full border-2 border-background bg-secondary"
                  />
                ))}
              </div>
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">
                  +500 chefs profesionales
                </p>
                <p className="font-serif text-xs text-muted-foreground">
                  confian en Chef Room
                </p>
              </div>
            </div>
          </div>

          {/* Right - Premium uniform visual with customization hints */}
          <div className="relative lg:pl-8">
            {/* Main image area */}
            <div className="relative mx-auto max-w-md lg:max-w-none">
              <div className="aspect-[3/4] overflow-hidden rounded-2xl border border-border bg-secondary">
                {/* Premium uniform photography placeholder */}
                <div className="flex h-full flex-col items-center justify-center">
                  <div className="relative h-56 w-40 rounded-lg bg-gradient-to-b from-muted to-secondary">
                    {/* Garment silhouette hint */}
                    <div className="absolute inset-x-6 top-4 h-2 rounded-full bg-primary/20" />
                    <div className="absolute inset-x-4 top-10 bottom-0 rounded-t-lg bg-primary/10" />
                    {/* Embroidery zone hint */}
                    <div className="absolute left-6 top-16 rounded border border-dashed border-primary/40 px-3 py-1.5">
                      <span className="font-sans text-[10px] font-medium tracking-wider text-primary/60">
                        BORDADO
                      </span>
                    </div>
                  </div>
                  <p className="mt-6 font-sans text-xs font-medium tracking-wider uppercase text-muted-foreground">
                    Filipina Executive
                  </p>
                  <p className="mt-1 font-serif text-xs text-muted-foreground/60">
                    Personalizable
                  </p>
                </div>
              </div>

              {/* Floating feature cards */}
              {floatingFeatures.map((feat, i) => {
                const positions = [
                  '-left-4 top-12 lg:-left-8',
                  '-right-4 top-1/3 lg:-right-8',
                  '-left-4 bottom-24 lg:-left-8',
                ]
                return (
                  <div
                    key={feat.label}
                    className={`absolute ${positions[i]} flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm`}
                  >
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                      <feat.icon className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-sans text-xs font-semibold text-foreground">
                        {feat.label}
                      </p>
                      <p className="font-serif text-[11px] text-muted-foreground">
                        {feat.detail}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
