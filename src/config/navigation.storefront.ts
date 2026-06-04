import { routes } from '@/src/config/routes'

export type NavLink = {
  label: string
  href: string
}

export type NavGroup = {
  label: string
  href: string
  children: NavLink[]
}

export type NavEntry = NavLink | NavGroup

export function isNavGroup(entry: NavEntry): entry is NavGroup {
  return 'children' in entry
}

/** Shop categories for navbar dropdown and mobile accordion */
export const shopDropdownChildren: NavLink[] = [
  { label: 'Filipinas', href: routes.chefJackets },
  { label: 'Mandiles', href: routes.aprons },
  { label: 'Pantalones', href: routes.pants },
]

/** Shop links for footer (includes catalog root) */
export const shopNavChildren: NavLink[] = [
  { label: 'Ver todo', href: routes.shop },
  ...shopDropdownChildren,
]

/** Desktop header — logo is home; no "Inicio" link */
export const publicNavItems: NavEntry[] = [
  { label: 'Tienda', href: routes.shop, children: shopDropdownChildren },
  { label: 'Personalizar', href: routes.customize },
  { label: 'Empresas', href: routes.restaurants },
  { label: 'Tallas', href: routes.sizeGuide },
  { label: 'Contacto', href: routes.contact },
]

export const mobileShopGroup: NavGroup = {
  label: 'Tienda',
  href: routes.shop,
  children: shopDropdownChildren,
}

/** Mobile primary navigation (includes Inicio) */
export const mobileNavMainLinks: NavLink[] = [
  { label: 'Inicio', href: routes.home },
  { label: 'Personalizar', href: routes.customize },
  { label: 'Empresas', href: routes.restaurants },
  { label: 'Tallas', href: routes.sizeGuide },
  { label: 'Contacto', href: routes.contact },
]

/** @deprecated Use mobileNavMainLinks + mobileShopGroup — kept for any legacy imports */
export const mobileNavLinks: NavLink[] = [
  { label: 'Inicio', href: routes.home },
  { label: 'Tienda', href: routes.shop },
  ...shopDropdownChildren,
  ...mobileNavMainLinks.filter((link) => link.href !== routes.home),
]

export const ctaNav = {
  label: 'Diseñar ahora',
  href: routes.customize,
} as const

export const authNav = {
  login: { label: 'Iniciar sesión', href: routes.login },
  register: { label: 'Crear cuenta', href: routes.register },
} as const

export const accountNav = {
  profile: { label: 'Mi perfil', href: routes.account },
  orders: { label: 'Mis pedidos', href: `${routes.account}/orders` },
  designs: { label: 'Diseños guardados', href: `${routes.account}/designs` },
  addresses: { label: 'Direcciones', href: `${routes.account}/addresses` },
} as const

export const accountNavLinks: NavLink[] = [
  accountNav.profile,
  accountNav.orders,
  accountNav.designs,
  accountNav.addresses,
]

export const footerProductLinks: NavLink[] = [
  ...shopNavChildren.filter((link) => link.href !== routes.shop),
  { label: 'Personalización', href: routes.customize },
]

export const footerCompanyLinks: NavLink[] = [
  { label: 'Empresas', href: routes.restaurants },
  { label: 'Contacto', href: routes.contact },
  { label: 'Tallas', href: routes.sizeGuide },
]
