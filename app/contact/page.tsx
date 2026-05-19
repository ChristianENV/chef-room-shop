import type { Metadata } from 'next'
import Link from 'next/link'
import { Mail, MapPin, Phone } from 'lucide-react'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

export const metadata: Metadata = {
  title: 'Contacto | Chef Room by Bedolla',
  description: 'Contáctanos para cotizaciones, pedidos mayoreo y asesoría en uniformes de chef personalizados.',
}

export default function ContactPage() {
  return (
    <PublicLayout showNewsletter={false}>
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
          Contacto
        </p>
        <h1 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Hablemos de tu uniforme
        </h1>
        <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
          Nuestro equipo está listo para ayudarte con cotizaciones, personalización y pedidos
          corporativos.
        </p>

        <ul className="mt-10 space-y-4">
          <li className="flex items-center gap-3 font-serif text-foreground/80">
            <MapPin className="h-4 w-4 text-muted-foreground" />
            Guadalajara, Jalisco, México
          </li>
          <li className="flex items-center gap-3">
            <Phone className="h-4 w-4 text-muted-foreground" />
            <a href="tel:+523312345678" className="font-serif text-foreground/80 hover:text-foreground">
              +52 33 1234 5678
            </a>
          </li>
          <li className="flex items-center gap-3">
            <Mail className="h-4 w-4 text-muted-foreground" />
            <a
              href="mailto:hola@chefroom.mx"
              className="font-serif text-foreground/80 hover:text-foreground"
            >
              hola@chefroom.mx
            </a>
          </li>
        </ul>

        <div className="mt-10">
          <Button asChild className="rounded-full px-8">
            <Link href={routes.shop}>Explorar tienda</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}
