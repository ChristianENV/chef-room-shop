// Chef Room by Bedolla - Mock Data
// This file contains mock data for development. Replace with real API calls.
// TODO: Integrate with TanStack Query and GraphQL when backend is ready

import type { Product } from './types'

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Filipina Executive Blanca',
    slug: 'filipina-executive-blanca',
    category: 'filipinas',
    price: 1299,
    originalPrice: 1599,
    description: 'Filipina profesional de alta calidad con diseno ejecutivo. Confeccionada en tela premium transpirable, perfecta para el chef moderno que busca comodidad y estilo.',
    shortDescription: 'Filipina profesional con diseno ejecutivo premium',
    images: [
      { id: '1', url: '/products/filipina-executive-white.jpg', alt: 'Filipina Executive Blanca - Vista frontal', isPrimary: true },
      { id: '2', url: '/products/filipina-executive-white-back.jpg', alt: 'Filipina Executive Blanca - Vista trasera', isPrimary: false },
    ],
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF', available: true },
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'navy', name: 'Azul Marino', hex: '#0B1026', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    customizable: true,
    badge: 'popular',
    stock: 25,
    rating: 4.8,
    reviewCount: 124,
  },
  {
    id: '2',
    name: 'Mandil Profesional Chef',
    slug: 'mandil-profesional-chef',
    category: 'mandiles',
    price: 599,
    description: 'Mandil de alta durabilidad con bolsillos funcionales. Disenado para el trabajo intenso en cocina profesional.',
    shortDescription: 'Mandil resistente con bolsillos funcionales',
    images: [
      { id: '3', url: '/products/mandil-professional.jpg', alt: 'Mandil Profesional Chef', isPrimary: true },
    ],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'gray', name: 'Gris', hex: '#6B7280', available: true },
      { id: 'navy', name: 'Azul Marino', hex: '#0B1026', available: true },
    ],
    sizes: ['Unitalla'],
    customizable: true,
    badge: 'nuevo',
    stock: 50,
    rating: 4.6,
    reviewCount: 89,
  },
  {
    id: '3',
    name: 'Pantalon Chef Cargo',
    slug: 'pantalon-chef-cargo',
    category: 'pantalones',
    price: 899,
    description: 'Pantalon tipo cargo con multiples bolsillos y cintura elastica para maxima comodidad durante largas jornadas.',
    shortDescription: 'Pantalon cargo comodo con multiples bolsillos',
    images: [
      { id: '4', url: '/products/pantalon-cargo.jpg', alt: 'Pantalon Chef Cargo', isPrimary: true },
    ],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'checkered', name: 'Cuadros', hex: '#333333', available: true },
    ],
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    customizable: false,
    stock: 35,
    rating: 4.5,
    reviewCount: 67,
  },
  {
    id: '4',
    name: 'Filipina Slim Fit Negra',
    slug: 'filipina-slim-fit-negra',
    category: 'filipinas',
    price: 1199,
    description: 'Filipina de corte slim moderno en negro elegante. Ideal para el chef que busca un look contemporaneo y sofisticado.',
    shortDescription: 'Filipina de corte moderno y elegante',
    images: [
      { id: '5', url: '/products/filipina-slim-black.jpg', alt: 'Filipina Slim Fit Negra', isPrimary: true },
    ],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'charcoal', name: 'Carbon', hex: '#374151', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    customizable: true,
    badge: 'personalizable',
    stock: 18,
    rating: 4.9,
    reviewCount: 56,
  },
  {
    id: '5',
    name: 'Filipina Clasica Gris',
    slug: 'filipina-clasica-gris',
    category: 'filipinas',
    price: 999,
    description: 'Filipina clasica en gris profesional. Corte tradicional con acabados de calidad para el chef que valora la elegancia atemporal.',
    shortDescription: 'Filipina clasica con corte tradicional',
    images: [
      { id: '6', url: '/products/filipina-clasica-gris.jpg', alt: 'Filipina Clasica Gris', isPrimary: true },
    ],
    colors: [
      { id: 'gray', name: 'Gris', hex: '#6B7280', available: true },
      { id: 'white', name: 'Blanco', hex: '#FFFFFF', available: true },
    ],
    sizes: ['S', 'M', 'L', 'XL', 'XXL'],
    customizable: true,
    stock: 30,
    rating: 4.7,
    reviewCount: 92,
  },
  {
    id: '6',
    name: 'Mandil Bistro Premium',
    slug: 'mandil-bistro-premium',
    category: 'mandiles',
    price: 749,
    originalPrice: 899,
    description: 'Mandil estilo bistro con diseno europeo. Confeccionado en lona premium con correas ajustables de cuero sintetico.',
    shortDescription: 'Mandil estilo bistro con diseno europeo',
    images: [
      { id: '7', url: '/products/mandil-bistro.jpg', alt: 'Mandil Bistro Premium', isPrimary: true },
    ],
    colors: [
      { id: 'navy', name: 'Azul Marino', hex: '#0B1026', available: true },
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'brown', name: 'Cafe', hex: '#78350F', available: true },
    ],
    sizes: ['Unitalla'],
    customizable: true,
    badge: 'oferta',
    stock: 22,
    rating: 4.8,
    reviewCount: 78,
  },
  {
    id: '7',
    name: 'Pantalon Chef Clasico',
    slug: 'pantalon-chef-clasico',
    category: 'pantalones',
    price: 799,
    description: 'Pantalon clasico de chef con estampado de cuadros tradicional. Cintura elastica y tela transpirable.',
    shortDescription: 'Pantalon clasico con cuadros tradicionales',
    images: [
      { id: '8', url: '/products/pantalon-clasico.jpg', alt: 'Pantalon Chef Clasico', isPrimary: true },
    ],
    colors: [
      { id: 'checkered', name: 'Cuadros', hex: '#333333', available: true },
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
    ],
    sizes: ['28', '30', '32', '34', '36', '38'],
    customizable: false,
    stock: 40,
    rating: 4.4,
    reviewCount: 45,
  },
  {
    id: '8',
    name: 'Filipina Mujer Executive',
    slug: 'filipina-mujer-executive',
    category: 'filipinas',
    price: 1399,
    description: 'Filipina disenada especialmente para mujer con corte entallado y detalles femeninos. Tela premium con acabado suave.',
    shortDescription: 'Filipina con corte femenino y elegante',
    images: [
      { id: '9', url: '/products/filipina-mujer.jpg', alt: 'Filipina Mujer Executive', isPrimary: true },
    ],
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF', available: true },
      { id: 'pink', name: 'Rosa', hex: '#EC4899', available: true },
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
    ],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    customizable: true,
    badge: 'nuevo',
    stock: 15,
    rating: 4.9,
    reviewCount: 34,
  },
]

