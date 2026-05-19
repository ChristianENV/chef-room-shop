import type { CartPreview } from '@/src/types/cart'

/** Empty cart preview for popover empty state. */
export const EMPTY_CART_PREVIEW: CartPreview = {
  items: [],
  subtotal: 0,
  customizationTotal: 0,
  totalItems: 0,
}

/** Sample cart with one customized filipina and one plain mandil. */
export const MOCK_CART_PREVIEW: CartPreview = {
  items: [
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
      isCustomized: false,
    },
  ],
  subtotal: 1898,
  customizationTotal: 398,
  totalItems: 2,
}
