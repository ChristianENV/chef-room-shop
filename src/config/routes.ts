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
  forgotPassword: '/forgot-password',
  resetPassword: '/reset-password',
  authSocialComplete: '/auth/social-complete',
  account: '/account',
  accountDesigns: '/account/designs',
  accountNotifications: '/account/notifications',
  claimOrder: '/claim-order',
  claimOrderAuthorize: '/claim-order/authorize',
  accountOrderDetail: (orderNumber: string) => `/account/orders/${orderNumber}`,
  restaurants: '/restaurants',
  sizeGuide: '/size-guide',
  contact: '/contact',
  privacy: '/privacy',
  terms: '/terms',

  adminLogin: '/admin/login',
  adminDashboard: '/admin/dashboard',
  adminProducts: '/admin/products',
  adminCategories: '/admin/categories',
  adminOrders: '/admin/orders',
  adminOrderDetail: (orderNumber: string) => `/admin/orders/${encodeURIComponent(orderNumber)}`,
  adminCustomization: '/admin/customization',
  adminDesigns: '/admin/designs',
  adminUsers: '/admin/users',
  adminPayments: '/admin/payments',
  adminShipping: '/admin/shipping',
  adminAnalytics: '/admin/analytics',
  adminSettings: '/admin/settings',
  adminNotifications: '/admin/notifications',
} as const

/** Conekta return URL with checkout token. */
export function checkoutSuccess(params?: { token?: string; payment?: string }) {
  return appendQuery(routes.checkoutSuccess, {
    token: params?.token,
    payment: params?.payment,
  })
}

/** Post-checkout order detail with checkout context preserved in query params. */
export function accountOrderDetail(
  orderNumber: string,
  options?: { from?: 'checkout'; token?: string },
) {
  return appendQuery(routes.accountOrderDetail(orderNumber), {
    from: options?.from,
    token: options?.token,
  })
}

/** Guest/authenticated return target after checkout Conekta redirect. */
export function postCheckoutOrderDetail(orderNumber: string, token: string) {
  return accountOrderDetail(orderNumber, { from: 'checkout', token: token.trim() })
}

/** @deprecated Use postCheckoutOrderDetail for auth callbacks after purchase. */
export function purchaseCallbackByToken(token: string) {
  return checkoutSuccess({ token: token.trim() })
}

/** Opens the customizer to edit a saved design (supports optional product slug). */
export function customizeEditDesign(designId: string, productSlug?: string | null): string {
  const base = productSlug ? routes.customizeProduct(productSlug) : routes.customize
  return appendQuery(base, { designId })
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

/** Storefront shop filter: `/shop?category=filipinas|mandiles|pantalones|zapatos|...`. */
export function shopCategoryUrl(category: string): string {
  return `${routes.shop}?category=${encodeURIComponent(category)}`
}

/** Alias for shop catalog links with category filter. */
export function shopWithCategory(category: string): string {
  return shopCategoryUrl(category)
}