// Simulates API fetch with optional delay
// TODO: Replace with TanStack Query useQuery hook
export async function fetchProducts(options?: { delay?: number }): Promise<Product[]> {
  const delay = options?.delay ?? 500
  await new Promise(resolve => setTimeout(resolve, delay))
  return MOCK_PRODUCTS
}

export async function fetchProductBySlug(slug: string, options?: { delay?: number }): Promise<Product | null> {
  const delay = options?.delay ?? 300
  await new Promise(resolve => setTimeout(resolve, delay))
  return MOCK_PRODUCTS.find(p => p.slug === slug) ?? null
}

export async function fetchProductsByCategory(category: string, options?: { delay?: number }): Promise<Product[]> {
  const delay = options?.delay ?? 400
  await new Promise(resolve => setTimeout(resolve, delay))
  return MOCK_PRODUCTS.filter(p => p.category === category)
}

// Mock function for future Cloudinary integration
// TODO: Integrate with Cloudinary for image uploads
export async function uploadCustomizationImage(file: File): Promise<{ url: string }> {
  console.log('Mock upload:', file.name)
  await new Promise(resolve => setTimeout(resolve, 1000))
  return { url: '/mock-uploaded-image.jpg' }
}

// Mock function for future Conekta payment integration
// TODO: Integrate with Conekta for payments
export async function createPaymentIntent(amount: number): Promise<{ clientSecret: string }> {
  console.log('Mock payment intent for:', amount)
  await new Promise(resolve => setTimeout(resolve, 500))
  return { clientSecret: 'mock_client_secret_' + Date.now() }
}

// Simplified product data for components
export const mockProducts = MOCK_PRODUCTS.map(p => ({
  id: p.id,
  name: p.name,
  price: p.price,
  originalPrice: p.originalPrice,
  badge: p.badge,
  colors: p.colors,
  image: p.images[0]?.url,
  customizable: p.customizable,
}))

// Mock Cart Data
// TODO: Replace with TanStack Query useQuery for cart data
import type { CartItem, Cart } from './types'

export const MOCK_CART_ITEMS: CartItem[] = [
  {
    id: 'cart-1',
    product: MOCK_PRODUCTS[0], // Filipina Executive Blanca
    customization: {
      productId: '1',
      selectedColor: 'white',
      selectedSize: 'L',
      embroidery: {
        type: 'nombre',
        text: 'Chef Carlos',
        position: 'pecho-izquierdo',
        font: 'classic',
        color: '#0B1026',
      },
      quantity: 2,
    },
    subtotal: 2996, // (1299 + 199) * 2
  },
  {
    id: 'cart-2',
    product: MOCK_PRODUCTS[1], // Mandil Profesional Chef
    customization: {
      productId: '2',
      selectedColor: 'navy',
      selectedSize: 'Unitalla',
      embroidery: {
        type: 'logo',
        position: 'pecho-derecho',
        imageUrl: '/mock-logo.png',
      },
      quantity: 1,
    },
    subtotal: 798, // 599 + 199
  },
  {
    id: 'cart-3',
    product: MOCK_PRODUCTS[2], // Pantalon Chef Cargo
    customization: {
      productId: '3',
      selectedColor: 'black',
      selectedSize: '34',
      quantity: 1,
    },
    subtotal: 899,
  },
]

export const MOCK_CART: Cart = {
  items: MOCK_CART_ITEMS,
  subtotal: 4693,
  shipping: 0, // Free shipping over $2000
  tax: 0,
  total: 4693,
}

// Fetch cart - mock API
export async function fetchCart(options?: { delay?: number }): Promise<Cart> {
  const delay = options?.delay ?? 400
  await new Promise(resolve => setTimeout(resolve, delay))
  return MOCK_CART
}

// Update cart item quantity - mock API
export async function updateCartItemQuantity(
  itemId: string, 
  quantity: number
): Promise<Cart> {
  // TODO: Replace with TanStack Query mutation
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const updatedItems = MOCK_CART.items.map(item => {
    if (item.id === itemId) {
      const basePrice = item.product.price
      const customizationPrice = item.customization.embroidery ? 199 : 0
      return {
        ...item,
        customization: { ...item.customization, quantity },
        subtotal: (basePrice + customizationPrice) * quantity,
      }
    }
    return item
  })
  
  const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  return {
    items: updatedItems,
    subtotal,
    shipping: subtotal >= 2000 ? 0 : 199,
    tax: 0,
    total: subtotal >= 2000 ? subtotal : subtotal + 199,
  }
}

