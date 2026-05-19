import type { Metadata } from 'next'
import Link from 'next/link'
import { PublicLayout } from '@/components/layout/public-layout'
import { Button } from '@/components/ui/button'
import { routes } from '@/src/config/routes'

export const metadata: Metadata = {
  title: 'Pantalones de chef | Chef Room by Bedolla',
  description:
    'Pantalones de chef profesionales, resistentes y cómodos para jornadas intensas en cocina. Próximamente más modelos.',
}

export default function ShopPantsPage() {
  return (
    <PublicLayout showNewsletter={false}>
      <div className="mx-auto max-w-3xl px-6 py-20 lg:px-8">
        <p className="font-sans text-[13px] font-semibold tracking-[0.2em] uppercase text-primary">
          Pantalones
        </p>
        <h1 className="brand-underline mt-4 font-sans text-3xl font-bold tracking-tight text-foreground md:text-4xl">
          Pantalones de chef
        </h1>
        <p className="mt-6 font-serif text-lg leading-relaxed text-muted-foreground">
          Colección en desarrollo. Explora la tienda completa o contáctanos para pedidos
          personalizados.
        </p>
        <div className="mt-10 flex flex-wrap gap-3">
          <Button asChild className="rounded-full px-8">
            <Link href={routes.shopWithCategory('pantalones')}>Ver en tienda</Link>
          </Button>
          <Button asChild variant="outline" className="rounded-full px-8">
            <Link href={routes.customize}>Personalizar</Link>
          </Button>
        </div>
      </div>
    </PublicLayout>
  )
}
