'use client'

import { cn } from '@/lib/utils'

import { LandingReveal, LandingStagger, LandingStaggerItem } from './components/landing-reveal'
import { SectionHeader } from './components/section-header'

const steps = [
  {
    number: '01',
    title: 'Elige tu prenda',
    description: 'Filipinas, mandiles, pantalones y accesorios de nuestra colección profesional.',
  },
  {
    number: '02',
    title: 'Personaliza',
    description: 'Colores, nombre, logotipo y detalles que representan tu cocina.',
  },
  {
    number: '03',
    title: 'Revisa tu diseño',
    description: 'Confirma cada detalle con vista previa antes de producir.',
  },
  {
    number: '04',
    title: 'Recibe en tu cocina',
    description: 'Producción premium y envío seguro a tu restaurante.',
  },
] as const

interface HowItWorksProps {
  className?: string
}

export function HowItWorks({ className }: HowItWorksProps) {
  return (
    <section className={cn('bg-background py-24 md:py-32', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <LandingReveal className="mx-auto max-w-2xl text-center">
          <SectionHeader
            eyebrow="Proceso"
            title="Cuatro pasos hacia tu uniforme ideal"
            description="Un flujo claro, sin fricción, diseñado para equipos y chefs individuales."
            align="center"
          />
        </LandingReveal>

        <LandingStagger className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {steps.map((step, index) => (
            <LandingStaggerItem key={step.number}>
              <div
                className={cn(
                  'relative h-full rounded-2xl border border-border/60 bg-card p-8 transition-colors duration-300 hover:border-primary/20 hover:bg-card/80',
                  index === 0 && 'md:rounded-3xl lg:rounded-2xl',
                )}
              >
                <span className="font-sans text-4xl font-bold tabular-nums text-primary/15">
                  {step.number}
                </span>
                <div className="absolute left-8 top-8 h-px w-8 bg-primary/40" aria-hidden />
                <h3 className="mt-6 font-sans text-lg font-semibold tracking-tight text-foreground">
                  {step.title}
                </h3>
                <p className="mt-3 font-serif text-sm leading-relaxed text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </LandingStaggerItem>
          ))}
        </LandingStagger>
      </div>
    </section>
  )
}
