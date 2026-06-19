import type { Metadata } from 'next'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

export const metadata: Metadata = {
  title: 'Guía de tallas | Chef Room by Bedolla',
  description:
    'Consulta nuestra guía de tallas para filipinas, mandiles y pantalones de chef profesionales.',
}

export default function SizeGuidePage() {
  return (
    <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
      <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
        Guía de tallas
      </p>
      <h1 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
        Encuentra tu talla ideal
      </h1>
      <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
        Tabla de medidas y recomendaciones para filipinas, mandiles y pantalones. Contenido
        detallado próximamente; mientras tanto, contáctanos para asesoría personalizada.
      </p>
      <div className="mt-10 flex flex-wrap gap-3">
        <Button asChild variant="outline" className="rounded-full">
          <Link href={routes.chefJackets}>Filipinas</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={routes.aprons}>Mandiles</Link>
        </Button>
        <Button asChild variant="outline" className="rounded-full">
          <Link href={routes.pants}>Pantalones</Link>
        </Button>
        <Button asChild className="rounded-full">
          <Link href={routes.contact}>Solicitar asesoría</Link>
        </Button>
      </div>
    </div>
  )
}
