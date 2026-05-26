'use client'

import type { ReactNode } from 'react'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LogOut,
  MapPin,
  Menu,
  Package,
  Palette,
  User,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { accountNav } from '@/src/config/navigation.storefront'

const accountNavItems = [
  {
    href: accountNav.profile.href,
    label: accountNav.profile.label,
    icon: User,
    description: 'Datos personales y preferencias',
  },
  {
    href: accountNav.orders.href,
    label: accountNav.orders.label,
    icon: Package,
    description: 'Historial y seguimiento',
  },
  {
    href: accountNav.designs.href,
    label: accountNav.designs.label,
    icon: Palette,
    description: 'Personalizaciones guardadas',
  },
  {
    href: accountNav.addresses.href,
    label: accountNav.addresses.label,
    icon: MapPin,
    description: 'Direcciones de envío',
  },
]

interface AccountSidebarProps {
  className?: string
  onNavigate?: () => void
}

function AccountSidebar({ className, onNavigate }: AccountSidebarProps) {
  const pathname = usePathname()

  return (
    <nav className={cn('flex flex-col gap-1', className)}>
      {accountNavItems.map((item) => {
        const isActive = pathname === item.href
        const Icon = item.icon

        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={onNavigate}
            className={cn(
              'group flex items-center gap-3 rounded-lg px-3 py-3 transition-colors',
              isActive
                ? 'bg-primary/10 text-primary'
                : 'text-muted-foreground hover:bg-secondary hover:text-foreground'
            )}
          >
            <Icon className={cn('h-5 w-5 flex-shrink-0', isActive && 'text-primary')} />
            <div className="min-w-0 flex-1">
              <p className={cn('truncate font-sans text-sm font-medium', isActive && 'text-primary')}>
                {item.label}
              </p>
              <p className="truncate font-serif text-xs text-muted-foreground">{item.description}</p>
            </div>
          </Link>
        )
      })}

      <button
        type="button"
        onClick={() => {
          onNavigate?.()
          // TODO: Implement logout with auth integration
          console.log('Logout clicked')
        }}
        className="group mt-4 flex items-center gap-3 rounded-lg border-t border-border px-3 py-3 pt-4 text-muted-foreground transition-colors hover:bg-destructive/10 hover:text-destructive"
      >
        <LogOut className="h-5 w-5 flex-shrink-0" />
        <span className="font-sans text-sm font-medium">Cerrar sesión</span>
      </button>
    </nav>
  )
}

interface AccountLayoutProps {
  children: ReactNode
  title?: string
  description?: string
  cartItemCount?: number
  userName?: string
}

export function AccountLayout({
  children,
  title,
  description,
  cartItemCount = 0,
  userName = 'Usuario',
}: AccountLayoutProps) {
  const [mobileNavOpen, setMobileNavOpen] = useState(false)

  return (
    <div className="flex flex-col">
      <div className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="mb-4 flex items-center justify-between gap-4 md:mb-8">
            {title && (
              <div className="hidden md:block">
                <h1 className="font-sans text-2xl font-bold text-foreground">{title}</h1>
                {description && (
                  <p className="mt-1 font-serif text-muted-foreground">{description}</p>
                )}
              </div>
            )}

            <Sheet open={mobileNavOpen} onOpenChange={setMobileNavOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" className="md:hidden">
                  <Menu className="mr-2 h-4 w-4" />
                  Men? de cuenta
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-80">
                <SheetHeader>
                  <SheetTitle className="text-left font-sans">Mi Cuenta</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <AccountSidebar onNavigate={() => setMobileNavOpen(false)} />
                </div>
              </SheetContent>
            </Sheet>
          </div>

          <div className="flex gap-8">
            <aside className="hidden w-64 flex-shrink-0 md:block">
              <div className="sticky top-24">
                <div className="mb-6 rounded-lg border border-border bg-card p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-lg font-semibold text-primary-foreground">
                      {userName.charAt(0).toUpperCase()}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-sans text-sm font-semibold text-foreground">
                        {userName}
                      </p>
                      <p className="font-serif text-xs text-muted-foreground">Cliente Premium</p>
                    </div>
                  </div>
                </div>
                <AccountSidebar />
              </div>
            </aside>

            <main className="min-w-0 flex-1">
              {title && (
                <div className="mb-6 md:hidden">
                  <h1 className="font-sans text-xl font-bold text-foreground">{title}</h1>
                  {description && (
                    <p className="mt-1 font-serif text-sm text-muted-foreground">{description}</p>
                  )}
                </div>
              )}
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}
