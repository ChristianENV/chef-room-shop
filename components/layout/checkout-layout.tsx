import type { ReactNode } from 'react'
import Link from 'next/link'
import { ArrowLeft, Lock } from 'lucide-react'

import { cn } from '@/lib/utils'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'

interface CheckoutLayoutProps {
  children: ReactNode
  className?: string
}

export function CheckoutLayout({ children, className }: CheckoutLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Minimal Header */}
      <header className="border-b border-border bg-card">
        <div className="mx-auto max-w-4xl px-4 sm:px-6">
          <div className="flex h-16 items-center justify-between">
            {/* Back Link */}
            <Link
              href="/cart"
              className="flex items-center gap-2 font-sans text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Volver al carrito</span>
            </Link>

            {/* Logo */}
            <Link href="/">
              <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" />
            </Link>

            {/* Secure Badge */}
            <div className="flex items-center gap-2 text-muted-foreground">
              <Lock className="h-4 w-4" />
              <span className="hidden font-sans text-sm sm:inline">Pago seguro</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className={cn('flex-1 px-4 py-8 sm:px-6 md:py-12', className)}>
        <div className="mx-auto max-w-4xl">{children}</div>
      </main>

      {/* Minimal Footer */}
      <footer className="border-t border-border bg-card px-4 py-6 sm:px-6">
        <div className="mx-auto max-w-4xl">
          <div className="flex flex-col items-center justify-between gap-4 sm:flex-row">
            <p className="font-serif text-sm text-muted-foreground">
              &copy; {new Date().getFullYear()} Chef Room by Bedolla
            </p>
            <div className="flex items-center gap-4">
              <Link
                href="/privacidad"
                className="font-serif text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Privacidad
              </Link>
              <Link
                href="/terminos"
                className="font-serif text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Terminos
              </Link>
              <Link
                href="/contact"
                className="font-serif text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                Ayuda
              </Link>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
