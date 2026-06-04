'use client'

import { CreditCard, Eye, Headphones, Shield } from 'lucide-react'

import { cn } from '@/lib/utils'

import { LandingReveal } from './components/landing-reveal'

const trustItems = [
  { icon: Eye, label: 'Personalización visual' },
  { icon: Shield, label: 'Producción profesional' },
  { icon: CreditCard, label: 'Pago seguro' },
  { icon: Headphones, label: 'Atención dedicada' },
] as const

interface TrustStripProps {
  className?: string
}

export function TrustStrip({ className }: TrustStripProps) {
  return (
    <section
      className={cn(
        'border-y border-border/50 bg-card/80 py-6 backdrop-blur-sm md:py-7',
        className,
      )}
    >
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <LandingReveal>
          <ul className="grid grid-cols-2 gap-6 md:flex md:flex-wrap md:items-center md:justify-between md:gap-4">
            {trustItems.map(({ icon: Icon, label }) => (
              <li key={label} className="flex items-center justify-center gap-2.5 md:justify-start">
                <span className="flex size-9 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-4 text-primary" aria-hidden />
                </span>
                <span className="font-sans text-[12px] font-medium tracking-wide text-foreground md:text-[13px]">
                  {label}
                </span>
              </li>
            ))}
          </ul>
        </LandingReveal>
      </div>
    </section>
  )
}
