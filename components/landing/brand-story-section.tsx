import { cn } from '@/lib/utils'

interface BrandStorySectionProps {
  className?: string
}

export function BrandStorySection({ className }: BrandStorySectionProps) {
  return (
    <section className={cn('relative overflow-hidden bg-primary py-24 md:py-32', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid items-center gap-16 lg:grid-cols-2 lg:gap-24">
          {/* Image placeholder */}
          <div className="relative">
            <div className="aspect-[4/5] overflow-hidden rounded-2xl bg-white/10">
              <div className="flex h-full flex-col items-center justify-center">
                <div className="h-32 w-24 rounded-lg bg-white/10" />
                <p className="mt-4 font-sans text-[11px] font-medium tracking-widest uppercase text-white/30">
                  Fotografia editorial
                </p>
              </div>
            </div>
          </div>

          {/* Content */}
          <div>
            <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-white/50">
              Nuestra historia
            </p>
            <h2 className="mt-6 font-sans text-3xl font-bold leading-tight tracking-tight text-white md:text-4xl lg:text-5xl text-balance">
              Diseno, calidad y pasion por la cocina profesional.
            </h2>
            <p className="mt-8 font-serif text-lg leading-relaxed text-white/70">
              En Chef Room creemos que cada chef merece un uniforme que refleje su
              pasion y profesionalismo. Combinamos materiales de primera calidad con
              un proceso de personalizacion unico para crear prendas que resisten el
              ritmo de una cocina profesional.
            </p>
            <p className="mt-4 font-serif text-lg leading-relaxed text-white/70">
              Desde Guadalajara para todo Mexico, llevamos mas de 10 anos vistiendo
              a los mejores chefs del pais.
            </p>

            {/* Stats */}
            <div className="mt-12 grid grid-cols-3 gap-8 border-t border-white/10 pt-10">
              {[
                { value: '10+', label: 'Anos de experiencia' },
                { value: '5,000+', label: 'Chefs equipados' },
                { value: '98%', label: 'Satisfaccion' },
              ].map((stat) => (
                <div key={stat.label}>
                  <p className="font-sans text-3xl font-bold text-white md:text-4xl">
                    {stat.value}
                  </p>
                  <p className="mt-2 font-serif text-sm text-white/50">{stat.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
