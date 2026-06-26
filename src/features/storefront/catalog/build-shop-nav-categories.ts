import {
  getProductTypeDisplayName,
  getProductTypePublicSlug,
  getNavProductTypes,
  type StorefrontProductType,
} from '@/src/features/storefront/catalog/product-type.helpers'
import { shopCategoryUrl } from '@/src/config/routes'
import type { NavLink } from '@/src/config/navigation.storefront'

/**
 * Builds storefront shop nav links from active ProductTypes with showInNav.
 */
export function buildShopNavCategories(productTypes: StorefrontProductType[]): NavLink[] {
  return getNavProductTypes(productTypes).map((type) => {
    const publicSlug = getProductTypePublicSlug(type)
    return {
      label: getProductTypeDisplayName(type),
      href: shopCategoryUrl(publicSlug),
      testId: `storefront-nav-shop-${publicSlug}`,
    }
  })
}
