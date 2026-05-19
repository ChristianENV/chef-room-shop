'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Skeleton } from '@/components/ui/skeleton'
import { 
  ShoppingCart, 
  Heart, 
  Edit3, 
  Check, 
  AlertCircle,
  Info,
  ChevronRight
} from 'lucide-react'

export function ShadcnComponentsSection() {
  return (
    <section id="shadcn" className="scroll-mt-8">
      <Card className="border-border bg-card">
        <CardHeader>
          <CardTitle className="font-sans text-xl">Componentes shadcn/ui</CardTitle>
          <p className="font-serif text-muted-foreground">
            Componentes base estilizados con la identidad de Chef Room
          </p>
        </CardHeader>
        <CardContent className="space-y-8">
          {/* Buttons */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Botones
            </h3>
            <div className="flex flex-wrap gap-3">
              <Button>
                <ShoppingCart className="mr-2 h-4 w-4" />
                Agregar al Carrito
              </Button>
              <Button variant="secondary">
                <Heart className="mr-2 h-4 w-4" />
                Favoritos
              </Button>
              <Button variant="outline">
                <Edit3 className="mr-2 h-4 w-4" />
                Personalizar
              </Button>
              <Button variant="ghost">Ver Detalles</Button>
              <Button variant="link">Términos y Condiciones</Button>
              <Button variant="destructive">Eliminar</Button>
            </div>
            <div className="mt-4 flex flex-wrap gap-3">
              <Button size="sm">Pequeño</Button>
              <Button size="default">Normal</Button>
              <Button size="lg">Grande</Button>
            </div>
          </div>

          <Separator />

          {/* Badges */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Badges
            </h3>
            <div className="flex flex-wrap gap-3">
              <Badge>Nuevo</Badge>
              <Badge variant="secondary">Categoría</Badge>
              <Badge variant="outline">Personalizable</Badge>
              <Badge variant="destructive">Agotado</Badge>
              <Badge className="bg-success text-white hover:bg-success/90">
                En Stock
              </Badge>
              <Badge className="bg-warning text-foreground hover:bg-warning/90">
                Ultima unidad
              </Badge>
            </div>
          </div>

          <Separator />

          {/* Tabs */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Tabs
            </h3>
            <Tabs defaultValue="descripcion" className="w-full">
              <TabsList className="grid w-full grid-cols-3 lg:w-[400px]">
                <TabsTrigger value="descripcion">Descripción</TabsTrigger>
                <TabsTrigger value="tallas">Tallas</TabsTrigger>
                <TabsTrigger value="resenas">Reseñas</TabsTrigger>
              </TabsList>
              <TabsContent value="descripcion" className="mt-4">
                <p className="font-serif text-muted-foreground">
                  Filipina profesional confeccionada en tela premium transpirable, 
                  diseñada para el chef moderno que busca comodidad y estilo.
                </p>
              </TabsContent>
              <TabsContent value="tallas" className="mt-4">
                <p className="font-serif text-muted-foreground">
                  Disponible en tallas XS, S, M, L, XL, XXL. Consulta nuestra guía de tallas.
                </p>
              </TabsContent>
              <TabsContent value="resenas" className="mt-4">
                <p className="font-serif text-muted-foreground">
                  124 reseñas · 4.8/5 estrellas promedio
                </p>
              </TabsContent>
            </Tabs>
          </div>

          <Separator />

          {/* Form Elements */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Formularios
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="nombre">Nombre para bordado</Label>
                <Input id="nombre" placeholder="Ej: Chef García" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input id="email" type="email" placeholder="tu@email.com" />
              </div>
            </div>
          </div>

          <Separator />

          {/* Alerts */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Alertas
            </h3>
            <div className="space-y-3">
              <Alert>
                <Info className="h-4 w-4" />
                <AlertTitle>Información</AlertTitle>
                <AlertDescription className="font-serif">
                  Tu personalización será revisada antes de la producción.
                </AlertDescription>
              </Alert>
              <Alert className="border-success/30 bg-success/5 text-success [&>svg]:text-success">
                <Check className="h-4 w-4" />
                <AlertTitle>Pedido Confirmado</AlertTitle>
                <AlertDescription className="font-serif text-success/90">
                  Tu pedido #12345 ha sido confirmado exitosamente.
                </AlertDescription>
              </Alert>
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription className="font-serif">
                  Hubo un problema al procesar tu pago. Intenta de nuevo.
                </AlertDescription>
              </Alert>
            </div>
          </div>

          <Separator />

          {/* Skeletons */}
          <div>
            <h3 className="mb-4 font-sans text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              Skeletons (Loading)
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-3 rounded-lg border border-border p-4">
                <Skeleton className="h-32 w-full" />
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-6 w-24" />
              </div>
              <div className="space-y-3 rounded-lg border border-border p-4">
                <div className="flex gap-3">
                  <Skeleton className="h-12 w-12 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-1/3" />
                    <Skeleton className="h-4 w-1/2" />
                  </div>
                </div>
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-4/5" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  )
}
