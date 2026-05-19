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

/** Shop sub-links for Tienda dropdown, mobile menu, and footer */
export const shopNavChildren: NavLink[] = [
  { label: 'Ver todo', href: routes.shop },
  { label: 'Filipinas', href: routes.chefJackets },
  { label: 'Mandiles', href: routes.aprons },
  { label: 'Pantalones', href: routes.pants },
]

/** Primary storefront header navigation */
export const publicNavItems: NavEntry[] = [
  { label: 'Inicio', href: routes.home },
  { label: 'Tienda', href: routes.shop, children: shopNavChildren },
  { label: 'Personaliza', href: routes.customize },
  { label: 'Restaurantes', href: routes.restaurants },
  { label: 'Guía de tallas', href: routes.sizeGuide },
  { label: 'Contacto', href: routes.contact },
]

/** Flattened links for mobile menu (includes shop children) */
export const mobileNavLinks: NavLink[] = publicNavItems.flatMap((entry) => {
  if (isNavGroup(entry)) {
    return [
      { label: entry.label, href: entry.href },
      ...entry.children.filter((child) => child.href !== entry.href),
    ]
  }
  return [entry]
})

export const ctaNav = {
  label: 'Diseña tu uniforme',
  href: routes.customize,
} as const

export const authNav = {
  login: { label: 'Iniciar Sesión', href: routes.login },
  register: { label: 'Registro', href: routes.register },
} as const

export const accountNav = {
  profile: { label: 'Mi Perfil', href: routes.account },
  orders: { label: 'Mis Pedidos', href: `${routes.account}/orders` },
  designs: { label: 'Diseños Guardados', href: `${routes.account}/designs` },
  addresses: { label: 'Direcciones', href: `${routes.account}/addresses` },
} as const

/** Footer product column — reuses shop categories */
export const footerProductLinks: NavLink[] = [
  ...shopNavChildren.filter((link) => link.href !== routes.shop),
  { label: 'Personalización', href: routes.customize },
]

export const footerCompanyLinks: NavLink[] = [
  { label: 'Restaurantes', href: routes.restaurants },
  { label: 'Contacto', href: routes.contact },
  { label: 'Guía de tallas', href: routes.sizeGuide },
]