// Remove cart item - mock API
export async function removeCartItem(itemId: string): Promise<Cart> {
  // TODO: Replace with TanStack Query mutation
  await new Promise(resolve => setTimeout(resolve, 300))
  
  const updatedItems = MOCK_CART.items.filter(item => item.id !== itemId)
  const subtotal = updatedItems.reduce((sum, item) => sum + item.subtotal, 0)
  
  return {
    items: updatedItems,
    subtotal,
    shipping: subtotal >= 2000 ? 0 : 199,
    tax: 0,
    total: subtotal >= 2000 ? subtotal : subtotal + 199,
  }
}

// Features for landing page
export const mockFeatures = [
  {
    title: 'Calidad Premium',
    description: 'Telas de alta durabilidad para uso intensivo en cocina profesional.',
    icon: 'shield',
  },
  {
    title: 'Personalizacion',
    description: 'Agrega tu nombre, logo o diseno exclusivo con bordados de calidad.',
    icon: 'palette',
  },
  {
    title: 'Envio Rapido',
    description: 'Entrega en 3-5 dias habiles a toda la Republica Mexicana.',
    icon: 'truck',
  },
  {
    title: 'Garantia Total',
    description: '30 dias de garantia de satisfaccion o devolucion del dinero.',
    icon: 'badge-check',
  },
]

// Account Mock Data
import type { UserProfile, Address, Order, SavedDesign } from './types'

export const MOCK_USER: UserProfile = {
  id: 'user-1',
  firstName: 'Carlos',
  lastName: 'Rodriguez',
  email: 'carlos.rodriguez@email.com',
  phone: '+52 55 1234 5678',
  createdAt: '2024-03-15',
  customerStatus: 'premium',
}

export const MOCK_ADDRESSES: Address[] = [
  {
    id: 'addr-1',
    label: 'Casa',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    street: 'Av. Reforma',
    exteriorNumber: '222',
    interiorNumber: 'Depto 4B',
    neighborhood: 'Juarez',
    city: 'Ciudad de Mexico',
    state: 'CDMX',
    postalCode: '06600',
    country: 'Mexico',
    phone: '+52 55 1234 5678',
    isDefaultShipping: true,
    isDefaultBilling: true,
  },
  {
    id: 'addr-2',
    label: 'Restaurante',
    firstName: 'Carlos',
    lastName: 'Rodriguez',
    street: 'Calle Durango',
    exteriorNumber: '145',
    neighborhood: 'Roma Norte',
    city: 'Ciudad de Mexico',
    state: 'CDMX',
    postalCode: '06700',
    country: 'Mexico',
    phone: '+52 55 9876 5432',
    isDefaultShipping: false,
    isDefaultBilling: false,
  },
]

export const MOCK_ORDERS: Order[] = [
  {
    id: 'order-1',
    orderNumber: 'CR-2024-001234',
    date: '2024-11-20',
    status: 'enviado',
    paymentStatus: 'completado',
    items: [
      {
        id: 'item-1',
        productId: '1',
        productName: 'Filipina Executive Blanca',
        productImage: '/products/filipina-executive-white.jpg',
        color: 'Blanco',
        size: 'L',
        quantity: 2,
        price: 1299,
        hasCustomization: true,
        customizationDetails: 'Bordado: Chef Carlos',
      },
    ],
    subtotal: 2996,
    shipping: 0,
    discount: 0,
    total: 2996,
    shippingAddress: MOCK_ADDRESSES[0],
    trackingNumber: 'FDX123456789',
    trackingUrl: 'https://fedex.com/track/FDX123456789',
    estimatedDelivery: '2024-11-25',
  },
  {
    id: 'order-2',
    orderNumber: 'CR-2024-001189',
    date: '2024-10-15',
    status: 'entregado',
    paymentStatus: 'completado',
    items: [
      {
        id: 'item-2',
        productId: '2',
        productName: 'Mandil Profesional Chef',
        productImage: '/products/mandil-professional.jpg',
        color: 'Negro',
        size: 'Unitalla',
        quantity: 1,
        price: 599,
        hasCustomization: true,
        customizationDetails: 'Logo: Mi Restaurante',
      },
      {
        id: 'item-3',
        productId: '3',
        productName: 'Pantalon Chef Cargo',
        productImage: '/products/pantalon-cargo.jpg',
        color: 'Negro',
        size: '34',
        quantity: 1,
        price: 899,
        hasCustomization: false,
      },
    ],
    subtotal: 1697,
    shipping: 0,
    discount: 169,
    total: 1528,
    shippingAddress: MOCK_ADDRESSES[0],
  },
  {
    id: 'order-3',
    orderNumber: 'CR-2024-001567',
    date: '2024-11-28',
    status: 'en-produccion',
    paymentStatus: 'completado',
    items: [
      {
        id: 'item-4',
        productId: '4',
        productName: 'Filipina Slim Fit Negra',
        productImage: '/products/filipina-slim-black.jpg',
        color: 'Negro',
        size: 'M',
        quantity: 3,
        price: 1199,
        hasCustomization: true,
        customizationDetails: 'Bordado: Iniciales CR',
      },
    ],
    subtotal: 4194,
    shipping: 0,
    discount: 0,
    total: 4194,
    shippingAddress: MOCK_ADDRESSES[1],
    estimatedDelivery: '2024-12-10',
  },
]

