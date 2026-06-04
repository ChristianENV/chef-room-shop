// Chef Room by Bedolla - TypeScript Types
// Types for products, customization, and UI components

export interface Product {
  id: string
  name: string
  slug: string
  category: ProductCategory
  price: number
  originalPrice?: number
  description: string
  shortDescription: string
  images: ProductImage[]
  colors: ProductColor[]
  sizes: string[]
  customizable: boolean
  badge?: ProductBadgeType
  stock: number
  rating: number
  reviewCount: number
}

export type ProductCategory = 'filipinas' | 'mandiles' | 'pantalones' | 'accesorios'

export interface ProductImage {
  id: string
  url: string
  alt: string
  isPrimary: boolean
  thumbnailUrl?: string
  imageUrl?: string
  publicId?: string | null
  sortOrder?: number | null
}

export interface ProductColor {
  id: string
  name: string
  hex: string
  available: boolean
}

export type ProductBadgeType = 'nuevo' | 'oferta' | 'agotado' | 'personalizable' | 'popular'

export interface CustomizationConfig {
  productId: string
  selectedColor: string
  selectedSize: string
  embroidery?: EmbroideryConfig
  quantity: number
}

export interface EmbroideryConfig {
  type: 'nombre' | 'logo' | 'iniciales' | 'diseño'
  text?: string
  position: EmbroideryPosition
  font?: string
  color?: string
  imageUrl?: string // For logo/design uploads
}

export type EmbroideryPosition = 'pecho-izquierdo' | 'pecho-derecho' | 'espalda' | 'manga'

export interface CartItem {
  id: string
  product: Product
  customization: CustomizationConfig
  subtotal: number
}

export interface Cart {
  items: CartItem[]
  subtotal: number
  shipping: number
  tax: number
  total: number
}

// UI Component Types
export interface StatusBadgeProps {
  status: 'success' | 'warning' | 'error' | 'info'
  text: string
}

export interface EmptyStateProps {
  icon?: React.ReactNode
  title: string
  description: string
  action?: {
    label: string
    onClick: () => void
  }
}

export interface ErrorStateProps {
  title?: string
  message: string
  retry?: () => void
}

// Mock Data Type for development
export interface MockDataOptions {
  delay?: number
  shouldFail?: boolean
  failureRate?: number
}

// Future API Integration Types
// TODO: Replace with actual GraphQL types when backend is ready
export interface ApiResponse<T> {
  data: T | null
  error: string | null
  loading: boolean
}

// Future: TanStack Query integration types
export interface QueryConfig {
  staleTime?: number
  cacheTime?: number
  retry?: number | boolean
}

// Account Types
export interface UserProfile {
  id: string
  firstName: string
  lastName: string
  email: string
  phone: string
  avatar?: string
  createdAt: string
  customerStatus: 'regular' | 'premium' | 'vip'
}

export interface Address {
  id: string
  label: string
  firstName: string
  lastName: string
  street: string
  exteriorNumber: string
  interiorNumber?: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
  isDefaultShipping: boolean
  isDefaultBilling: boolean
}

export type OrderStatus = 'pendiente' | 'pagado' | 'en-produccion' | 'enviado' | 'entregado' | 'cancelado'
export type PaymentStatus = 'pendiente' | 'completado' | 'fallido' | 'reembolsado'

export interface Order {
  id: string
  orderNumber: string
  date: string
  status: OrderStatus
  paymentStatus: PaymentStatus
  items: OrderItem[]
  subtotal: number
  shipping: number
  discount: number
  total: number
  shippingAddress: Address
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
}

export interface OrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  color: string
  size: string
  quantity: number
  price: number
  hasCustomization: boolean
  customizationDetails?: string
}

export type SavedDesignStatus = 'borrador' | 'en-carrito' | 'comprado'

export interface SavedDesign {
  id: string
  name: string
  productType: ProductCategory
  productName: string
  previewImage: string
  lastEdited: string
  estimatedPrice: number
  status: SavedDesignStatus
  customization: {
    color: string
    embroideryType?: string
    embroideryText?: string
    embroideryPosition?: string
  }
}

