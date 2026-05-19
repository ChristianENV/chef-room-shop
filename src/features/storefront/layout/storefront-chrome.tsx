'use client'

import { usePathname } from 'next/navigation'
import { PublicNavbarSession } from './public-navbar-session'
import { PublicFooter } from './public-footer'

/** Routes that provide their own full-page chrome (auth, checkout, admin demo). */
const CHROMELESS_PATH_PREFIXES = ['/login', '/register', '/checkout', '/demo/admin'] as const

/** Storefront routes that hide the newsletter block in the footer. */
const FOOTER_NO_NEWSLETTER_PREFIXES = [
  '/shop',
  '/customize',
  '/contact',
  '/size-guide',
  '/account',
  '/cart',
] as const

function shouldHideChrome(pathname: string) {
  return CHROMELESS_PATH_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

function shouldHideNewsletter(pathname: string) {
  return FOOTER_NO_NEWSLETTER_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`)
  )
}

interface StorefrontChromeProps {
  children: React.ReactNode
}

export function StorefrontChrome({ children }: StorefrontChromeProps) {
  const pathname = usePathname()
  const hideChrome = shouldHideChrome(pathname)

  if (hideChrome) {
    return <>{children}</>
  }

  const showNewsletter = !shouldHideNewsletter(pathname)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <PublicNavbarSession />
      <main className="flex-1">{children}</main>
      <PublicFooter showNewsletter={showNewsletter} />
    </div>
  )
}
