import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

export const metadata: Metadata = {
  title: 'Personaliza tu uniforme | Chef Room by Bedolla',
  description:
    'Diseña uniformes de chef personalizados con colores, bordados y logotipos. Próximamente disponible.',
}

export default function CustomizePage() {
  return (
    <div className="mx-auto max-w-2xl px-6 py-24 text-center lg:px-8">
        <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
          Personalización
        </p>
        <h1 className="brand-underline-center mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Diseña tu uniforme
        </h1>
        <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
          El customizador estará disponible muy pronto. Mientras tanto, explora nuestra tienda o
          contáctanos para cotizaciones personalizadas.
        </p>
        <div className="mt-10 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button asChild className="rounded-full px-8">
            <Link href={routes.shop}>Ver tienda</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href={routes.contact}>Contactar ventas</Link>
          </Button>
        </div>
      </div>
  )
}
