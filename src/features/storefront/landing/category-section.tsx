import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { routes } from '@/src/config/routes'

const categories = [
  {
    id: 'filipinas',
    title: 'Filipinas',
    subtitle: 'Uniformes de chef',
    description: 'Ejecutivas, slim fit y clásicas. Personalizables con bordados, logos y colores a tu medida.',
    href: routes.chefJackets,
    featured: true,
  },
  {
    id: 'mandiles',
    title: 'Mandiles',
    subtitle: 'Protección con estilo',
    description: 'Profesionales con bolsillos funcionales y materiales de alta durabilidad.',
    href: routes.aprons,
  },
  {
    id: 'pantalones',
    title: 'Pantalones',
    subtitle: 'Comodidad diaria',
    description: 'Resistentes y cómodos para las jornadas más intensas en cocina.',
    href: routes.pants,
  },
  {
    id: 'accesorios',
    title: 'Accesorios',
    subtitle: 'Detalles que importan',
    description: 'Gorros, pañuelos y complementos para completar tu look profesional.',
    href: routes.shop,
    comingSoon: true,
  },
]

interface CategorySectionProps {
  className?: string
}

export function CategorySection({ className }: CategorySectionProps) {
  return (
    <section className={cn('bg-background py-20 md:py-28', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        {/* Section Header */}
        <div className="max-w-2xl">
          <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
            Nuestras categorias
          </p>
          <h2 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
            Encuentra tu prenda ideal
          </h2>
          <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
            Cada pieza esta pensada para la exigencia de una cocina profesional.
          </p>
        </div>

        {/* Categories Grid - asymmetric editorial layout */}
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={cat.comingSoon ? '#' : cat.href}
              className={cn(
                'group relative flex flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300',
                cat.featured && 'lg:col-span-2 lg:row-span-2',
                !cat.comingSoon && 'hover:border-primary/40 hover:shadow-lg hover:shadow-primary/5'
              )}
            >
              {/* Image area */}
              <div
                className={cn(
                  'relative overflow-hidden bg-secondary',
                  cat.featured ? 'aspect-[16/9]' : 'aspect-[4/3]'
                )}
              >
                {/* Premium photography placeholder */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center">
                    <div
                      className={cn(
                        'mx-auto rounded-lg bg-gradient-to-b from-muted/80 to-secondary',
                        cat.featured ? 'h-28 w-20' : 'h-20 w-14'
                      )}
                    />
                    <p className="mt-3 font-sans text-[11px] font-medium tracking-wider uppercase text-muted-foreground/50">
                      {cat.id}
                    </p>
                  </div>
                </div>

                {cat.comingSoon && (
                  <div className="absolute right-4 top-4">
                    <Badge className="border-0 bg-primary/90 font-sans text-[10px] font-semibold tracking-wider uppercase text-primary-foreground">
                      Proximamente
                    </Badge>
                  </div>
                )}

                {/* Hover overlay */}
                {!cat.comingSoon && (
                  <div className="absolute inset-0 bg-primary/80 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                    <div className="flex h-full items-center justify-center">
                      <span className="flex items-center gap-2 font-sans text-sm font-semibold tracking-wide text-white">
                        Explorar
                        <ArrowRight className="h-4 w-4" />
                      </span>
                    </div>
                  </div>
                )}
              </div>

              {/* Content */}
              <div className={cn('flex flex-1 flex-col p-6', cat.featured && 'p-8')}>
                <p className="font-serif text-xs tracking-wider uppercase text-muted-foreground">
                  {cat.subtitle}
                </p>
                <h3
                  className={cn(
                    'mt-2 font-sans font-semibold tracking-tight text-foreground',
                    cat.featured ? 'text-2xl' : 'text-lg'
                  )}
                >
                  {cat.title}
                </h3>
                <p className="mt-2 font-serif text-sm leading-relaxed text-muted-foreground">
                  {cat.description}
                </p>

                {!cat.comingSoon && (
                  <div className="mt-auto pt-5">
                    <span className="inline-flex items-center gap-1.5 font-sans text-[13px] font-semibold text-primary transition-all group-hover:gap-2.5">
                      Ver coleccion
                      <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                )}
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
