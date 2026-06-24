import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

interface SeoCTAProps {
  title: string
  description: string
  primaryCta: {
    label: string
    href: string
  }
  secondaryCta?: {
    label: string
    href: string
  }
  variant?: 'primary' | 'secondary'
  className?: string
}

export function SeoCTA({
  title,
  description,
  primaryCta,
  secondaryCta,
  variant = 'primary',
  className,
}: SeoCTAProps) {
  if (variant === 'secondary') {
    return (
      <section className={cn('bg-secondary px-4 py-16 md:px-6 md:py-20', className)}>
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-muted-foreground">
            {description}
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
            <Button asChild size="lg">
              <Link href={primaryCta.href}>
                {primaryCta.label}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            {secondaryCta && (
              <Button asChild size="lg" variant="outline">
                <Link href={secondaryCta.href}>{secondaryCta.label}</Link>
              </Button>
            )}
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className={cn('bg-primary px-4 py-16 md:px-6 md:py-20', className)}>
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="font-sans text-3xl font-bold text-white md:text-4xl">{title}</h2>
        <p className="mx-auto mt-4 max-w-xl font-serif text-lg text-white/90">{description}</p>
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
