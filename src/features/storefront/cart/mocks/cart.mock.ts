import type { CartPageState, CartPreview, CartPreviewItem } from '@/src/types/cart'
import { buildCartPageState, buildCartPreview } from '@/src/features/storefront/cart/lib/cart-utils'

/** Empty cart preview for popover and page empty states. */
export const EMPTY_CART_PREVIEW: CartPreview = {
  items: [],
  subtotal: 0,
  customizationTotal: 0,
  optionTotal: 0,
  totalItems: 0,
}

const MOCK_CART_PREVIEW_ITEMS: CartPreviewItem[] = [
  {
    id: 'preview-1',
    productId: '1',
    productSlug: 'filipina-executive-blanca',
    productName: 'Filipina Executive Blanca',
    category: 'filipina',
    imageUrl: '/products/filipina-executive-white.jpg',
    size: 'L',
    colorName: 'Blanco',
    colorHex: '#FFFFFF',
    quantity: 1,
    unitPrice: 1299,
    customizationPrice: 398,
    commercialOptionsSnapshot: [],
    isCustomized: true,
    designId: 'DSN-K7M2P9',
    customizationSummary: {
      hasLogo: true,
      hasEmbroidery: true,
      embroideredName: 'Chef Carlos',
      areas: ['Pecho izquierdo', 'Manga'],
    },
  },
  {
    id: 'preview-2',
    productId: '2',
    productSlug: 'mandil-profesional-chef',
    productName: 'Mandil Profesional Chef',
    category: 'mandil',
    imageUrl: '/products/mandil-profesional.jpg',
    size: 'Unitalla',
    colorName: 'Azul Marino',
    colorHex: '#0B1026',
    quantity: 1,
    unitPrice: 599,
    commercialOptionsSnapshot: [],
    isCustomized: false,
  },
]

/** Sample cart with one customized filipina and one plain mandil (popover + navbar). */
export const MOCK_CART_PREVIEW: CartPreview = buildCartPreview(MOCK_CART_PREVIEW_ITEMS)

/** Default cart page state derived from the same mock line items as the popover. */
export const MOCK_CART_PAGE: CartPageState = buildCartPageState(MOCK_CART_PREVIEW_ITEMS)

// TODO: Reemplazar por useCartQuery cuando TanStack Query esté conectado.
// TODO: Conectar updateQuantity/removeItem con mutations reales.
// TODO: Conectar previews reales del customizador.
// TODO: Tomar subtotal, envío y total desde backend.
