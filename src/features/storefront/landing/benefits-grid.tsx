import { cn } from '@/lib/utils'
import { Card, CardContent } from '@/components/ui/card'
import { Check, Shield, Truck, Award, Palette, Clock, Users, Sparkles } from 'lucide-react'

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  shield: Shield,
  truck: Truck,
  palette: Palette,
  award: Award,
  clock: Clock,
  users: Users,
  sparkles: Sparkles,
  check: Check,
}

interface Benefit {
  icon: string
  title: string
  description: string
}

interface BenefitsGridProps {
  title: string
  subtitle?: string
  benefits: Benefit[]
  columns?: 2 | 3 | 4
  className?: string
}

export function BenefitsGrid({
  title,
  subtitle,
  benefits,
  columns = 3,
  className,
}: BenefitsGridProps) {
  const gridCols = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-2 lg:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }

  return (
    <section className={cn('px-4 py-16 md:px-6 md:py-20', className)}>
      <div className="mx-auto max-w-6xl">
        <div className="mb-12 text-center">
          <h2 className="font-sans text-3xl font-bold text-foreground md:text-4xl">{title}</h2>
          {subtitle && (
            <p className="mx-auto mt-4 max-w-2xl font-serif text-lg text-muted-foreground">
              {subtitle}
            </p>
          )}
        </div>

        <div className={cn('grid gap-6', gridCols[columns])}>
          {benefits.map((benefit, index) => {
            const Icon = iconMap[benefit.icon] || Check
            return (
              <Card key={index} className="border-border bg-card">
                <CardContent className="p-6">
                  <div className="mb-4 inline-flex rounded-lg bg-primary/10 p-3">
                    <Icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-sans text-lg font-semibold text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="mt-2 font-serif text-sm text-muted-foreground">
                    {benefit.description}
                  </p>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </section>
  )
}
