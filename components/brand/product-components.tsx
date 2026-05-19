import { cn } from '@/lib/utils'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { Star, Heart } from 'lucide-react'
import type { Product, ProductBadgeType } from '@/lib/types'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'featured'
  onAddToCart?: () => void
  onQuickView?: () => void
  className?: string
}

export function ProductCard({ 
  product, 
  variant = 'default',
  className 
}: ProductCardProps) {
  const isCompact = variant === 'compact'
  const isFeatured = variant === 'featured'

  return (
    <Card className={cn(
      'group overflow-hidden border-border bg-card transition-all duration-300 hover:shadow-lg',
      isFeatured && 'md:col-span-2',
      className
    )}>
      <div className={cn(
        'relative overflow-hidden bg-secondary',
        isCompact ? 'aspect-square' : 'aspect-[4/5]'
      )}>
        {/* Product Image Placeholder */}
        <div className="absolute inset-0 flex items-center justify-center text-chef-muted">
          <svg className="h-16 w-16 opacity-40" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        </div>
        
        {/* Badge */}
        {product.badge && (
          <div className="absolute left-3 top-3">
            <ProductBadge type={product.badge} />
          </div>
        )}
        
        {/* Wishlist Button */}
        <button 
          className="absolute right-3 top-3 rounded-full bg-card/90 p-2 opacity-0 shadow-sm transition-all duration-200 hover:bg-card group-hover:opacity-100"
          aria-label="Agregar a favoritos"
        >
          <Heart className="h-4 w-4 text-foreground" />
        </button>
        
        {/* Quick Customization CTA */}
        {product.customizable && (
          <div className="absolute inset-x-0 bottom-0 translate-y-full bg-primary p-3 text-center text-sm font-medium text-primary-foreground transition-transform duration-300 group-hover:translate-y-0">
            Personalizar ahora
          </div>
        )}
      </div>
      
      <CardContent className={cn('p-4', isCompact && 'p-3')}>
        {/* Category */}
        <p className="font-serif text-xs uppercase tracking-wider text-muted-foreground">
          {product.category}
        </p>
        
        {/* Product Name */}
        <h3 className={cn(
          'mt-1 font-sans font-medium text-foreground line-clamp-2',
          isCompact ? 'text-sm' : 'text-base'
        )}>
          {product.name}
        </h3>
        
        {/* Rating */}
        {!isCompact && (
          <div className="mt-2 flex items-center gap-1">
            <Star className="h-4 w-4 fill-chef-warning text-chef-warning" />
            <span className="font-serif text-sm text-foreground">{product.rating}</span>
            <span className="font-serif text-sm text-muted-foreground">
              ({product.reviewCount} reseñas)
            </span>
          </div>
        )}
        
        {/* Price */}
        <div className="mt-2">
          <PriceDisplay 
            price={product.price} 
            originalPrice={product.originalPrice}
            size={isCompact ? 'sm' : 'md'}
          />
        </div>
        
        {/* Color Options */}
        {!isCompact && product.colors.length > 1 && (
          <div className="mt-3 flex gap-1.5">
            {product.colors.slice(0, 4).map((color) => (
              <div
                key={color.id}
                className="h-5 w-5 rounded-full border border-border shadow-sm"
                style={{ backgroundColor: color.hex }}
                title={color.name}
              />
            ))}
            {product.colors.length > 4 && (
              <span className="flex h-5 items-center font-serif text-xs text-muted-foreground">
                +{product.colors.length - 4}
              </span>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}

interface ProductBadgeProps {
  type: ProductBadgeType
  className?: string
}

const badgeConfig: Record<ProductBadgeType, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
  nuevo: { label: 'Nuevo', variant: 'default' },
  oferta: { label: 'Oferta', variant: 'destructive' },
  agotado: { label: 'Agotado', variant: 'secondary' },
  personalizable: { label: 'Personalizable', variant: 'outline' },
  popular: { label: 'Popular', variant: 'default' },
}

export function ProductBadge({ type, className }: ProductBadgeProps) {
  const config = badgeConfig[type]
  
  return (
    <Badge 
      variant={config.variant}
      className={cn(
        'font-sans text-xs uppercase tracking-wider',
        type === 'nuevo' && 'bg-chef-success text-white hover:bg-chef-success/90',
        type === 'popular' && 'bg-primary text-primary-foreground',
        className
      )}
    >
      {config.label}
    </Badge>
  )
}

interface PriceDisplayProps {
  price: number
  originalPrice?: number
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function PriceDisplay({ price, originalPrice, size = 'md', className }: PriceDisplayProps) {
  const hasDiscount = originalPrice && originalPrice > price
  const discount = hasDiscount ? Math.round((1 - price / originalPrice) * 100) : 0

  const sizeClasses = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl md:text-3xl',
  }

  return (
    <div className={cn('flex items-baseline gap-2', className)}>
      <span className={cn('font-sans font-bold text-foreground', sizeClasses[size])}>
        ${price.toLocaleString('es-MX')}
      </span>
      {hasDiscount && (
        <>
          <span className="font-serif text-sm text-muted-foreground line-through">
            ${originalPrice.toLocaleString('es-MX')}
          </span>
          <span className="font-sans text-xs font-medium text-chef-success">
            -{discount}%
          </span>
        </>
      )}
    </div>
  )
}

interface CustomizationBadgeProps {
  className?: string
}

export function CustomizationBadge({ className }: CustomizationBadgeProps) {
  return (
    <div className={cn(
      'inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1.5',
      className
    )}>
      <svg className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
      </svg>
      <span className="font-sans text-sm font-medium text-primary">
        Personalizable
      </span>
    </div>
  )
}
