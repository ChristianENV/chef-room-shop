import { routes } from '@/src/config/routes'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import { cn } from '@/lib/utils'

interface FinalCTAProps {
  className?: string
}

export function FinalCTA({ className }: FinalCTAProps) {
  return (
    <section className={cn('bg-secondary py-24 md:py-32', className)}>
      <div className="mx-auto max-w-3xl px-6 text-center lg:px-8">
        <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
          Comienza ahora
        </p>
        <h2 className="mt-6 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl lg:text-5xl text-balance">
          Crea un uniforme tan profesional como tu cocina.
        </h2>
        <p className="mx-auto mt-6 max-w-xl font-serif text-lg leading-relaxed text-muted-foreground">
          Disena tu uniforme personalizado hoy y destaca en cada servicio. Envio
          gratis en pedidos mayores a $999 MXN.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
          <Button
            size="lg"
            className="h-13 rounded-full bg-primary px-10 font-sans text-sm font-semibold tracking-wide text-primary-foreground shadow-lg shadow-primary/20 transition-all hover:bg-primary/90 hover:shadow-xl"
            asChild
          >
            <Link href={routes.customize}>
              Comenzar ahora
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-13 rounded-full border-border px-10 font-sans text-sm font-semibold tracking-wide transition-all hover:border-primary hover:text-primary"
            asChild
          >
            <Link href={routes.contact}>Contactar ventas</Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
