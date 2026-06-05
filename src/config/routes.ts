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