export const MOCK_SAVED_DESIGNS: SavedDesign[] = [
  {
    id: 'design-1',
    name: 'Mi Filipina Principal',
    productType: 'filipinas',
    productName: 'Filipina Executive Blanca',
    previewImage: '/designs/preview-1.jpg',
    lastEdited: '2024-11-25',
    estimatedPrice: 1498,
    status: 'borrador',
    customization: {
      color: 'Blanco',
      embroideryType: 'nombre',
      embroideryText: 'Chef Carlos',
      embroideryPosition: 'pecho-izquierdo',
    },
  },
  {
    id: 'design-2',
    name: 'Mandil Restaurante',
    productType: 'mandiles',
    productName: 'Mandil Bistro Premium',
    previewImage: '/designs/preview-2.jpg',
    lastEdited: '2024-11-20',
    estimatedPrice: 948,
    status: 'en-carrito',
    customization: {
      color: 'Azul Marino',
      embroideryType: 'logo',
      embroideryPosition: 'pecho-derecho',
    },
  },
  {
    id: 'design-3',
    name: 'Uniforme Equipo',
    productType: 'filipinas',
    productName: 'Filipina Slim Fit Negra',
    previewImage: '/designs/preview-3.jpg',
    lastEdited: '2024-10-15',
    estimatedPrice: 1398,
    status: 'comprado',
    customization: {
      color: 'Negro',
      embroideryType: 'iniciales',
      embroideryText: 'CR',
      embroideryPosition: 'manga',
    },
  },
]

// Mock API functions for account
export async function fetchUserProfile(): Promise<UserProfile> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_USER
}

export async function fetchUserAddresses(): Promise<Address[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_ADDRESSES
}

export async function fetchUserOrders(): Promise<Order[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return MOCK_ORDERS
}

export async function fetchSavedDesigns(): Promise<SavedDesign[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_SAVED_DESIGNS
}

// Admin Products Mock Data
import type { AdminProduct, AdminProductFormData } from './types'

export const MOCK_ADMIN_PRODUCTS: AdminProduct[] = [
  {
    id: 'admin-1',
    name: 'Filipina Executive Blanca',
    slug: 'filipina-executive-blanca',
    sku: 'FIL-EXE-WHT',
    description: 'Filipina profesional de alta calidad con diseno ejecutivo.',
    category: 'filipinas',
    basePrice: 1299,
    productionDays: 5,
    customizable: true,
    status: 'activo',
    images: [{ id: '1', url: '/products/filipina-executive-white.jpg', alt: 'Filipina Executive Blanca', isPrimary: true }],
    sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { id: 'white', name: 'Blanco', hex: '#FFFFFF', available: true },
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
    ],
    variants: [
      { id: 'var-1', name: 'Manga Corta', sku: 'FIL-EXE-WHT-MC', priceModifier: 0, stock: 50, active: true },
      { id: 'var-2', name: 'Manga Larga', sku: 'FIL-EXE-WHT-ML', priceModifier: 100, stock: 35, active: true },
    ],
    seoTitle: 'Filipina Executive Blanca - Chef Room',
    seoDescription: 'Filipina profesional premium para chefs',
    createdAt: '2024-01-15',
    updatedAt: '2024-11-20',
  },
  {
    id: 'admin-2',
    name: 'Mandil Profesional Chef',
    slug: 'mandil-profesional-chef',
    sku: 'MAN-PRO-BLK',
    description: 'Mandil de alta durabilidad con bolsillos funcionales.',
    category: 'mandiles',
    basePrice: 599,
    productionDays: 3,
    customizable: true,
    status: 'activo',
    images: [{ id: '2', url: '/products/mandil-professional.jpg', alt: 'Mandil Profesional', isPrimary: true }],
    sizes: ['Unitalla'],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
      { id: 'navy', name: 'Azul Marino', hex: '#0B1026', available: true },
    ],
    variants: [],
    createdAt: '2024-02-10',
    updatedAt: '2024-11-18',
  },
  {
    id: 'admin-3',
    name: 'Pantalon Chef Cargo',
    slug: 'pantalon-chef-cargo',
    sku: 'PAN-CAR-BLK',
    description: 'Pantalon tipo cargo con multiples bolsillos.',
    category: 'pantalones',
    basePrice: 899,
    productionDays: 4,
    customizable: false,
    status: 'activo',
    images: [{ id: '3', url: '/products/pantalon-cargo.jpg', alt: 'Pantalon Cargo', isPrimary: true }],
    sizes: ['28', '30', '32', '34', '36', '38', '40'],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
    ],
    variants: [],
    createdAt: '2024-03-05',
    updatedAt: '2024-10-15',
  },
  {
    id: 'admin-4',
    name: 'Filipina Slim Fit Negra',
    slug: 'filipina-slim-fit-negra',
    sku: 'FIL-SLM-BLK',
    description: 'Filipina de corte slim moderno en negro elegante.',
    category: 'filipinas',
    basePrice: 1199,
    productionDays: 5,
    customizable: true,
    status: 'borrador',
    images: [{ id: '4', url: '/products/filipina-slim-black.jpg', alt: 'Filipina Slim Negra', isPrimary: true }],
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: [
      { id: 'black', name: 'Negro', hex: '#111111', available: true },
    ],
    variants: [],
    createdAt: '2024-04-20',
    updatedAt: '2024-11-25',
  },
  {
    id: 'admin-5',
    name: 'Mandil Bistro Premium',
    slug: 'mandil-bistro-premium',
    sku: 'MAN-BIS-NAV',
    description: 'Mandil estilo bistro con diseno europeo.',
    category: 'mandiles',
    basePrice: 749,
    productionDays: 4,
    customizable: true,
    status: 'archivado',
    images: [{ id: '5', url: '/products/mandil-bistro.jpg', alt: 'Mandil Bistro', isPrimary: true }],
    sizes: ['Unitalla'],
    colors: [
      { id: 'navy', name: 'Azul Marino', hex: '#0B1026', available: true },
      { id: 'brown', name: 'Cafe', hex: '#78350F', available: true },
    ],
    variants: [],
    createdAt: '2024-05-01',
    updatedAt: '2024-09-10',
  },
]

