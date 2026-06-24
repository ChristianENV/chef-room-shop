'use client'

import { cn } from '@/lib/utils'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import type { Product } from '@/lib/types'

interface ProductTabsProps {
  product: Product
  className?: string
}

export function ProductTabs({ product, className }: ProductTabsProps) {
  return (
    <Tabs defaultValue="descripcion" className={cn('w-full', className)}>
      <TabsList className="w-full justify-start overflow-x-auto bg-secondary">
        <TabsTrigger value="descripcion" className="font-sans">
          Descripcion
        </TabsTrigger>
        <TabsTrigger value="materiales" className="font-sans">
          Materiales
        </TabsTrigger>
        <TabsTrigger value="tallas" className="font-sans">
          Guia de tallas
        </TabsTrigger>
        <TabsTrigger value="personalizacion" className="font-sans">
          Personalizacion
        </TabsTrigger>
        <TabsTrigger value="cuidados" className="font-sans">
          Cuidados
        </TabsTrigger>
      </TabsList>

      <TabsContent value="descripcion" className="mt-6">
        <div className="prose prose-invert max-w-none">
          <p className="font-serif text-base leading-relaxed text-muted-foreground">
            {product.description}
          </p>
          <h3 className="mt-6 font-sans text-lg font-semibold text-foreground">
            Caracteristicas principales
          </h3>
          <ul className="mt-4 space-y-2 font-serif text-muted-foreground">
            <li>Tela premium transpirable de alta durabilidad</li>
            <li>Costuras reforzadas para uso intensivo en cocina</li>
            <li>Corte ergonomico para maxima libertad de movimiento</li>
            <li>Resistente a manchas y facil lavado</li>
            <li>Disponible en multiples colores y tallas</li>
          </ul>
        </div>
      </TabsContent>

      <TabsContent value="materiales" className="mt-6">
        <div className="space-y-4">
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-sans text-sm font-semibold text-foreground">Composicion</h4>
            <p className="mt-2 font-serif text-muted-foreground">65% Poliester, 35% Algodon</p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-sans text-sm font-semibold text-foreground">Peso de la tela</h4>
            <p className="mt-2 font-serif text-muted-foreground">
              180 g/m - Ideal para uso diario en cocina profesional
            </p>
          </div>
          <div className="rounded-lg border border-border p-4">
            <h4 className="font-sans text-sm font-semibold text-foreground">Acabado</h4>
            <p className="mt-2 font-serif text-muted-foreground">
              Tratamiento antimanchas y antibacterial
            </p>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="tallas" className="mt-6">
        <SizeGuide />
      </TabsContent>

      <TabsContent value="personalizacion" className="mt-6">
        <div className="space-y-6">
          <p className="font-serif text-muted-foreground">
            Personaliza tu prenda con bordados de alta calidad. Ofrecemos diferentes opciones para
            hacer tu uniforme unico.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-sans text-sm font-semibold text-foreground">Bordado de nombre</h4>
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Agrega tu nombre con tipografia profesional. Disponible en pecho izquierdo, derecho
                o manga.
              </p>
              <p className="mt-2 font-sans text-sm font-bold text-primary">Desde $149</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-sans text-sm font-semibold text-foreground">
                Logo personalizado
              </h4>
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Bordamos el logo de tu restaurante o negocio. Hasta 10cm de ancho.
              </p>
              <p className="mt-2 font-sans text-sm font-bold text-primary">Desde $299</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-sans text-sm font-semibold text-foreground">
                Texto personalizado
              </h4>
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Agrega frases, cargos o cualquier texto. Multiples fuentes disponibles.
              </p>
              <p className="mt-2 font-sans text-sm font-bold text-primary">Desde $149</p>
            </div>
            <div className="rounded-lg border border-border p-4">
              <h4 className="font-sans text-sm font-semibold text-foreground">Diseno exclusivo</h4>
              <p className="mt-2 font-serif text-sm text-muted-foreground">
                Trabajamos contigo para crear un diseno unico para tu equipo.
              </p>
              <p className="mt-2 font-sans text-sm font-bold text-primary">Cotizar</p>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="cuidados" className="mt-6">
        <div className="space-y-4">
          <p className="font-serif text-muted-foreground">
            Para mantener tu prenda en optimas condiciones, sigue estas instrucciones de cuidado:
          </p>
          <ul className="space-y-3 font-serif text-muted-foreground">
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                1
              </span>
              Lavar a maquina con agua fria o tibia (max 40C)
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                2
              </span>
              No usar blanqueador
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                3
              </span>
              Secar a temperatura media o al aire libre
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                4
              </span>
              Planchar a temperatura media si es necesario
            </li>
            <li className="flex items-start gap-3">
              <span className="flex h-6 w-6 items-center justify-center rounded-full bg-secondary text-xs font-bold text-foreground">
                5
              </span>
              No limpiar en seco
            </li>
          </ul>
        </div>
      </TabsContent>
    </Tabs>
  )
}

// Size Guide Component
function SizeGuide() {
  const sizes = [
    { size: 'XS', chest: '86-91', waist: '71-76', hips: '86-91' },
    { size: 'S', chest: '91-96', waist: '76-81', hips: '91-96' },
    { size: 'M', chest: '96-101', waist: '81-86', hips: '96-101' },
    { size: 'L', chest: '101-106', waist: '86-91', hips: '101-106' },
    { size: 'XL', chest: '106-111', waist: '91-96', hips: '106-111' },
    { size: 'XXL', chest: '111-116', waist: '96-101', hips: '111-116' },
  ]

  return (
    <div className="space-y-4">
      <p className="font-serif text-muted-foreground">
        Todas las medidas estan en centimetros. Si estas entre dos tallas, te recomendamos elegir la
        talla mayor para mayor comodidad.
      </p>

      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border">
              <TableHead className="font-sans text-foreground">Talla</TableHead>
              <TableHead className="font-sans text-foreground">Pecho (cm)</TableHead>
              <TableHead className="font-sans text-foreground">Cintura (cm)</TableHead>
              <TableHead className="font-sans text-foreground">Cadera (cm)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sizes.map((row) => (
              <TableRow key={row.size} className="border-border">
                <TableCell className="font-sans font-medium text-foreground">{row.size}</TableCell>
                <TableCell className="font-serif text-muted-foreground">{row.chest}</TableCell>
                <TableCell className="font-serif text-muted-foreground">{row.waist}</TableCell>
                <TableCell className="font-serif text-muted-foreground">{row.hips}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <div className="mt-6 rounded-lg bg-secondary p-4">
        <h4 className="font-sans text-sm font-semibold text-foreground">Como medirte</h4>
        <ul className="mt-2 space-y-1 font-serif text-sm text-muted-foreground">
          <li>
            <strong>Pecho:</strong> Mide la parte mas ancha de tu pecho, debajo de las axilas.
          </li>
          <li>
            <strong>Cintura:</strong> Mide alrededor de tu cintura natural, a la altura del ombligo.
          </li>
          <li>
            <strong>Cadera:</strong> Mide la parte mas ancha de tus caderas.
          </li>
        </ul>
      </div>
    </div>
  )
}
