'use client'

import { useState } from 'react'
import { 
  Edit,
  MapPin,
  MoreHorizontal,
  Plus,
  Trash2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import type { Address } from '@/lib/types'

const MEXICAN_STATES = [
  'Aguascalientes', 'Baja California', 'Baja California Sur', 'Campeche',
  'Chiapas', 'Chihuahua', 'CDMX', 'Coahuila', 'Colima', 'Durango',
  'Estado de Mexico', 'Guanajuato', 'Guerrero', 'Hidalgo', 'Jalisco',
  'Michoacan', 'Morelos', 'Nayarit', 'Nuevo Leon', 'Oaxaca', 'Puebla',
  'Queretaro', 'Quintana Roo', 'San Luis Potosi', 'Sinaloa', 'Sonora',
  'Tabasco', 'Tamaulipas', 'Tlaxcala', 'Veracruz', 'Yucatan', 'Zacatecas',
]

interface AddressCardProps {
  address: Address
  onEdit?: (address: Address) => void
  onDelete?: (id: string) => void
  onSetDefault?: (id: string, type: 'shipping' | 'billing') => void
}

export function AddressCard({ 
  address, 
  onEdit, 
  onDelete,
  onSetDefault,
}: AddressCardProps) {
  return (
    <Card className={cn(
      'border-border bg-card transition-all',
      (address.isDefaultShipping || address.isDefaultBilling) && 'border-primary/50'
    )}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h3 className="font-sans font-semibold text-foreground">
                {address.label}
              </h3>
              {address.isDefaultShipping && (
                <Badge variant="secondary" className="text-xs">Envio</Badge>
              )}
              {address.isDefaultBilling && (
                <Badge variant="secondary" className="text-xs">Facturacion</Badge>
              )}
            </div>
            <p className="font-serif text-sm text-foreground">
              {address.firstName} {address.lastName}
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              {address.street} {address.exteriorNumber}
              {address.interiorNumber && `, Int. ${address.interiorNumber}`}
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              Col. {address.neighborhood}
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              {address.city}, {address.state} CP {address.postalCode}
            </p>
            <p className="font-serif text-sm text-muted-foreground">
              Tel: {address.phone}
            </p>
          </div>
          
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onEdit?.(address)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              {!address.isDefaultShipping && (
                <DropdownMenuItem onClick={() => onSetDefault?.(address.id, 'shipping')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Usar para envio
                </DropdownMenuItem>
              )}
              {!address.isDefaultBilling && (
                <DropdownMenuItem onClick={() => onSetDefault?.(address.id, 'billing')}>
                  <MapPin className="mr-2 h-4 w-4" />
                  Usar para facturacion
                </DropdownMenuItem>
              )}
              <DropdownMenuItem 
                onClick={() => onDelete?.(address.id)}
                className="text-destructive focus:text-destructive"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Eliminar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}

interface AddressDialogProps {
  address?: Address | null
  open?: boolean
  onOpenChange?: (open: boolean) => void
  onSave?: (address: Partial<Address>) => void | Promise<void>
  isSubmitting?: boolean
  trigger?: React.ReactNode
}

export function AddressDialog({
  address,
  open,
  onOpenChange,
  onSave,
  isSubmitting = false,
  trigger,
}: AddressDialogProps) {
  const emptyForm: Partial<Address> = {
    label: '',
    firstName: '',
    lastName: '',
    street: '',
    exteriorNumber: '',
    interiorNumber: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    country: 'Mexico',
    phone: '',
    isDefaultShipping: false,
    isDefaultBilling: false,
  }

  const [formData, setFormData] = useState<Partial<Address>>(address ?? emptyForm)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    await onSave?.(formData)
  }

  const isEditing = !!address

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="font-sans">
            {isEditing ? 'Editar direccion' : 'Agregar direccion'}
          </DialogTitle>
          <DialogDescription className="font-serif">
            {isEditing 
              ? 'Actualiza la informacion de esta direccion'
              : 'Ingresa los datos de tu nueva direccion de envio'
            }
          </DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Etiqueta</Label>
            <Input
              id="label"
              placeholder="Ej: Casa, Oficina, Restaurante"
              value={formData.label}
              onChange={(e) => setFormData({ ...formData, label: e.target.value })}
              required
            />
          </div>

          {/* Name */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="firstName">Nombre</Label>
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastName">Apellido</Label>
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Street */}
          <div className="space-y-2">
            <Label htmlFor="street">Calle</Label>
            <Input
              id="street"
              value={formData.street}
              onChange={(e) => setFormData({ ...formData, street: e.target.value })}
              required
            />
          </div>

          {/* Numbers */}
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="exteriorNumber">Num. Exterior</Label>
              <Input
                id="exteriorNumber"
                value={formData.exteriorNumber}
                onChange={(e) => setFormData({ ...formData, exteriorNumber: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="interiorNumber">Num. Interior (opcional)</Label>
              <Input
                id="interiorNumber"
                value={formData.interiorNumber}
                onChange={(e) => setFormData({ ...formData, interiorNumber: e.target.value })}
              />
            </div>
          </div>

          {/* Neighborhood */}
          <div className="space-y-2">
            <Label htmlFor="neighborhood">Colonia</Label>
            <Input
              id="neighborhood"
              value={formData.neighborhood}
              onChange={(e) => setFormData({ ...formData, neighborhood: e.target.value })}
              required
            />
          </div>

          {/* City, State, Postal */}
          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="city">Ciudad</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="state">Estado</Label>
              <Select
                value={formData.state}
                onValueChange={(value) => setFormData({ ...formData, state: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar" />
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
            <div className="space-y-2">
              <Label htmlFor="postalCode">CP</Label>
              <Input
                id="postalCode"
                value={formData.postalCode}
                onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div className="space-y-2">
            <Label htmlFor="phone">Telefono</Label>
            <Input
              id="phone"
              type="tel"
              value={formData.phone}
              onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              required
            />
          </div>

          {/* Default Checkboxes */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefaultShipping"
                checked={formData.isDefaultShipping}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isDefaultShipping: !!checked })
                }
              />
              <Label htmlFor="isDefaultShipping" className="text-sm font-normal">
                Usar como direccion de envio predeterminada
              </Label>
            </div>
            <div className="flex items-center gap-2">
              <Checkbox
                id="isDefaultBilling"
                checked={formData.isDefaultBilling}
                onCheckedChange={(checked) => 
                  setFormData({ ...formData, isDefaultBilling: !!checked })
                }
              />
              <Label htmlFor="isDefaultBilling" className="text-sm font-normal">
                Usar como direccion de facturacion predeterminada
              </Label>
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange?.(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={isSubmitting}>
              {isSubmitting
                ? 'Guardando...'
                : isEditing
                  ? 'Guardar cambios'
                  : 'Agregar direccion'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

interface AddressesListProps {
  addresses: Address[]
  isLoading?: boolean
  onAddAddress?: () => void
  onEditAddress?: (address: Address) => void
  onDeleteAddress?: (id: string) => void
  onSetDefault?: (id: string, type: 'shipping' | 'billing') => void
}

export function AddressesList({
  addresses,
  isLoading,
  onAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefault,
}: AddressesListProps) {
  if (isLoading) {
    return <AddressesListSkeleton />
  }

  return (
    <div className="space-y-4">
      {/* Add Button */}
      <div className="flex justify-end">
        <Button onClick={onAddAddress}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar direccion
        </Button>
      </div>

      {addresses.length === 0 ? (
        <AddressesEmptyState onAdd={onAddAddress} />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {addresses.map((address) => (
            <AddressCard
              key={address.id}
              address={address}
              onEdit={onEditAddress}
              onDelete={onDeleteAddress}
              onSetDefault={onSetDefault}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function AddressesListSkeleton() {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <div className="h-10 w-40 animate-pulse rounded-md bg-secondary" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        {[1, 2].map((i) => (
          <Card key={i} className="border-border bg-card">
            <CardContent className="p-4">
              <div className="animate-pulse space-y-3">
                <div className="h-5 w-24 rounded bg-secondary" />
                <div className="h-4 w-32 rounded bg-secondary" />
                <div className="h-4 w-48 rounded bg-secondary" />
                <div className="h-4 w-40 rounded bg-secondary" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}

function AddressesEmptyState({ onAdd }: { onAdd?: () => void }) {
  return (
    <Card className="border-border bg-card">
      <CardContent className="flex flex-col items-center justify-center py-12 text-center">
        <div className="mb-4 rounded-full bg-secondary p-4">
          <MapPin className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="font-sans text-lg font-semibold text-foreground">
          No tienes direcciones guardadas
        </h3>
        <p className="mt-1 max-w-sm font-serif text-muted-foreground">
          Agrega una direccion para acelerar tus proximos pedidos.
        </p>
        <Button className="mt-6" onClick={onAdd}>
          <Plus className="mr-2 h-4 w-4" />
          Agregar direccion
        </Button>
      </CardContent>
    </Card>
  )
}