// Mock API functions for admin products
export async function fetchAdminProducts(): Promise<AdminProduct[]> {
  await new Promise(resolve => setTimeout(resolve, 400))
  return MOCK_ADMIN_PRODUCTS
}

export async function fetchAdminProductById(id: string): Promise<AdminProduct | null> {
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_ADMIN_PRODUCTS.find(p => p.id === id) ?? null
}

export async function createAdminProduct(data: AdminProductFormData): Promise<AdminProduct> {
  // TODO: Replace with GraphQL mutation
  await new Promise(resolve => setTimeout(resolve, 500))
  const newProduct: AdminProduct = {
    id: `admin-${Date.now()}`,
    ...data,
    images: [],
    colors: [],
    variants: [],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  return newProduct
}

export async function updateAdminProduct(id: string, data: Partial<AdminProductFormData>): Promise<AdminProduct> {
  // TODO: Replace with GraphQL mutation
  await new Promise(resolve => setTimeout(resolve, 500))
  const existing = MOCK_ADMIN_PRODUCTS.find(p => p.id === id)
  if (!existing) throw new Error('Product not found')
  return { ...existing, ...data, updatedAt: new Date().toISOString() }
}

export async function deleteAdminProduct(id: string): Promise<boolean> {
  // TODO: Replace with GraphQL mutation
  await new Promise(resolve => setTimeout(resolve, 300))
  return true
}

// Customization Rules Mock Data
import type { CustomizationAreaRule, CustomizationRuleFormData } from './types'

export const MOCK_CUSTOMIZATION_RULES: CustomizationAreaRule[] = [
  {
    id: 'rule-1',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'pecho',
    areaName: 'Pecho',
    enabled: true,
    allowedTypes: ['bordado', 'logo', 'texto'],
    maxWidth: 10,
    maxHeight: 8,
    basePrice: 150,
    pricePerCm: 5,
    productionExtraDays: 2,
    allowedFileTypes: ['png', 'jpg', 'svg'],
    minQuantity: 1,
    validationMessage: 'El area de pecho acepta bordados y logos de hasta 10x8 cm.',
    notes: 'Zona mas popular para personalizacion',
  },
  {
    id: 'rule-2',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'espalda',
    areaName: 'Espalda',
    enabled: true,
    allowedTypes: ['bordado', 'estampado', 'logo'],
    maxWidth: 25,
    maxHeight: 30,
    basePrice: 200,
    pricePerCm: 4,
    productionExtraDays: 3,
    allowedFileTypes: ['png', 'jpg', 'svg'],
    minQuantity: 1,
    validationMessage: 'El area de espalda permite disenos grandes hasta 25x30 cm.',
  },
  {
    id: 'rule-3',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'manga-izquierda',
    areaName: 'Manga Izquierda',
    enabled: true,
    allowedTypes: ['bordado', 'texto'],
    maxWidth: 6,
    maxHeight: 4,
    basePrice: 100,
    pricePerCm: 6,
    productionExtraDays: 1,
    minQuantity: 1,
    validationMessage: 'Ideal para iniciales o pequenos textos.',
  },
  {
    id: 'rule-4',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'manga-derecha',
    areaName: 'Manga Derecha',
    enabled: false,
    allowedTypes: ['bordado'],
    maxWidth: 6,
    maxHeight: 4,
    basePrice: 100,
    pricePerCm: 6,
    productionExtraDays: 1,
    minQuantity: 1,
  },
  {
    id: 'rule-5',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'bolsillo',
    areaName: 'Bolsillo',
    enabled: true,
    allowedTypes: ['bordado', 'patch'],
    maxWidth: 5,
    maxHeight: 5,
    basePrice: 80,
    pricePerCm: 8,
    productionExtraDays: 1,
    notes: 'Solo en filipinas con bolsillo',
  },
  {
    id: 'rule-6',
    productId: 'admin-1',
    productType: 'filipinas',
    areaId: 'cuello',
    areaName: 'Cuello',
    enabled: false,
    allowedTypes: ['bordado'],
    maxWidth: 4,
    maxHeight: 2,
    basePrice: 50,
    pricePerCm: 10,
    productionExtraDays: 1,
  },
  // Mandil rules
  {
    id: 'rule-7',
    productId: 'admin-2',
    productType: 'mandiles',
    areaId: 'pecho',
    areaName: 'Pecho',
    enabled: true,
    allowedTypes: ['bordado', 'logo', 'estampado'],
    maxWidth: 15,
    maxHeight: 12,
    basePrice: 120,
    pricePerCm: 4,
    productionExtraDays: 2,
    allowedFileTypes: ['png', 'jpg', 'svg'],
  },
  {
    id: 'rule-8',
    productId: 'admin-2',
    productType: 'mandiles',
    areaId: 'bolsillo',
    areaName: 'Bolsillo',
    enabled: true,
    allowedTypes: ['bordado', 'texto'],
    maxWidth: 8,
    maxHeight: 6,
    basePrice: 90,
    pricePerCm: 5,
    productionExtraDays: 1,
  },
]

// Mock API functions for customization rules
export async function fetchCustomizationRules(productId?: string): Promise<CustomizationAreaRule[]> {
  await new Promise(resolve => setTimeout(resolve, 300))
  if (productId) {
    return MOCK_CUSTOMIZATION_RULES.filter(r => r.productId === productId)
  }
  return MOCK_CUSTOMIZATION_RULES
}

export async function updateCustomizationRule(
  ruleId: string,
  data: Partial<CustomizationRuleFormData>
): Promise<CustomizationAreaRule> {
  // TODO: Replace with GraphQL mutation product_customization_rules.update
  await new Promise(resolve => setTimeout(resolve, 400))
  const existing = MOCK_CUSTOMIZATION_RULES.find(r => r.id === ruleId)
  if (!existing) throw new Error('Rule not found')
  return { ...existing, ...data }
}

export async function saveAllCustomizationRules(
  rules: CustomizationAreaRule[]
): Promise<boolean> {
  // TODO: Replace with GraphQL mutation product_customization_rules.batch_update
  await new Promise(resolve => setTimeout(resolve, 600))
  console.log('Saving rules:', rules)
  return true
}

// Admin Orders Mock Data
import type { AdminOrder, AdminOrderStatus, AdminPaymentStatus, AdminProductionStatus } from './types'

export const MOCK_ADMIN_ORDERS: AdminOrder[] = [
  {
    id: 'order-admin-1',
    orderNumber: 'CR-2024-001567',
    createdAt: '2024-11-28T10:30:00Z',
    updatedAt: '2024-11-28T14:45:00Z',
    status: 'en-produccion',
    paymentStatus: 'completado',
    productionStatus: 'en-proceso',
    customer: {
      id: 'cust-1',
      name: 'Carlos Rodriguez',
      email: 'carlos.rodriguez@email.com',
      phone: '+52 55 1234 5678',
      totalOrders: 5,
      customerSince: '2024-03-15',
    },
    shippingAddress: {
      id: 'addr-1',
      label: 'Casa',
      firstName: 'Carlos',
      lastName: 'Rodriguez',
      street: 'Av. Reforma',
      exteriorNumber: '222',
      interiorNumber: 'Depto 4B',
      neighborhood: 'Juarez',
      city: 'Ciudad de Mexico',
      state: 'CDMX',
      postalCode: '06600',
      country: 'Mexico',
      phone: '+52 55 1234 5678',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    items: [
      {
        id: 'item-1',
        productId: '1',
        productName: 'Filipina Executive Blanca',
        productImage: '/products/filipina-executive-white.jpg',
        sku: 'FIL-EXE-WHT-L',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        size: 'L',
        quantity: 3,
        unitPrice: 1299,
        totalPrice: 4494,
        hasCustomization: true,
        customization: {
          designId: 'design-001',
          previewUrl: '/designs/preview-carlos-1.jpg',
          areas: [
            {
              areaId: 'pecho',
              areaName: 'Pecho',
              type: 'bordado',
              text: 'Chef Carlos',
              font: 'Classic Script',
              color: '#0B1026',
              width: 8,
              height: 3,
              price: 199,
            },
          ],
          productionNotes: 'Cliente frecuente - prioridad alta',
        },
      },
    ],
    subtotal: 4494,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 5091,
    paymentMethod: 'card',
    paymentReference: 'pi_3OkPwz2eZvKYlo2C1234',
    estimatedDelivery: '2024-12-10',
    timeline: [
      { id: 't1', event: 'Orden creada', status: 'pendiente-pago', timestamp: '2024-11-28T10:30:00Z' },
      { id: 't2', event: 'Pago recibido', status: 'pagado', timestamp: '2024-11-28T10:32:00Z', notes: 'Pago con tarjeta via Conekta' },
      { id: 't3', event: 'En produccion', status: 'en-produccion', timestamp: '2024-11-28T14:45:00Z', user: 'Admin' },
    ],
  },
  {
    id: 'order-admin-2',
    orderNumber: 'CR-2024-001566',
    createdAt: '2024-11-27T16:20:00Z',
    updatedAt: '2024-11-28T09:00:00Z',
    status: 'listo-envio',
    paymentStatus: 'completado',
    productionStatus: 'completado',
    customer: {
      id: 'cust-2',
      name: 'Maria Garcia',
      email: 'maria.garcia@restaurante.com',
      phone: '+52 33 9876 5432',
      totalOrders: 12,
      customerSince: '2023-08-20',
    },
    shippingAddress: {
      id: 'addr-2',
      label: 'Restaurante',
      firstName: 'Maria',
      lastName: 'Garcia',
      street: 'Calle Hidalgo',
      exteriorNumber: '450',
      neighborhood: 'Centro',
      city: 'Guadalajara',
      state: 'Jalisco',
      postalCode: '44100',
      country: 'Mexico',
      phone: '+52 33 9876 5432',
      isDefaultShipping: true,
      isDefaultBilling: false,
    },
    items: [
      {
        id: 'item-2',
        productId: '2',
        productName: 'Mandil Profesional Chef',
        productImage: '/products/mandil-professional.jpg',
        sku: 'MAN-PRO-BLK-U',
        color: 'Negro',
        colorHex: '#111111',
        size: 'Unitalla',
        quantity: 5,
        unitPrice: 599,
        totalPrice: 2995,
        hasCustomization: true,
        customization: {
          designId: 'design-002',
          previewUrl: '/designs/preview-maria-1.jpg',
          areas: [
            {
              areaId: 'pecho',
              areaName: 'Pecho',
              type: 'logo',
              logoUrl: '/uploads/logo-restaurante-maria.png',
              width: 10,
              height: 8,
              price: 249,
            },
          ],
        },
      },
    ],
    subtotal: 2995,
    shipping: 0,
    discount: 299,
    tax: 0,
    total: 3941,
    paymentMethod: 'oxxo',
    paymentReference: 'oxxo_order_2024112701',
    trackingNumber: 'FDX789456123',
    trackingUrl: 'https://fedex.com/track/FDX789456123',
    estimatedDelivery: '2024-12-02',
    timeline: [
      { id: 't1', event: 'Orden creada', status: 'pendiente-pago', timestamp: '2024-11-27T16:20:00Z' },
      { id: 't2', event: 'Pago recibido', status: 'pagado', timestamp: '2024-11-27T18:45:00Z', notes: 'Pago OXXO confirmado' },
      { id: 't3', event: 'En produccion', status: 'en-produccion', timestamp: '2024-11-27T19:00:00Z' },
      { id: 't4', event: 'Produccion completada', status: 'listo-envio', timestamp: '2024-11-28T09:00:00Z', user: 'Produccion' },
    ],
  },
  {
    id: 'order-admin-3',
    orderNumber: 'CR-2024-001565',
    createdAt: '2024-11-27T09:15:00Z',
    updatedAt: '2024-11-27T09:15:00Z',
    status: 'pendiente-pago',
    paymentStatus: 'pendiente',
    productionStatus: 'pendiente',
    customer: {
      id: 'cust-3',
      name: 'Roberto Sanchez',
      email: 'roberto@hotel.mx',
      phone: '+52 81 5555 1234',
      totalOrders: 1,
      customerSince: '2024-11-27',
    },
    shippingAddress: {
      id: 'addr-3',
      label: 'Hotel',
      firstName: 'Roberto',
      lastName: 'Sanchez',
      street: 'Blvd. Fundadores',
      exteriorNumber: '1500',
      neighborhood: 'Valle Oriente',
      city: 'Monterrey',
      state: 'Nuevo Leon',
      postalCode: '66269',
      country: 'Mexico',
      phone: '+52 81 5555 1234',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    items: [
      {
        id: 'item-3',
        productId: '4',
        productName: 'Filipina Slim Fit Negra',
        productImage: '/products/filipina-slim-black.jpg',
        sku: 'FIL-SLM-BLK-M',
        color: 'Negro',
        colorHex: '#111111',
        size: 'M',
        quantity: 10,
        unitPrice: 1199,
        totalPrice: 11990,
        hasCustomization: false,
      },
    ],
    subtotal: 11990,
    shipping: 0,
    discount: 0,
    tax: 0,
    total: 11990,
    paymentMethod: 'spei',
    notes: 'Cliente nuevo - pedido grande',
    timeline: [
      { id: 't1', event: 'Orden creada', status: 'pendiente-pago', timestamp: '2024-11-27T09:15:00Z' },
    ],
  },
  {
    id: 'order-admin-4',
    orderNumber: 'CR-2024-001564',
    createdAt: '2024-11-26T14:00:00Z',
    updatedAt: '2024-11-28T11:30:00Z',
    status: 'enviado',
    paymentStatus: 'completado',
    productionStatus: 'completado',
    customer: {
      id: 'cust-4',
      name: 'Ana Martinez',
      email: 'ana.martinez@gmail.com',
      phone: '+52 55 4444 3333',
      totalOrders: 3,
      customerSince: '2024-06-10',
    },
    shippingAddress: {
      id: 'addr-4',
      label: 'Casa',
      firstName: 'Ana',
      lastName: 'Martinez',
      street: 'Calle Durango',
      exteriorNumber: '88',
      neighborhood: 'Roma Norte',
      city: 'Ciudad de Mexico',
      state: 'CDMX',
      postalCode: '06700',
      country: 'Mexico',
      phone: '+52 55 4444 3333',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    items: [
      {
        id: 'item-4',
        productId: '8',
        productName: 'Filipina Mujer Executive',
        productImage: '/products/filipina-mujer.jpg',
        sku: 'FIL-MUJ-WHT-S',
        color: 'Blanco',
        colorHex: '#FFFFFF',
        size: 'S',
        quantity: 2,
        unitPrice: 1399,
        totalPrice: 2798,
        hasCustomization: true,
        customization: {
          designId: 'design-003',
          previewUrl: '/designs/preview-ana-1.jpg',
          areas: [
            {
              areaId: 'manga-izquierda',
              areaName: 'Manga Izquierda',
              type: 'texto',
              text: 'AM',
              font: 'Modern Sans',
              color: '#2B3280',
              width: 4,
              height: 2,
              price: 99,
            },
          ],
        },
      },
    ],
    subtotal: 2798,
    shipping: 199,
    discount: 0,
    tax: 0,
    total: 3195,
    paymentMethod: 'card',
    paymentReference: 'pi_3OkPwz2eZvKYlo2C5678',
    trackingNumber: 'DHL123456789',
    trackingUrl: 'https://dhl.com/track/DHL123456789',
    estimatedDelivery: '2024-11-30',
    timeline: [
      { id: 't1', event: 'Orden creada', status: 'pendiente-pago', timestamp: '2024-11-26T14:00:00Z' },
      { id: 't2', event: 'Pago recibido', status: 'pagado', timestamp: '2024-11-26T14:02:00Z' },
      { id: 't3', event: 'En produccion', status: 'en-produccion', timestamp: '2024-11-26T15:00:00Z' },
      { id: 't4', event: 'Listo para envio', status: 'listo-envio', timestamp: '2024-11-28T10:00:00Z' },
      { id: 't5', event: 'Enviado', status: 'enviado', timestamp: '2024-11-28T11:30:00Z', notes: 'DHL Express' },
    ],
  },
  {
    id: 'order-admin-5',
    orderNumber: 'CR-2024-001563',
    createdAt: '2024-11-25T11:00:00Z',
    updatedAt: '2024-11-27T16:00:00Z',
    status: 'entregado',
    paymentStatus: 'completado',
    productionStatus: 'completado',
    customer: {
      id: 'cust-5',
      name: 'Pedro Lopez',
      email: 'pedro.lopez@cocina.mx',
      phone: '+52 222 111 2233',
      totalOrders: 8,
      customerSince: '2024-01-05',
    },
    shippingAddress: {
      id: 'addr-5',
      label: 'Escuela',
      firstName: 'Pedro',
      lastName: 'Lopez',
      street: 'Av. Universidad',
      exteriorNumber: '1000',
      neighborhood: 'San Baltazar',
      city: 'Puebla',
      state: 'Puebla',
      postalCode: '72550',
      country: 'Mexico',
      phone: '+52 222 111 2233',
      isDefaultShipping: true,
      isDefaultBilling: true,
    },
    items: [
      {
        id: 'item-5',
        productId: '3',
        productName: 'Pantalon Chef Cargo',
        productImage: '/products/pantalon-cargo.jpg',
        sku: 'PAN-CAR-BLK-32',
        color: 'Negro',
        colorHex: '#111111',
        size: '32',
        quantity: 4,
        unitPrice: 899,
        totalPrice: 3596,
        hasCustomization: false,
      },
    ],
    subtotal: 3596,
    shipping: 0,
    discount: 360,
    tax: 0,
    total: 3236,
    paymentMethod: 'card',
    paymentReference: 'pi_3OkPwz2eZvKYlo2C9999',
    trackingNumber: 'ESTAFETA456789',
    trackingUrl: 'https://estafeta.com/track/ESTAFETA456789',
    timeline: [
      { id: 't1', event: 'Orden creada', status: 'pendiente-pago', timestamp: '2024-11-25T11:00:00Z' },
      { id: 't2', event: 'Pago recibido', status: 'pagado', timestamp: '2024-11-25T11:01:00Z' },
      { id: 't3', event: 'En produccion', status: 'en-produccion', timestamp: '2024-11-25T12:00:00Z' },
      { id: 't4', event: 'Listo para envio', status: 'listo-envio', timestamp: '2024-11-26T10:00:00Z' },
      { id: 't5', event: 'Enviado', status: 'enviado', timestamp: '2024-11-26T11:00:00Z' },
      { id: 't6', event: 'Entregado', status: 'entregado', timestamp: '2024-11-27T16:00:00Z' },
    ],
  },
]

// Mock API functions for admin orders
export async function fetchAdminOrders(filters?: {
  status?: AdminOrderStatus
  paymentStatus?: AdminPaymentStatus
  productionStatus?: AdminProductionStatus
  search?: string
}): Promise<AdminOrder[]> {
  // TODO: Replace with GraphQL query orders.list
  await new Promise(resolve => setTimeout(resolve, 400))
  let orders = [...MOCK_ADMIN_ORDERS]
  
  if (filters?.status) {
    orders = orders.filter(o => o.status === filters.status)
  }
  if (filters?.paymentStatus) {
    orders = orders.filter(o => o.paymentStatus === filters.paymentStatus)
  }
  if (filters?.productionStatus) {
    orders = orders.filter(o => o.productionStatus === filters.productionStatus)
  }
  if (filters?.search) {
    const search = filters.search.toLowerCase()
    orders = orders.filter(o => 
      o.orderNumber.toLowerCase().includes(search) ||
      o.customer.name.toLowerCase().includes(search) ||
      o.customer.email.toLowerCase().includes(search)
    )
  }
  
  return orders
}

export async function fetchAdminOrderById(id: string): Promise<AdminOrder | null> {
  // TODO: Replace with GraphQL query orders.get
  await new Promise(resolve => setTimeout(resolve, 300))
  return MOCK_ADMIN_ORDERS.find(o => o.id === id) ?? null
}

export async function updateAdminOrderStatus(
  orderId: string,
  status: AdminOrderStatus,
  notes?: string
): Promise<AdminOrder> {
  // TODO: Replace with GraphQL mutation orders.updateStatus
  await new Promise(resolve => setTimeout(resolve, 400))
  const order = MOCK_ADMIN_ORDERS.find(o => o.id === orderId)
  if (!order) throw new Error('Order not found')
  return { ...order, status, updatedAt: new Date().toISOString() }
}

export async function addTrackingNumber(
  orderId: string,
  trackingNumber: string,
  carrier: string
): Promise<AdminOrder> {
  // TODO: Replace with GraphQL mutation orders.addTracking
  await new Promise(resolve => setTimeout(resolve, 400))
  const order = MOCK_ADMIN_ORDERS.find(o => o.id === orderId)
  if (!order) throw new Error('Order not found')
  return {
    ...order,
    trackingNumber,
    trackingUrl: `https://${carrier.toLowerCase()}.com/track/${trackingNumber}`,
    status: 'enviado',
    updatedAt: new Date().toISOString(),
  }
}
