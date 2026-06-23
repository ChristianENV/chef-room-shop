'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SeoHeroProps {
  title: string
  subtitle: string
  description: string
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  className?: string
}

export function SeoHero({
  title,
  subtitle,
  description,
  primaryCta,
  secondaryCta,
  className,
}: SeoHeroProps) {
  return (
    <section
      className={cn('relative overflow-hidden bg-primary px-4 py-16 md:px-6 md:py-24', className)}
    >
      <div className="absolute inset-0 opacity-10">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
      </div>

      <div className="relative mx-auto max-w-4xl text-center">
        <p className="font-sans text-sm font-medium uppercase tracking-wider text-white/80">
          {subtitle}
        </p>
        <h1 className="mt-4 text-balance font-sans text-4xl font-bold text-white md:text-5xl lg:text-6xl">
          {title}
        </h1>
        <p className="mx-auto mt-6 max-w-2xl text-pretty font-serif text-lg text-white/90 md:text-xl">
          {description}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          <Button
            asChild
            size="lg"
            className="bg-white font-sans font-semibold text-primary hover:bg-white/90"
          >
            <Link href={primaryCta.href}>
              {primaryCta.label}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          {secondaryCta && (
            <Button
              asChild
              size="lg"
              variant="outline"
              className="border-white/30 bg-transparent font-sans font-semibold text-white hover:bg-white/10"
            >
              <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
            </Button>
          )}
        </div>
      </div>
    </section>
  )
}
