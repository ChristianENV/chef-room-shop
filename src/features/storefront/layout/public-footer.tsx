import Link from 'next/link'
import { Instagram, Mail, MapPin, Phone } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'
import { BRAND_TAGLINE } from '@/lib/brand'
import { routes } from '@/src/config/routes'
import { BUSINESS_VARS } from '@/src/config/vars'
import { footerCompanyLinks, footerProductLinks } from '@/src/config/navigation.storefront'

const footerLegalLinks = [
  { href: routes.privacy, label: 'Aviso de Privacidad' },
  { href: routes.terms, label: 'Términos y Condiciones' },
] as const

function NewsletterSection() {
  return (
    <div className="bg-primary px-6 py-16 lg:px-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col items-center gap-8 text-center md:flex-row md:justify-between md:text-left">
          <div className="max-w-md">
            <h2 className="font-sans text-2xl font-bold tracking-tight text-white">
              Recibe novedades exclusivas
            </h2>
            <p className="mt-2 font-serif text-sm leading-relaxed text-white/60">
              Ofertas, nuevos productos y tips para chefs profesionales.
            </p>
          </div>
          <form className="flex w-full max-w-sm gap-3">
            <Input
              type="email"
              placeholder="tu@email.com"
              className="h-11 border-white/15 bg-white/10 font-serif text-sm text-white placeholder:text-white/40 focus-visible:ring-white/30"
            />
            <Button
              type="submit"
              className="h-11 rounded-full bg-white px-6 font-sans text-sm font-semibold text-primary hover:bg-white/90"
            >
              Suscribirse
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

interface PublicFooterProps {
  showNewsletter?: boolean
  className?: string
}

export function PublicFooter({ showNewsletter = true, className }: PublicFooterProps) {
  return (
    <footer className={cn('bg-card', className)}>
      {showNewsletter && <NewsletterSection />}

      <div className="border-t border-border px-6 py-16 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <div className="grid gap-12 md:grid-cols-2 lg:grid-cols-6">
            <div className="lg:col-span-2">
              <Link href={routes.home} className="inline-flex transition-opacity hover:opacity-90">
                <ChefRoomLogo variant="horizontal" colorScheme="auto" size="lg" />
              </Link>
              <p className="mt-5 max-w-xs font-serif text-sm leading-relaxed text-muted-foreground">
                {BRAND_TAGLINE}
              </p>
              {BUSINESS_VARS.social.instagram ? (
                <div className="mt-6 flex items-center gap-4">
                  <a
                    href={BUSINESS_VARS.social.instagram}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-colors hover:text-primary"
                    aria-label="Instagram"
                  >
                    <Instagram className="h-4 w-4" />
                  </a>
                </div>
              ) : null}
            </div>

            {[
              { title: 'Productos', links: footerProductLinks },
              { title: 'Empresa', links: footerCompanyLinks },
              {
                title: 'Soporte',
                links: [
                  { label: 'Guía de tallas', href: routes.sizeGuide },
                  { label: 'Contacto', href: routes.contact },
                ],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                  {col.title}
                </h3>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="font-serif text-sm text-foreground/70 transition-colors hover:text-foreground"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div>
              <h3 className="font-sans text-[11px] font-semibold tracking-[0.15em] uppercase text-muted-foreground">
                Contacto
              </h3>
              <ul className="mt-5 space-y-3">
                <li className="flex items-start gap-2.5">
                  <MapPin className="mt-0.5 h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                  <span className="font-serif text-sm text-foreground/70">
                    {BUSINESS_VARS.address.formatted}
                  </span>
                </li>
                {BUSINESS_VARS.support.phone ? (
                  <li className="flex items-center gap-2.5">
                    <Phone className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <a
                      href={`tel:${BUSINESS_VARS.support.phoneTelHref}`}
                      className="font-serif text-sm text-foreground/70 hover:text-foreground"
                    >
                      {BUSINESS_VARS.support.phone}
                    </a>
                  </li>
                ) : null}
                {BUSINESS_VARS.support.email ? (
                  <li className="flex items-center gap-2.5">
                    <Mail className="h-3.5 w-3.5 flex-shrink-0 text-muted-foreground" />
                    <a
                      href={`mailto:${BUSINESS_VARS.support.email}`}
                      className="font-serif text-sm text-foreground/70 hover:text-foreground"
                    >
                      {BUSINESS_VARS.support.email}
                    </a>
                  </li>
                ) : null}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-border px-6 py-5 lg:px-8">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-4 md:flex-row">
          <p className="font-serif text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {BUSINESS_VARS.legalName}. Todos los derechos
            reservados.
          </p>
          <div className="flex items-center gap-6">
            {footerLegalLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="font-serif text-xs text-muted-foreground transition-colors hover:text-foreground"
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  )
}