// Admin Product Types
export type AdminProductStatus = 'activo' | 'borrador' | 'archivado'

export interface AdminProduct {
  id: string
  name: string
  slug: string
  sku: string
  description: string
  category: ProductCategory
  basePrice: number
  productionDays: number
  customizable: boolean
  status: AdminProductStatus
  images: ProductImage[]
  sizes: string[]
  colors: ProductColor[]
  variants: AdminProductVariant[]
  seoTitle?: string
  seoDescription?: string
  createdAt: string
  updatedAt: string
}

export interface AdminProductVariant {
  id: string
  name: string
  sku: string
  priceModifier: number
  stock: number
  active: boolean
}

export interface AdminProductFormData {
  name: string
  slug: string
  sku: string
  description: string
  category: ProductCategory
  basePrice: number
  productionDays: number
  customizable: boolean
  status: AdminProductStatus
  sizes: string[]
  colors: string[]
  seoTitle: string
  seoDescription: string
}

// Customization Rules Types
export type GarmentAreaId = 'pecho' | 'espalda' | 'manga-izquierda' | 'manga-derecha' | 'bolsillo' | 'cuello'
export type CustomizationType = 'bordado' | 'estampado' | 'patch' | 'logo' | 'texto'

export interface CustomizationAreaRule {
  id: string
  productId: string
  productType: ProductCategory
  areaId: GarmentAreaId
  areaName: string
  enabled: boolean
  allowedTypes: CustomizationType[]
  maxWidth: number // in cm
  maxHeight: number // in cm
  basePrice: number
  pricePerCm: number
  productionExtraDays: number
  allowedFileTypes?: string[]
  minQuantity?: number
  validationMessage?: string
  notes?: string
}

export interface CustomizationRuleFormData {
  productId: string
  areaId: GarmentAreaId
  enabled: boolean
  allowedTypes: CustomizationType[]
  maxWidth: number
  maxHeight: number
  basePrice: number
  pricePerCm: number
  productionExtraDays: number
  allowedFileTypes: string[]
  minQuantity: number
  validationMessage: string
}

// Admin Order Types
export type AdminOrderStatus = 'pendiente-pago' | 'pagado' | 'en-produccion' | 'listo-envio' | 'enviado' | 'entregado' | 'cancelado'
export type AdminPaymentStatus = 'pendiente' | 'completado' | 'fallido' | 'reembolsado' | 'parcial'
export type AdminProductionStatus = 'pendiente' | 'en-cola' | 'en-proceso' | 'revision' | 'completado'

export interface AdminOrder {
  id: string
  orderNumber: string
  createdAt: string
  updatedAt: string
  status: AdminOrderStatus
  paymentStatus: AdminPaymentStatus
  productionStatus: AdminProductionStatus
  customer: AdminOrderCustomer
  shippingAddress: Address
  billingAddress?: Address
  items: AdminOrderItem[]
  subtotal: number
  shipping: number
  discount: number
  tax: number
  total: number
  paymentMethod?: string
  paymentReference?: string
  trackingNumber?: string
  trackingUrl?: string
  estimatedDelivery?: string
  notes?: string
  timeline: AdminOrderTimelineEvent[]
}

export interface AdminOrderCustomer {
  id: string
  name: string
  email: string
  phone: string
  totalOrders: number
  customerSince: string
}

export interface AdminOrderItem {
  id: string
  productId: string
  productName: string
  productImage: string
  sku: string
  color: string
  colorHex: string
  size: string
  quantity: number
  unitPrice: number
  totalPrice: number
  hasCustomization: boolean
  customization?: AdminOrderCustomization
}

export interface AdminOrderCustomization {
  designId: string
  previewUrl: string
  areas: AdminCustomizationArea[]
  productionNotes?: string
}

export interface AdminCustomizationArea {
  areaId: GarmentAreaId
  areaName: string
  type: CustomizationType
  text?: string
  logoUrl?: string
  font?: string
  color?: string
  width: number
  height: number
  price: number
}

export interface AdminOrderTimelineEvent {
  id: string
  event: string
  status: AdminOrderStatus
  timestamp: string
  user?: string
  notes?: string
}
