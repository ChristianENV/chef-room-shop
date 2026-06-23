import { CheckoutLayout } from '@/src/features/storefront/layout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { Separator } from '@/components/ui/separator'
import { CreditCard, Truck, Shield } from 'lucide-react'

export default function CheckoutLayoutDemo() {
  return (
    <CheckoutLayout>
      <div className="grid gap-8 lg:grid-cols-5">
        {/* Main Form */}
        <div className="lg:col-span-3">
          <h1 className="font-sans text-2xl font-bold text-foreground">Checkout</h1>
          <p className="mt-1 font-serif text-muted-foreground">
            Completa tu informacion para finalizar tu pedido.
          </p>

          {/* Contact */}
          <div className="mt-8">
            <h2 className="font-sans text-lg font-semibold text-foreground">
              Informacion de Contacto
            </h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="email" className="font-sans">
                  Correo electronico
                </Label>
                <Input id="email" type="email" placeholder="tu@email.com" className="mt-1.5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="firstName" className="font-sans">
                    Nombre
                  </Label>
                  <Input id="firstName" placeholder="Juan" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="lastName" className="font-sans">
                    Apellido
                  </Label>
                  <Input id="lastName" placeholder="Perez" className="mt-1.5" />
                </div>
              </div>
              <div>
                <Label htmlFor="phone" className="font-sans">
                  Telefono
                </Label>
                <Input id="phone" type="tel" placeholder="+52 33 1234 5678" className="mt-1.5" />
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Shipping */}
          <div>
            <h2 className="font-sans text-lg font-semibold text-foreground">Direccion de Envio</h2>
            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="address" className="font-sans">
                  Direccion
                </Label>
                <Input id="address" placeholder="Calle y numero" className="mt-1.5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div>
                  <Label htmlFor="city" className="font-sans">
                    Ciudad
                  </Label>
                  <Input id="city" placeholder="Guadalajara" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="state" className="font-sans">
                    Estado
                  </Label>
                  <Input id="state" placeholder="Jalisco" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="zip" className="font-sans">
                    Codigo Postal
                  </Label>
                  <Input id="zip" placeholder="44100" className="mt-1.5" />
                </div>
              </div>
            </div>
          </div>

          <Separator className="my-8" />

          {/* Payment */}
          <div>
            <h2 className="font-sans text-lg font-semibold text-foreground">Metodo de Pago</h2>
            <RadioGroup defaultValue="card" className="mt-4">
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                <RadioGroupItem value="card" id="card" />
                <Label
                  htmlFor="card"
                  className="flex flex-1 cursor-pointer items-center gap-3 font-sans"
                >
                  <CreditCard className="h-5 w-5 text-muted-foreground" />
                  Tarjeta de credito o debito
                </Label>
              </div>
              <div className="flex items-center space-x-3 rounded-lg border border-border p-4">
                <RadioGroupItem value="oxxo" id="oxxo" />
                <Label
                  htmlFor="oxxo"
                  className="flex flex-1 cursor-pointer items-center gap-3 font-sans"
                >
                  <span className="font-bold text-muted-foreground">OXXO</span>
                  Pago en efectivo
                </Label>
              </div>
            </RadioGroup>

            <div className="mt-4 space-y-4">
              <div>
                <Label htmlFor="cardNumber" className="font-sans">
                  Numero de tarjeta
                </Label>
                <Input id="cardNumber" placeholder="1234 5678 9012 3456" className="mt-1.5" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <Label htmlFor="expiry" className="font-sans">
                    Fecha de expiracion
                  </Label>
                  <Input id="expiry" placeholder="MM/AA" className="mt-1.5" />
                </div>
                <div>
                  <Label htmlFor="cvv" className="font-sans">
                    CVV
                  </Label>
                  <Input id="cvv" placeholder="123" className="mt-1.5" />
                </div>
              </div>
            </div>
          </div>

          <Button className="mt-8 w-full font-sans font-semibold" size="lg">
            Pagar $2,847.00 MXN
          </Button>
        </div>

        {/* Order Summary */}
        <div className="lg:col-span-2">
          <div className="sticky top-24 rounded-lg border border-border bg-card p-6">
            <h2 className="font-sans text-lg font-semibold text-foreground">Resumen del Pedido</h2>

            {/* Items */}
            <div className="mt-4 space-y-4">
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-md bg-secondary" />
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-foreground">
                    Filipina Chef Premium
                  </p>
                  <p className="font-serif text-xs text-muted-foreground">
                    Blanco / Talla M / Bordado: Chef Juan
                  </p>
                  <p className="mt-1 font-sans text-sm font-semibold text-foreground">$1,299.00</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="h-16 w-16 rounded-md bg-secondary" />
                <div className="flex-1">
                  <p className="font-sans text-sm font-medium text-foreground">Mandil Clasico</p>
                  <p className="font-serif text-xs text-muted-foreground">Negro / Sin bordado</p>
                  <p className="mt-1 font-sans text-sm font-semibold text-foreground">$449.00</p>
                </div>
              </div>
            </div>

            <Separator className="my-4" />

            {/* Totals */}
            <div className="space-y-2">
              <div className="flex justify-between font-serif text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span className="text-foreground">$1,748.00</span>
              </div>
              <div className="flex justify-between font-serif text-sm">
                <span className="text-muted-foreground">Personalizacion</span>
                <span className="text-foreground">$150.00</span>
              </div>
              <div className="flex justify-between font-serif text-sm">
                <span className="text-muted-foreground">Envio</span>
                <span className="text-foreground">$149.00</span>
              </div>
              <div className="flex justify-between font-serif text-sm text-success">
                <span>Descuento (10%)</span>
                <span>-$200.00</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between">
              <span className="font-sans font-semibold text-foreground">Total</span>
              <span className="font-sans text-lg font-bold text-foreground">$2,847.00</span>
            </div>

            {/* Trust Badges */}
            <div className="mt-6 space-y-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Shield className="h-4 w-4" />
                <span className="font-serif text-xs">Pago 100% seguro</span>
              </div>
              <div className="flex items-center gap-2 text-muted-foreground">
                <Truck className="h-4 w-4" />
                <span className="font-serif text-xs">Envio en 3-5 dias habiles</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </CheckoutLayout>
  )
}
