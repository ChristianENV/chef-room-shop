'use client'

import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'
import { Receipt } from 'lucide-react'

const MEXICAN_STATES = [
  'Aguascalientes',
  'Baja California',
  'Baja California Sur',
  'Campeche',
  'Chiapas',
  'Chihuahua',
  'Ciudad de Mexico',
  'Coahuila',
  'Colima',
  'Durango',
  'Estado de Mexico',
  'Guanajuato',
  'Guerrero',
  'Hidalgo',
  'Jalisco',
  'Michoacan',
  'Morelos',
  'Nayarit',
  'Nuevo Leon',
  'Oaxaca',
  'Puebla',
  'Queretaro',
  'Quintana Roo',
  'San Luis Potosi',
  'Sinaloa',
  'Sonora',
  'Tabasco',
  'Tamaulipas',
  'Tlaxcala',
  'Veracruz',
  'Yucatan',
  'Zacatecas',
]

export interface BillingAddressData {
  sameAsShipping: boolean
  firstName: string
  lastName: string
  street: string
  exteriorNumber: string
  interiorNumber: string
  neighborhood: string
  city: string
  state: string
  postalCode: string
  country: string
  rfc?: string
  businessName?: string
}

interface BillingAddressFormProps {
  data: BillingAddressData
  onChange: (data: BillingAddressData) => void
  errors?: Partial<Record<keyof BillingAddressData, string>>
  className?: string
}

export function BillingAddressForm({ data, onChange, errors, className }: BillingAddressFormProps) {
  const handleChange = (field: keyof BillingAddressData, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <Receipt className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">
          Direccion de facturacion
        </h2>
      </div>

      {/* Same as Shipping Checkbox */}
      <div className="flex items-center gap-2">
        <Checkbox
          id="sameAsShipping"
          checked={data.sameAsShipping}
          onCheckedChange={(checked) => handleChange('sameAsShipping', checked === true)}
        />
        <Label htmlFor="sameAsShipping" className="font-serif text-sm text-muted-foreground">
          Usar la misma direccion de envio
        </Label>
      </div>

      {/* Billing Form (shown when not same as shipping) */}
      {!data.sameAsShipping && (
        <div className="grid gap-4 sm:grid-cols-2">
          {/* RFC (Optional for invoicing) */}
          <div>
            <Label htmlFor="rfc" className="font-sans text-sm font-medium">
              RFC (opcional)
            </Label>
            <Input
              id="rfc"
              value={data.rfc || ''}
              onChange={(e) => handleChange('rfc', e.target.value.toUpperCase())}
              className="mt-1.5 uppercase"
              placeholder="XAXX010101000"
              maxLength={13}
            />
          </div>

          {/* Business Name (Optional) */}
          <div>
            <Label htmlFor="businessName" className="font-sans text-sm font-medium">
              Razon social (opcional)
            </Label>
            <Input
              id="businessName"
              value={data.businessName || ''}
              onChange={(e) => handleChange('businessName', e.target.value)}
              className="mt-1.5"
              placeholder="Mi Restaurante S.A. de C.V."
            />
          </div>

          {/* First Name */}
          <div>
            <Label htmlFor="billingFirstName" className="font-sans text-sm font-medium">
              Nombre *
            </Label>
            <Input
              id="billingFirstName"
              value={data.firstName}
              onChange={(e) => handleChange('firstName', e.target.value)}
              className={cn('mt-1.5', errors?.firstName && 'border-destructive')}
              placeholder="Juan"
              required
            />
          </div>

          {/* Last Name */}
          <div>
            <Label htmlFor="billingLastName" className="font-sans text-sm font-medium">
              Apellido *
            </Label>
            <Input
              id="billingLastName"
              value={data.lastName}
              onChange={(e) => handleChange('lastName', e.target.value)}
              className={cn('mt-1.5', errors?.lastName && 'border-destructive')}
              placeholder="Perez"
              required
            />
          </div>

          {/* Street */}
          <div className="sm:col-span-2">
            <Label htmlFor="billingStreet" className="font-sans text-sm font-medium">
              Calle *
            </Label>
            <Input
              id="billingStreet"
              value={data.street}
              onChange={(e) => handleChange('street', e.target.value)}
              className={cn('mt-1.5', errors?.street && 'border-destructive')}
              placeholder="Av. Reforma"
              required
            />
          </div>

          {/* Exterior Number */}
          <div>
            <Label htmlFor="billingExteriorNumber" className="font-sans text-sm font-medium">
              Numero exterior *
            </Label>
            <Input
              id="billingExteriorNumber"
              value={data.exteriorNumber}
              onChange={(e) => handleChange('exteriorNumber', e.target.value)}
              className={cn('mt-1.5', errors?.exteriorNumber && 'border-destructive')}
              placeholder="123"
              required
            />
          </div>

          {/* Interior Number */}
          <div>
            <Label htmlFor="billingInteriorNumber" className="font-sans text-sm font-medium">
              Numero interior
            </Label>
            <Input
              id="billingInteriorNumber"
              value={data.interiorNumber}
              onChange={(e) => handleChange('interiorNumber', e.target.value)}
              className="mt-1.5"
              placeholder="Opcional"
            />
          </div>

          {/* Neighborhood */}
          <div>
            <Label htmlFor="billingNeighborhood" className="font-sans text-sm font-medium">
              Colonia *
            </Label>
            <Input
              id="billingNeighborhood"
              value={data.neighborhood}
              onChange={(e) => handleChange('neighborhood', e.target.value)}
              className={cn('mt-1.5', errors?.neighborhood && 'border-destructive')}
              placeholder="Centro"
              required
            />
          </div>

          {/* Postal Code */}
          <div>
            <Label htmlFor="billingPostalCode" className="font-sans text-sm font-medium">
              Codigo postal *
            </Label>
            <Input
              id="billingPostalCode"
              value={data.postalCode}
              onChange={(e) => handleChange('postalCode', e.target.value)}
              className={cn('mt-1.5', errors?.postalCode && 'border-destructive')}
              placeholder="06600"
              maxLength={5}
              required
            />
          </div>

          {/* City */}
          <div>
            <Label htmlFor="billingCity" className="font-sans text-sm font-medium">
              Ciudad *
            </Label>
            <Input
              id="billingCity"
              value={data.city}
              onChange={(e) => handleChange('city', e.target.value)}
              className={cn('mt-1.5', errors?.city && 'border-destructive')}
              placeholder="Ciudad de Mexico"
              required
            />
          </div>

          {/* State */}
          <div>
            <Label htmlFor="billingState" className="font-sans text-sm font-medium">
              Estado *
            </Label>
            <Select value={data.state} onValueChange={(value) => handleChange('state', value)}>
              <SelectTrigger className={cn('mt-1.5', errors?.state && 'border-destructive')}>
                <SelectValue placeholder="Selecciona un estado" />
              </SelectTrigger>
              <SelectContent>
                {MEXICAN_STATES.map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      )}
    </div>
  )
}
