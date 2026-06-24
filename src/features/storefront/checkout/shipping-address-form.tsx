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
import { MapPin } from 'lucide-react'

// Mexican states for shipping
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

export interface ShippingAddressData {
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
  saveAddress: boolean
}

interface ShippingAddressFormProps {
  data: ShippingAddressData
  onChange: (data: ShippingAddressData) => void
  errors?: Partial<Record<keyof ShippingAddressData, string>>
  className?: string
}

export function ShippingAddressForm({
  data,
  onChange,
  errors,
  className,
}: ShippingAddressFormProps) {
  const handleChange = (field: keyof ShippingAddressData, value: string | boolean) => {
    onChange({ ...data, [field]: value })
  }

  return (
    <div className={cn('space-y-4', className)}>
      <div className="flex items-center gap-2">
        <MapPin className="h-5 w-5 text-primary" />
        <h2 className="font-sans text-lg font-semibold text-foreground">Direccion de envio</h2>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {/* First Name */}
        <div>
          <Label htmlFor="firstName" className="font-sans text-sm font-medium">
            Nombre *
          </Label>
          <Input
            id="firstName"
            value={data.firstName}
            onChange={(e) => handleChange('firstName', e.target.value)}
            className={cn('mt-1.5', errors?.firstName && 'border-destructive')}
            placeholder="Juan"
            required
          />
          {errors?.firstName && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.firstName}</p>
          )}
        </div>

        {/* Last Name */}
        <div>
          <Label htmlFor="lastName" className="font-sans text-sm font-medium">
            Apellido *
          </Label>
          <Input
            id="lastName"
            value={data.lastName}
            onChange={(e) => handleChange('lastName', e.target.value)}
            className={cn('mt-1.5', errors?.lastName && 'border-destructive')}
            placeholder="Perez"
            required
          />
          {errors?.lastName && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.lastName}</p>
          )}
        </div>

        {/* Street */}
        <div className="sm:col-span-2">
          <Label htmlFor="street" className="font-sans text-sm font-medium">
            Calle *
          </Label>
          <Input
            id="street"
            value={data.street}
            onChange={(e) => handleChange('street', e.target.value)}
            className={cn('mt-1.5', errors?.street && 'border-destructive')}
            placeholder="Av. Reforma"
            required
          />
          {errors?.street && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.street}</p>
          )}
        </div>

        {/* Exterior Number */}
        <div>
          <Label htmlFor="exteriorNumber" className="font-sans text-sm font-medium">
            Numero exterior *
          </Label>
          <Input
            id="exteriorNumber"
            value={data.exteriorNumber}
            onChange={(e) => handleChange('exteriorNumber', e.target.value)}
            className={cn('mt-1.5', errors?.exteriorNumber && 'border-destructive')}
            placeholder="123"
            required
          />
          {errors?.exteriorNumber && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.exteriorNumber}</p>
          )}
        </div>

        {/* Interior Number */}
        <div>
          <Label htmlFor="interiorNumber" className="font-sans text-sm font-medium">
            Numero interior
          </Label>
          <Input
            id="interiorNumber"
            value={data.interiorNumber}
            onChange={(e) => handleChange('interiorNumber', e.target.value)}
            className="mt-1.5"
            placeholder="Depto 4B (opcional)"
          />
        </div>

        {/* Neighborhood */}
        <div>
          <Label htmlFor="neighborhood" className="font-sans text-sm font-medium">
            Colonia *
          </Label>
          <Input
            id="neighborhood"
            value={data.neighborhood}
            onChange={(e) => handleChange('neighborhood', e.target.value)}
            className={cn('mt-1.5', errors?.neighborhood && 'border-destructive')}
            placeholder="Centro"
            required
          />
          {errors?.neighborhood && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.neighborhood}</p>
          )}
        </div>

        {/* Postal Code */}
        <div>
          <Label htmlFor="postalCode" className="font-sans text-sm font-medium">
            Codigo postal *
          </Label>
          <Input
            id="postalCode"
            value={data.postalCode}
            onChange={(e) => handleChange('postalCode', e.target.value)}
            className={cn('mt-1.5', errors?.postalCode && 'border-destructive')}
            placeholder="06600"
            maxLength={5}
            required
          />
          {errors?.postalCode && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.postalCode}</p>
          )}
        </div>

        {/* City */}
        <div>
          <Label htmlFor="city" className="font-sans text-sm font-medium">
            Ciudad *
          </Label>
          <Input
            id="city"
            value={data.city}
            onChange={(e) => handleChange('city', e.target.value)}
            className={cn('mt-1.5', errors?.city && 'border-destructive')}
            placeholder="Ciudad de Mexico"
            required
          />
          {errors?.city && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.city}</p>
          )}
        </div>

        {/* State */}
        <div>
          <Label htmlFor="state" className="font-sans text-sm font-medium">
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
          {errors?.state && (
            <p className="mt-1 font-serif text-xs text-destructive">{errors.state}</p>
          )}
        </div>

        {/* Country (Read-only for now) */}
        <div className="sm:col-span-2">
          <Label htmlFor="country" className="font-sans text-sm font-medium">
            Pais
          </Label>
          <Input id="country" value="Mexico" disabled className="mt-1.5 bg-secondary" />
        </div>

        {/* Save Address Checkbox */}
        <div className="flex items-center gap-2 sm:col-span-2">
          <Checkbox
            id="saveAddress"
            checked={data.saveAddress}
            onCheckedChange={(checked) => handleChange('saveAddress', checked === true)}
          />
          <Label htmlFor="saveAddress" className="font-serif text-sm text-muted-foreground">
            Guardar esta direccion para futuras compras
          </Label>
        </div>
      </div>
    </div>
  )
}
