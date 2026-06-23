import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'

interface AdminSectionPlaceholderProps {
  title: string
  description: string
}

export function AdminSectionPlaceholder({ title, description }: AdminSectionPlaceholderProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-sans text-2xl font-bold text-foreground">{title}</h1>
        <p className="mt-2 max-w-2xl font-serif text-muted-foreground">{description}</p>
      </div>

      <Card className="border-border bg-card">
        <CardHeader>
          <div className="flex flex-wrap items-center gap-2">
            <CardTitle className="font-sans text-lg">Próxima fase</CardTitle>
            <Badge variant="secondary" className="font-sans">
              Placeholder
            </Badge>
          </div>
          <CardDescription className="font-serif">
            Esta sección está preparada para la siguiente fase del dashboard.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="font-serif text-sm text-muted-foreground">
            El módulo de {title.toLowerCase()} se conectará con datos reales cuando el backend y la
            autenticación estén listos.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
