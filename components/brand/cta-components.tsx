import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Shield, Truck, RotateCcw, Award, Palette, BadgeCheck } from 'lucide-react'
import type { ReactNode } from 'react'

// Icon mapping for dynamic feature cards
const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  truck: Truck,
  palette: Palette,
  'badge-check': BadgeCheck,
  award: Award,
  check: Check,
}

// CTA Button Group Component
interface CTAButtonGroupProps {
  primaryLabel: string
  primaryOnClick?: () => void
  secondaryLabel?: string
  secondaryOnClick?: () => void
  align?: 'left' | 'center' | 'right'
  size?: 'sm' | 'default' | 'lg'
  className?: string
}

export function CTAButtonGroup({
  primaryLabel,
  primaryOnClick,
  secondaryLabel,
  secondaryOnClick,
  align = 'left',
  size = 'default',
  className,
}: CTAButtonGroupProps) {
  const alignClasses = {
    left: 'justify-start',
    center: 'justify-center',
    right: 'justify-end',
  }

  return (
    <div className={cn('flex flex-wrap gap-3', alignClasses[align], className)}>
      <Button size={size} onClick={primaryOnClick}>
        {primaryLabel}
      </Button>
      {secondaryLabel && (
        <Button size={size} variant="outline" onClick={secondaryOnClick}>
          {secondaryLabel}
        </Button>
      )}
    </div>
  )
}

// Feature Card Component
interface FeatureCardProps {
  feature?: {
    icon?: string
    title: string
    description: string
  }
  icon?: ReactNode
  title?: string
  description?: string
  variant?: 'default' | 'horizontal' | 'compact'
  className?: string
}

export function FeatureCard({
  feature,
  icon,
  title: titleProp,
  description: descProp,
  variant = 'default',
  className,
}: FeatureCardProps) {
  // Support both individual props and feature object
  const title = feature?.title ?? titleProp ?? ''
  const description = feature?.description ?? descProp ?? ''

  // Get icon - either from prop, from feature string, or default
  let iconElement: ReactNode = icon
  if (!iconElement && feature?.icon) {
    const IconComponent = iconMap[feature.icon]
    if (IconComponent) {
      iconElement = <IconComponent className="h-6 w-6" />
    }
  }

  if (variant === 'horizontal') {
    return (
      <Card className={cn('border-border bg-card', className)}>
        <CardContent className="flex items-start gap-4 p-4">
          <div className="flex-shrink-0 rounded-lg bg-primary/10 p-3">
            <div className="h-6 w-6 text-primary">{iconElement}</div>
          </div>
          <div>
            <h3 className="font-sans font-semibold text-foreground">{title}</h3>
            <p className="mt-1 font-serif text-sm text-muted-foreground">{description}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        <div className="flex-shrink-0 rounded-full bg-success/10 p-2">
          <Check className="h-4 w-4 text-success" />
        </div>
        <span className="font-serif text-sm text-foreground">{title}</span>
      </div>
    )
  }

  return (
    <Card className={cn('border-border bg-card text-center', className)}>
      <CardContent className="p-6">
        <div className="mx-auto mb-4 w-fit rounded-lg bg-primary/10 p-3">
          <div className="h-6 w-6 text-primary">{iconElement}</div>
        </div>
        <h3 className="font-sans font-semibold text-foreground">{title}</h3>
        <p className="mt-2 font-serif text-sm text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  )
}

// Trust Badge Component
interface TrustBadgeProps {
  variant?: 'shipping' | 'secure' | 'returns' | 'quality'
  className?: string
}

const trustBadgeConfig = {
  shipping: {
    icon: Truck,
    title: 'Envío Gratis',
    subtitle: 'En pedidos +$999',
  },
  secure: {
    icon: Shield,
    title: 'Pago Seguro',
    subtitle: 'Protección total',
  },
  returns: {
    icon: RotateCcw,
    title: 'Devoluciones',
    subtitle: '30 días garantía',
  },
  quality: {
    icon: Award,
    title: 'Calidad Premium',
    subtitle: 'Materiales selectos',
  },
}

export function TrustBadge({ variant = 'shipping', className }: TrustBadgeProps) {
  const config = trustBadgeConfig[variant]
  const Icon = config.icon

  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex-shrink-0 rounded-full bg-secondary p-2">
        <Icon className="h-5 w-5 text-accent" />
      </div>
      <div>
        <p className="font-sans text-sm font-medium text-foreground">{config.title}</p>
        <p className="font-serif text-xs text-muted-foreground">{config.subtitle}</p>
      </div>
    </div>
  )
}

// Trust Badges Row
export function TrustBadgesRow({ className }: { className?: string }) {
  return (
    <div className={cn('grid grid-cols-2 gap-4 md:grid-cols-4', className)}>
      <TrustBadge variant="shipping" />
      <TrustBadge variant="secure" />
      <TrustBadge variant="returns" />
      <TrustBadge variant="quality" />
    </div>
  )
}
