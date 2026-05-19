import { Shield, Eye, CreditCard, Headphones } from 'lucide-react'
import { cn } from '@/lib/utils'

const trustItems = [
  { icon: Eye, label: 'Personalizacion visual' },
  { icon: Shield, label: 'Produccion profesional' },
  { icon: CreditCard, label: 'Pago seguro' },
  { icon: Headphones, label: 'Atencion dedicada' },
]

interface TrustStripProps {
  className?: string
}

export function TrustStrip({ className }: TrustStripProps) {
  return (
    <section className={cn('border-y border-border/60 bg-card py-5', className)}>
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="flex flex-wrap items-center justify-center gap-8 md:justify-between md:gap-4">
          {trustItems.map((item) => (
            <div key={item.label} className="flex items-center gap-2.5">
              <item.icon className="h-4 w-4 text-primary" />
              <span className="font-sans text-[13px] font-medium tracking-wide text-foreground">
                {item.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
