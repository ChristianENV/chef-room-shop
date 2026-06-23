'use client'

import { Suspense, useState, type ReactNode } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { ChevronDown, Menu, ShoppingBag, User, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { UserAvatar } from '@/components/shared/user-avatar'
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from '@/components/ui/sheet'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { ChefRoomLogo } from '@/components/brand/chef-room-logo'
import { ThemeToggle } from '@/components/shared/theme-toggle'
import {
  EMPTY_SEARCH_PARAMS,
  isShopNavHrefActive,
  type SearchParamsLike,
} from '@/src/config/shop-category'
import { routes } from '@/src/config/routes'
import { CartPopover } from '@/src/features/storefront/cart/components/cart-popover'
import { useCartBadgeCount } from '@/src/features/storefront/cart/api/use-my-cart-query'
import {
  authNav,
  accountNav,
  ctaNav,
  isNavGroup,
  mobileNavMainLinks,
  mobileShopGroup,
  publicNavItems,
  shopCatalogNavLink,
  shopDropdownChildren,
  type NavLink,
} from '@/src/config/navigation.storefront'
import { getUserDisplayName, type UserDisplayInput } from '@/src/lib/user/user-display'
import { CustomerTierBadge } from '@/src/features/storefront/account/components/customer-tier-badge'
import { NotificationPopover } from '@/src/features/notifications/components/notification-popover'

const NAVBAR_SURFACE =
  'border-b border-white/[0.08] bg-[#121421]/95 text-white shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl'

const NAV_LINK =
  'rounded-md px-3 py-2 font-sans text-[13px] font-medium tracking-wide text-white/70 transition-colors hover:bg-white/[0.06] hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30'

const NAV_LINK_ACTIVE = 'bg-white/[0.08] text-white'

const ICON_BTN =
  'h-9 w-9 text-white/80 hover:bg-white/[0.08] hover:text-white focus-visible:ring-white/30'

const DROPDOWN_PANEL = 'border border-white/10 bg-[#181B36] text-white shadow-xl shadow-black/30'

function CartBadge({ count }: { count: number }) {
  if (count === 0) return null
  return (
    <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-[#5A6FDD] px-0.5 text-[10px] font-bold text-white">
      {count > 99 ? '99+' : count}
    </span>
  )
}

function isLinkActive(pathname: string, href: string) {
  if (href === routes.home) return pathname === routes.home
  return pathname === href || pathname.startsWith(`${href}/`)
}

function AccountMenu({
  isLoggedIn = false,
  isAdmin = false,
  onSignOut,
  user,
  customerTier,
  triggerClassName,
}: {
  isLoggedIn?: boolean
  isAdmin?: boolean
  onSignOut?: () => void | Promise<void>
  user?: UserDisplayInput | null
  customerTier?: string | null
  triggerClassName?: string
}) {
  const accountLabel = isLoggedIn && user ? getUserDisplayName(user) : 'Mi cuenta'

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn(ICON_BTN, isLoggedIn && user && 'rounded-full p-0', triggerClassName)}
          aria-label={accountLabel}
          data-testid="storefront-account-link"
        >
          {isLoggedIn && user ? (
            <UserAvatar
              user={user}
              size="sm"
              decorative
              className="ring-1 ring-white/20 hover:ring-white/40"
            />
          ) : (
            <User className="size-4" />
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className={cn('w-52', DROPDOWN_PANEL)}>
        {isLoggedIn ? (
          <>
            <div className="border-b border-white/10 px-2 py-2">
              <p className="truncate text-sm font-medium text-white">
                {user ? getUserDisplayName(user) : 'Mi cuenta'}
              </p>
              <CustomerTierBadge customerTier={customerTier} className="mt-1" />
            </div>
            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
              <Link href={routes.account}>Mi perfil</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
              <Link href={routes.accountNotifications}>Notificaciones</Link>
            </DropdownMenuItem>
            {isAdmin && (
              <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                <Link href={routes.adminDashboard}>Panel admin</Link>
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              className="text-red-300 focus:bg-red-500/15 focus:text-red-200"
              onClick={() => {
                void onSignOut?.()
              }}
            >
              Cerrar sesión
            </DropdownMenuItem>
          </>
        ) : (
          <>
            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
              <Link href={authNav.login.href}>{authNav.login.label}</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
              <Link href={authNav.register.href}>{authNav.register.label}</Link>
            </DropdownMenuItem>
          </>
        )}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

function DesktopNavLink({
  link,
  pathname,
  testId,
}: {
  link: NavLink
  pathname: string
  testId?: string
}) {
  const active = isLinkActive(pathname, link.href)
  return (
    <Link
      href={link.href}
      className={cn(NAV_LINK, active && NAV_LINK_ACTIVE)}
      aria-current={active ? 'page' : undefined}
      data-testid={testId}
    >
      {link.label}
    </Link>
  )
}

function MobileNavLink({
  link,
  pathname,
  searchParams,
  onNavigate,
  testId,
  nested = false,
}: {
  link: NavLink
  pathname: string
  searchParams: SearchParamsLike
  onNavigate: () => void
  testId?: string
  nested?: boolean
}) {
  const active = link.href.startsWith(routes.shop)
    ? isShopNavHrefActive(pathname, searchParams, link.href)
    : isLinkActive(pathname, link.href)
  return (
    <Link
      href={link.href}
      onClick={onNavigate}
      data-testid={testId ?? link.testId}
      className={cn(
        'block rounded-xl px-4 py-3 font-sans text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30',
        nested
          ? 'text-white/65 hover:bg-white/[0.05] hover:text-white'
          : 'text-white hover:bg-white/[0.06]',
        active && 'bg-white/[0.08] text-white',
      )}
    >
      {link.label}
    </Link>
  )
}

function MobileMenuSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="px-4 font-sans text-[10px] font-semibold tracking-[0.22em] uppercase text-white/40">
        {title}
      </p>
      <div className="space-y-1">{children}</div>
    </div>
  )
}

export interface PublicHeaderProps {
  isLoggedIn?: boolean
  user?: UserDisplayInput | null
  isAdmin?: boolean
  customerTier?: string | null
  onSignOut?: () => void | Promise<void>
}

type PublicHeaderInnerProps = PublicHeaderProps & {
  searchParams: SearchParamsLike
}

function PublicHeaderInner({
  isLoggedIn = false,
  user,
  isAdmin = false,
  customerTier = null,
  onSignOut,
  searchParams,
}: PublicHeaderInnerProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()
  const cartBadgeCount = useCartBadgeCount()

  const closeMobileMenu = () => setMobileMenuOpen(false)

  const shopActive =
    pathname === routes.shop ||
    isShopNavHrefActive(pathname, searchParams, shopCatalogNavLink.href) ||
    shopDropdownChildren.some((child) => isShopNavHrefActive(pathname, searchParams, child.href))

  return (
    <header
      className={cn('sticky top-0 z-50 w-full', NAVBAR_SURFACE)}
      data-testid="storefront-navbar"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between gap-3 md:h-[4.25rem]">
          <Link
            href={routes.home}
            className="shrink-0 transition-opacity hover:opacity-90 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/30 focus-visible:ring-offset-2 focus-visible:ring-offset-[#121421]"
            data-testid="storefront-logo-link"
          >
            <ChefRoomLogo variant="horizontal" colorScheme="light" size="md" priority />
          </Link>

          <nav className="hidden items-center gap-0.5 lg:flex" aria-label="Navegación principal">
            <DropdownMenu>
              <DropdownMenuTrigger
                className={cn(
                  NAV_LINK,
                  'inline-flex items-center gap-1 outline-none',
                  shopActive && NAV_LINK_ACTIVE,
                )}
                data-testid="storefront-nav-shop"
              >
                Tienda
                <ChevronDown className="size-3.5 opacity-70" aria-hidden />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className={cn('w-52', DROPDOWN_PANEL)}>
                <DropdownMenuItem asChild className="focus:bg-white/10 focus:text-white">
                  <Link href={shopCatalogNavLink.href} data-testid={shopCatalogNavLink.testId}>
                    {shopCatalogNavLink.label}
                  </Link>
                </DropdownMenuItem>
                {shopDropdownChildren.map((child) => (
                  <DropdownMenuItem
                    key={child.href}
                    asChild
                    className="focus:bg-white/10 focus:text-white"
                  >
                    <Link href={child.href} data-testid={child.testId}>
                      {child.label}
                    </Link>
                  </DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>

            {publicNavItems
              .filter((entry) => !isNavGroup(entry))
              .map((entry) => {
                const testId =
                  entry.href === routes.customize
                    ? 'storefront-nav-customize'
                    : entry.href === routes.restaurants
                      ? 'storefront-nav-business'
                      : entry.href === routes.sizeGuide
                        ? 'storefront-nav-sizes'
                        : entry.href === routes.contact
                          ? 'storefront-nav-contact'
                          : undefined

                return (
                  <DesktopNavLink
                    key={entry.href}
                    link={entry}
                    pathname={pathname}
                    testId={testId}
                  />
                )
              })}
          </nav>

          <div className="hidden items-center gap-1 lg:flex">
            <div className="mr-1 flex items-center gap-0.5 border-r border-white/10 pr-2">
              <ThemeToggle className={ICON_BTN} data-testid="storefront-theme-toggle" />
              <NotificationPopover isLoggedIn={isLoggedIn} triggerClassName={ICON_BTN} />
              <AccountMenu
                isLoggedIn={isLoggedIn}
                isAdmin={isAdmin}
                onSignOut={onSignOut}
                user={user}
                customerTier={customerTier}
              />
              <CartPopover triggerClassName={ICON_BTN} triggerTestId="storefront-cart-link" />
            </div>

            <Button
              className="h-9 rounded-full bg-[#5A6FDD] px-5 font-sans text-[13px] font-semibold tracking-wide text-white shadow-lg shadow-[#2B3280]/30 transition hover:bg-[#6B7AE0]"
              asChild
            >
              <Link href={ctaNav.href} data-testid="storefront-design-cta">
                {ctaNav.label}
              </Link>
            </Button>
          </div>

          <div className="flex items-center gap-0.5 lg:hidden">
            <ThemeToggle className={ICON_BTN} data-testid="storefront-theme-toggle" />

            <Button variant="ghost" size="icon" className={cn('relative', ICON_BTN)} asChild>
              <Link href={routes.cart} data-testid="storefront-cart-link">
                <ShoppingBag className="size-4" />
                <CartBadge count={cartBadgeCount} />
                <span className="sr-only">Carrito</span>
              </Link>
            </Button>

            <AccountMenu
              isLoggedIn={isLoggedIn}
              isAdmin={isAdmin}
              onSignOut={onSignOut}
              user={user}
              customerTier={customerTier}
            />

            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className={ICON_BTN}
                  aria-label="Abrir menú"
                  data-testid="storefront-mobile-menu-button"
                >
                  <Menu className="size-5" />
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="flex w-full max-w-sm flex-col border-l border-white/10 bg-[#121421] p-0 text-white sm:max-w-md"
                data-testid="storefront-mobile-menu"
              >
                <SheetTitle className="sr-only">Menú de navegación</SheetTitle>

                <div className="flex items-center justify-between border-b border-white/10 px-5 py-4">
                  <Link href={routes.home} onClick={closeMobileMenu}>
                    <ChefRoomLogo variant="horizontal" colorScheme="light" size="sm" />
                  </Link>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className={ICON_BTN}
                    onClick={closeMobileMenu}
                    aria-label="Cerrar menú"
                  >
                    <X className="size-5" />
                  </Button>
                </div>

                <div className="px-5 pt-5">
                  <Button
                    className="h-12 w-full rounded-full bg-[#5A6FDD] font-sans text-sm font-semibold tracking-wide text-white shadow-lg hover:bg-[#6B7AE0]"
                    asChild
                  >
                    <Link
                      href={ctaNav.href}
                      onClick={closeMobileMenu}
                      data-testid="storefront-mobile-design-cta"
                    >
                      {ctaNav.label}
                    </Link>
                  </Button>
                </div>

                <div className="flex-1 overflow-y-auto px-3 py-6">
                  <MobileMenuSection title="Navegación">
                    <MobileNavLink
                      link={{ label: 'Inicio', href: routes.home }}
                      pathname={pathname}
                      searchParams={searchParams}
                      onNavigate={closeMobileMenu}
                    />

                    <Accordion type="single" collapsible className="border-none">
                      <AccordionItem value="tienda" className="border-none">
                        <AccordionTrigger
                          className={cn(
                            'rounded-xl px-4 py-3 font-sans text-sm font-medium text-white hover:bg-white/[0.06] hover:no-underline [&>svg]:text-white/60',
                            shopActive && 'bg-white/[0.08]',
                          )}
                          data-testid="storefront-nav-shop"
                        >
                          {mobileShopGroup.label}
                        </AccordionTrigger>
                        <AccordionContent className="space-y-0.5 pb-2 pl-2">
                          <MobileNavLink
                            link={shopCatalogNavLink}
                            pathname={pathname}
                            searchParams={searchParams}
                            onNavigate={closeMobileMenu}
                            nested
                          />
                          {shopDropdownChildren.map((child) => (
                            <MobileNavLink
                              key={child.href}
                              link={child}
                              pathname={pathname}
                              searchParams={searchParams}
                              onNavigate={closeMobileMenu}
                              nested
                            />
                          ))}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>

                    {mobileNavMainLinks
                      .filter((link) => link.href !== routes.home)
                      .map((link) => {
                        const testId =
                          link.href === routes.customize
                            ? 'storefront-nav-customize'
                            : link.href === routes.restaurants
                              ? 'storefront-nav-business'
                              : link.href === routes.sizeGuide
                                ? 'storefront-nav-sizes'
                                : link.href === routes.contact
                                  ? 'storefront-nav-contact'
                                  : undefined

                        return (
                          <MobileNavLink
                            key={link.href}
                            link={link}
                            pathname={pathname}
                            searchParams={searchParams}
                            onNavigate={closeMobileMenu}
                            testId={testId}
                          />
                        )
                      })}
                  </MobileMenuSection>

                  <div className="mt-8">
                    <MobileMenuSection title="Cuenta">
                      {isLoggedIn ? (
                        <>
                          <Link
                            href={routes.account}
                            onClick={closeMobileMenu}
                            className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-white/[0.06]"
                          >
                            <UserAvatar user={user} size="md" />
                            <span className="font-sans text-sm font-medium">
                              {user ? getUserDisplayName(user) : 'Mi cuenta'}
                            </span>
                          </Link>
                          <MobileNavLink
                            link={accountNav.notifications}
                            pathname={pathname}
                            searchParams={searchParams}
                            onNavigate={closeMobileMenu}
                          />
                          {isAdmin && (
                            <MobileNavLink
                              link={{ label: 'Panel admin', href: routes.adminDashboard }}
                              pathname={pathname}
                              searchParams={searchParams}
                              onNavigate={closeMobileMenu}
                            />
                          )}
                          <button
                            type="button"
                            onClick={() => {
                              void onSignOut?.()
                              closeMobileMenu()
                            }}
                            className="w-full rounded-xl px-4 py-3 text-left font-sans text-sm font-medium text-red-300 transition-colors hover:bg-red-500/10"
                          >
                            Cerrar sesión
                          </button>
                        </>
                      ) : (
                        <>
                          <MobileNavLink
                            link={authNav.login}
                            pathname={pathname}
                            searchParams={searchParams}
                            onNavigate={closeMobileMenu}
                          />
                          <MobileNavLink
                            link={authNav.register}
                            pathname={pathname}
                            searchParams={searchParams}
                            onNavigate={closeMobileMenu}
                          />
                        </>
                      )}
                    </MobileMenuSection>
                  </div>

                  <div className="mt-8">
                    <MobileMenuSection title="Preferencias">
                      <div className="px-2">
                        <ThemeToggle
                          showLabel
                          variant="outline"
                          className="w-full justify-start gap-2 border-white/15 bg-white/[0.04] text-white hover:bg-white/[0.08] hover:text-white"
                        />
                      </div>
                    </MobileMenuSection>
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

function PublicHeaderWithSearchParams(props: PublicHeaderProps) {
  const searchParams = useSearchParams()
  return <PublicHeaderInner {...props} searchParams={searchParams} />
}

export function PublicHeader(props: PublicHeaderProps) {
  return (
    <Suspense fallback={<PublicHeaderInner {...props} searchParams={EMPTY_SEARCH_PARAMS} />}>
      <PublicHeaderWithSearchParams {...props} />
    </Suspense>
  )
}
