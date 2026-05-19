'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronDown, Menu, ShoppingBag, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'
import { ThemeToggle } from '@/components/theme-toggle'
import { routes } from '@/src/config/routes'
import {
  accountNav,
  authNav,
  ctaNav,
  isNavGroup,
  mobileNavLinks,
  publicNavItems,
  type NavLink,
} from '@/src/config/navigation'

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-primary text-[10px] font-bold text-primary-foreground">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function navLinkClassName(isActive: boolean) {
  return cn(
    'relative px-4 py-2 font-sans text-[13px] font-medium tracking-wide uppercase transition-colors',
    isActive ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'
  )
}

function mobileLinkClassName(isActive: boolean, isChild = false) {
  return cn(
    'rounded-lg px-4 py-3 font-sans text-sm font-medium tracking-wide transition-colors',
    isChild && 'pl-8 text-muted-foreground',
    isActive ? 'bg-accent text-foreground' : 'text-foreground hover:bg-accent'
  )
}

function isLinkActive(pathname: string, href: string) {
  if (href === routes.home) return pathname === routes.home
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AccountMenu({ isLoggedIn = false, userName }: { isLoggedIn?: boolean; userName?: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-9 w-9">
          <User className="h-4 w-4" />
          <span className="sr-only">Mi cuenta</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-48">
        {isLoggedIn ? (
          <>
            <div className="px-3 py-2">
              <p className="font-sans text-sm font-medium">{userName}</p>
            </div>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <Link href={accountNav.profile.href}>{accountNav.profile.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={accountNav.orders.href}>{accountNav.orders.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={accountNav.designs.href}>{accountNav.designs.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={accountNav.addresses.href}>{accountNav.addresses.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem className="text-destructive">Cerrar Sesión</DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild>
              <Link href={authNav.login.href}>{authNav.login.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link href={authNav.register.href}>Crear Cuenta</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNavLink({ link, pathname }: { link: NavLink; pathname: string }) {
  return (
    <Link
      href={link.href}
      className={navLinkClassName(isLinkActive(pathname, link.href))}
      aria-current={isLinkActive(pathname, link.href) ? 'page' : undefined}
    >
      {link.label}
    </Link>
  )
}

interface PublicHeaderProps {
  cartItemCount?: number
  isLoggedIn?: boolean
  userName?: string
}

export function PublicHeader({
  cartItemCount = 0,
  isLoggedIn = false,
  userName,
}: PublicHeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/80 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href={routes.home}
            className="flex-shrink-0 transition-opacity hover:opacity-80"
          >
            <ChefRoomLogo variant="horizontal" colorScheme="auto" size="md" />
          </Link>

          <nav className="hidden items-center gap-1 lg:flex" aria-label="Principal">
            {publicNavItems.map((entry) => {
              if (isNavGroup(entry)) {
                const shopActive =
                  isLinkActive(pathname, entry.href) ||
                  entry.children.some((child) => isLinkActive(pathname, child.href))

                return (
                  <DropdownMenu key={entry.label}>
                    <DropdownMenuTrigger
                      className={cn(
                        navLinkClassName(shopActive),
                        'inline-flex items-center gap-1 outline-none'
                      )}
                    >
                      {entry.label}
                      <ChevronDown className="h-3.5 w-3.5" />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-48">
                      {entry.children.map((child) => (
                        <DropdownMenuItem key={child.href} asChild>
                          <Link href={child.href}>{child.label}</Link>
                        </DropdownMenuItem>
                      ))}
                    </DropdownMenuContent>
                  </DropdownMenu>
                )
              }

              return (
                <DesktopNavLink key={entry.href} link={entry} pathname={pathname} />
              )
            })}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <ThemeToggle />
            <AccountMenu isLoggedIn={isLoggedIn} userName={userName} />

            <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
              <Link href={routes.cart}>
                <ShoppingBag className="h-4 w-4" />
                <CartBadge count={cartItemCount} />
                <span className="sr-only">Carrito ({cartItemCount} productos)</span>
              </Link>
            </Button>

            <div className="ml-3 h-5 w-px bg-border" />

            <Button
              className="ml-3 h-9 rounded-full bg-primary px-6 font-sans text-[13px] font-semibold tracking-wide text-primary-foreground transition-all hover:bg-primary/90 hover:shadow-md"
              asChild
            >
              <Link href={ctaNav.href}>{ctaNav.label}</Link>
            </Button>
          </div>

          <div className="flex items-center gap-1 lg:hidden">
            <Button variant="ghost" size="icon" className="relative h-9 w-9" asChild>
              <Link href={routes.cart}>
                <ShoppingBag className="h-4 w-4" />
                <CartBadge count={cartItemCount} />
                <span className="sr-only">Carrito</span>
              </Link>
            </Button>

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="h-9 w-9">
                  <Menu className="h-4 w-4" />
                  <span className="sr-only">Menú</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 border-l border-border bg-background p-0">
                <SheetHeader className="border-b border-border px-6 py-5">
                  <SheetTitle className="text-left">
                    <ChefRoomLogo variant="horizontal" colorScheme="auto" size="sm" />
                  </SheetTitle>
                </SheetHeader>

                <nav className="flex flex-col px-3 py-4" aria-label="Menú móvil">
                  {mobileNavLinks.map((link) => {
                    const isChild = link.href !== routes.shop && link.href.startsWith('/shop/')
                    return (
                      <Link
                        key={link.href}
                        href={link.href}
                        onClick={closeMobileMenu}
                        className={mobileLinkClassName(isLinkActive(pathname, link.href), isChild)}
                        aria-current={isLinkActive(pathname, link.href) ? 'page' : undefined}
                      >
                        {link.label}
                      </Link>
                    )
                  })}

                  <div className="mt-2 border-t border-border pt-4">
                    <ThemeToggle showLabel variant="outline" className="border-border" />
                  </div>
                </nav>

                <div className="border-t border-border px-6 py-6">
                  <Button
                    className="w-full rounded-full bg-primary font-sans text-sm font-semibold tracking-wide text-primary-foreground hover:bg-primary/90"
                    asChild
                  >
                    <Link href={ctaNav.href} onClick={closeMobileMenu}>
                      {ctaNav.label}
                    </Link>
                  </Button>

                  <div className="mt-4 flex gap-2">
                    <Button variant="outline" className="w-full flex-1 font-sans text-sm" asChild>
                      <Link href={authNav.login.href} onClick={closeMobileMenu}>
                        {authNav.login.label}
                      </Link>
                    </Button>
                    <Button variant="ghost" className="w-full flex-1 font-sans text-sm" asChild>
                      <Link href={authNav.register.href} onClick={closeMobileMenu}>
                        {authNav.register.label}
                      </Link>
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
