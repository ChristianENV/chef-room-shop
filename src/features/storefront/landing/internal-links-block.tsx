import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface InternalLink {
  label: string
  href: string
  description?: string
}

interface InternalLinksBlockProps {
  title: string
  links: InternalLink[]
  className?: string
}

export function InternalLinksBlock({ title, links, className }: InternalLinksBlockProps) {
  return (
    <section className={cn('bg-secondary px-4 py-12 md:px-6 md:py-16', className)}>
      <div className="mx-auto max-w-4xl">
        <h3 className="mb-6 font-sans text-xl font-semibold text-foreground">{title}</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {links.map((link, index) => (
            <Link
              key={index}
              href={link.href}
              className="group flex items-center justify-between rounded-lg border border-border bg-card p-4 transition-colors hover:border-primary/50"
            >
              <div>
                <span className="font-sans font-medium text-foreground group-hover:text-primary">
                  {link.label}
                </span>
                {link.description && (
                  <p className="mt-1 font-serif text-xs text-muted-foreground">
                    {link.description}
                  </p>
                )}
              </div>
              <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
