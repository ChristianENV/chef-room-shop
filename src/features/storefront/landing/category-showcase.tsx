import Link from 'next/link'
import { ArrowRight } from 'lucide-react'

import { cn } from '@/lib/utils'

interface Category {
  title: string
  description: string
  href: string
  imagePlaceholder?: string
}

interface CategoryShowcaseProps {
  title: string
  subtitle?: string
  categories: Category[]
  className?: string
}

export function CategoryShowcase({
  title,
  subtitle,
  categories,
  className,
}: CategoryShowcaseProps) {
  return (
    <section className={cn('bg-secondary px-4 py-16 md:px-6 md:py-20', className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((category, index) => (
            <Link
              key={index}
              href={category.href}
              className="group overflow-hidden rounded-xl border border-border bg-card transition-all hover:border-primary/50 hover:shadow-lg"
            >
              {/* Image Placeholder */}
              <div className="aspect-[4/3] bg-muted">
                <div className="flex h-full items-center justify-center">
                  <span className="font-sans text-sm text-muted-foreground">
                    {category.imagePlaceholder || 'Imagen de categoria'}
                  </span>
                </div>
              </div>

              <div className="p-6">
                <h3 className="font-sans text-xl font-semibold text-foreground group-hover:text-primary">
                  {category.title}
                </h3>
                <p className="mt-2 font-serif text-sm text-muted-foreground">
                  {category.description}
                </p>
                <div className="mt-4 flex items-center font-sans text-sm font-medium text-primary">
                  Ver productos
                  <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-1" />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
