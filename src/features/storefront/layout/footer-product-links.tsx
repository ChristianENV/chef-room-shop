'use client'

import Link from 'next/link'

import { routes } from '@/src/config/routes'
import { useShopNavCategories } from '@/src/features/storefront/catalog/hooks/use-shop-nav-categories'

export function FooterProductLinks() {
  const { categories } = useShopNavCategories()

  const links = [
    { label: 'Ver todo', href: routes.shop },
    ...categories,
    { label: 'Personalización', href: routes.customize },
  ]

  return (
    <>
      {links.map((link) => (
        <li key={`${link.label}-${link.href}`}>
          <Link
            href={link.href}
            className="font-serif text-sm text-foreground/70 transition-colors hover:text-foreground"
          >
            {link.label}
          </Link>
        </li>
      ))}
    </>
  )
}
