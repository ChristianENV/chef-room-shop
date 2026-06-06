type RouteQueryValue = string | number | boolean | null | undefined

function appendQuery(path: string, params: Record<string, RouteQueryValue>): string {
  const search = new URLSearchParams()
  for (const [key, value] of Object.entries(params)) {
    if (value === null || value === undefined || value === '') continue
    search.set(key, String(value))
  }
  const query = search.toString()
  return query ? `${path}?${query}` : path
}

export const routes = {
  home: '/',
  shop: '/shop',
  chefJackets: '/shop/chef-jackets',
  aprons: '/shop/aprons',
  pants: '/shop/pants',
  customize: '/customize',
  customizeProduct: (slug: string) => `/customize/${slug}`,
  products: '/products',
  productDetail: (slug: string) => `/products/${slug}`,
  cart: '/cart',
  checkout: '/checkout',
  checkoutSuccess: '/checkout/success',
  login: '/login',
  register: '/register',
  verifyEmail: '/verify-email',
  account: '/account',
  claimOrder: '/claim-order',
  accountOrderDetail: (orderNumber: string) => `/account/orders/${orderNumber}`,
  restaurants: '/restaurants',
  sizeGuide: '/size-guide',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',

  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminProducts: '/admin/products',
  adminOrders: '/admin/orders',
  adminOrderDetail: (orderNumber: string) =>
    `/admin/orders/${encodeURIComponent(orderNumber)}`,
  adminCustomization: '/admin/customization',
  adminDesigns: '/admin/designs',
  adminUsers: '/admin/users',
  adminPayments: '/admin/payments',
  adminShipping: '/admin/shipping',
  adminAnalytics: '/admin/analytics',
  adminSettings: '/admin/settings',
} as const

/** Conekta return URL with checkout token. */
export function checkoutSuccess(params?: { token?: string; from?: string; payment?: string }) {
  return appendQuery(routes.checkoutSuccess, {
    token: params?.token,
    from: params?.from,
    payment: params?.payment,
  })
}

/** Guest post-purchase callback preserved through login/register. */
export function purchaseCallbackByToken(token: string) {
  return checkoutSuccess({ token: token.trim(), from: 'purchase' })
}

/** Account order detail with optional checkout origin marker. */
export function accountOrderDetail(
  orderNumber: string,
  options?: { from?: 'checkout' },
) {
  return appendQuery(routes.accountOrderDetail(orderNumber), {
    from: options?.from,
  })
}

export function login(options?: { callbackUrl?: string }) {
  return appendQuery(routes.login, { callbackUrl: options?.callbackUrl })
}

export function register(options?: { callbackUrl?: string }) {
  return appendQuery(routes.register, { callbackUrl: options?.callbackUrl })
}

export function verifyEmail(options?: { callbackUrl?: string }) {
  return appendQuery(routes.verifyEmail, { callbackUrl: options?.callbackUrl })
}

export type RoutePath = (typeof routes)[keyof typeof routes]

export type { ShopCategorySlug } from './shop-category'

/** Storefront shop filter: `/shop?category=filipinas|mandiles|pantalones`. */
export function shopCategoryUrl(category: import('./shop-category').ShopCategorySlug): string {
  return `${routes.shop}?category=${encodeURIComponent(category)}`
}

/** Alias for shop catalog links with category filter. */
export function shopWithCategory(category: import('./shop-category').ShopCategorySlug): string {
  return shopCategoryUrl(category)
}
