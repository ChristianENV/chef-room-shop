export const routes = {
  home: '/',
  shop: '/shop',
  chefJackets: '/shop/chef-jackets',
  aprons: '/shop/aprons',
  pants: '/shop/pants',
  customize: '/customize',
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
  adminCustomization: '/admin/customization',
  adminDesigns: '/admin/designs',
  adminUsers: '/admin/users',
  adminPayments: '/admin/payments',
  adminShipping: '/admin/shipping',
  adminAnalytics: '/admin/analytics',
  adminSettings: '/admin/settings',
} as const

export type RoutePath = (typeof routes)[keyof typeof routes]

/** Storefront shop filter query (English path, Spanish category slug). */
export function shopCategoryUrl(category: string): string {
  return `${routes.shop}?category=${encodeURIComponent(category)}`
}
