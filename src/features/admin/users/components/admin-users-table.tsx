'use client'

import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'

import { AdminUsersEmpty } from './admin-users-empty'
import { AdminUsersTableSkeleton } from './admin-users-loading'
import type { AdminUsersUiTableRow } from '../types'

type AdminUsersTableProps = {
  rows: AdminUsersUiTableRow[]
  loading?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Admin',
  SUPERADMIN: 'Superadmin',
}

const statusBadgeClass: Record<string, string> = {
  ACTIVE: 'border-success/30 bg-success/10 text-success',
  SUSPENDED: 'border-destructive/30 bg-destructive/10 text-destructive',
  PENDING_VERIFICATION: 'border-warning/30 bg-warning/10 text-warning',
  DELETED: 'border-border bg-muted text-muted-foreground',
}

export function AdminUsersTable({ rows, loading }: AdminUsersTableProps) {
  if (loading) {
    return <AdminUsersTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminUsersEmpty />
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-border" data-testid="admin-users-table">
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Nombre</TableHead>
            <TableHead className="font-sans">Email</TableHead>
            <TableHead className="font-sans">Rol</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Email verificado</TableHead>
            <TableHead className="font-sans">Cliente</TableHead>
            <TableHead className="font-sans">Creado</TableHead>
            <TableHead className="font-sans">Actualizado</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={`admin-user-row-${row.id}`}>
              <TableCell>
                <span className="font-sans text-sm font-medium text-foreground">{row.name}</span>
              </TableCell>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">{row.email}</span>
              </TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {row.roles.map((role) => (
                    <Badge key={role} variant="outline" className="font-sans text-xs">
                      {ROLE_LABELS[role] ?? role}
                    </Badge>
                  ))}
                </div>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn('font-sans text-xs', statusBadgeClass[row.status])}
                >
                  {row.statusLabel}
                </Badge>
              </TableCell>
              <TableCell>
                <Badge
                  variant="outline"
                  className={cn(
                    'font-sans text-xs',
                    row.emailVerified
                      ? 'border-success/30 bg-success/10 text-success'
                      : 'border-border bg-muted text-muted-foreground',
                  )}
                >
                  {row.emailVerified ? 'Verificado' : 'Sin verificar'}
                </Badge>
              </TableCell>
              <TableCell>
                {row.customerTierLabel ? (
                  <Badge variant="secondary" className="font-sans text-xs">
                    {row.customerTierLabel}
                  </Badge>
                ) : (
                  <span className="font-serif text-sm text-muted-foreground">Regular</span>
                )}
              </TableCell>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.createdAtLabel}
                </span>
              </TableCell>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.updatedAtLabel}
                </span>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
