'use client'

import { MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
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

export type AdminUserTableAction = 'edit' | 'pause' | 'block' | 'reactivate'

type AdminUsersTableProps = {
  rows: AdminUsersUiTableRow[]
  loading?: boolean
  onAction?: (action: AdminUserTableAction, userId: string) => void
  canWrite?: boolean
}

const ROLE_LABELS: Record<string, string> = {
  CUSTOMER: 'Cliente',
  ADMIN: 'Admin',
  SUPERADMIN: 'Superadmin',
}

const statusBadgeClass: Record<string, string> = {
  ACTIVE: 'border-success/30 bg-success/10 text-success',
  SUSPENDED: 'border-warning/30 bg-warning/10 text-warning',
  PENDING_VERIFICATION: 'border-border bg-muted text-muted-foreground',
  DELETED: 'border-destructive/30 bg-destructive/10 text-destructive',
}

const STATUS_LABELS: Record<string, string> = {
  ACTIVE: 'Activo',
  SUSPENDED: 'Suspendido',
  PENDING_VERIFICATION: 'Pendiente',
  DELETED: 'Bloqueado',
}

function UserActionsMenu({
  row,
  onAction,
}: {
  row: AdminUsersUiTableRow
  onAction: (action: AdminUserTableAction, userId: string) => void
}) {
  const isSuspended = row.status === 'SUSPENDED'
  const isDeleted = row.status === 'DELETED'
  const canReactivate = isSuspended || isDeleted
  const canPause = !isSuspended && !isDeleted
  const canBlock = !isDeleted

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          data-testid={`admin-user-actions-${row.id}`}
        >
          <MoreHorizontal className="h-4 w-4" />
          <span className="sr-only">Acciones para {row.name}</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem
          onClick={() => onAction('edit', row.id)}
          data-testid={`admin-user-edit-${row.id}`}
        >
          Editar
        </DropdownMenuItem>
        {canReactivate ? (
          <DropdownMenuItem
            onClick={() => onAction('reactivate', row.id)}
            data-testid={`admin-user-reactivate-${row.id}`}
          >
            Reactivar
          </DropdownMenuItem>
        ) : null}
        {canPause ? (
          <>
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => onAction('pause', row.id)}
              className="text-warning focus:text-warning"
              data-testid={`admin-user-pause-${row.id}`}
            >
              Suspender temporalmente
            </DropdownMenuItem>
          </>
        ) : null}
        {canBlock ? (
          <DropdownMenuItem
            onClick={() => onAction('block', row.id)}
            className="text-destructive focus:text-destructive"
            data-testid={`admin-user-block-${row.id}`}
          >
            Bloquear
          </DropdownMenuItem>
        ) : null}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function AdminUsersTable({
  rows,
  loading,
  onAction,
  canWrite = false,
}: AdminUsersTableProps) {
  if (loading) {
    return <AdminUsersTableSkeleton />
  }

  if (rows.length === 0) {
    return <AdminUsersEmpty />
  }

  const hasActions = !!onAction && canWrite

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-users-table"
    >
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
            {hasActions ? <TableHead className="w-12 font-sans" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={`admin-user-row-${row.id}`}>
              <TableCell>
                <div>
                  <span className="font-sans text-sm font-medium text-foreground">{row.name}</span>
                  {row.firstName || row.lastName ? (
                    <p className="font-serif text-xs text-muted-foreground">
                      {[row.firstName, row.lastName].filter(Boolean).join(' ')}
                    </p>
                  ) : null}
                </div>
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
                  {STATUS_LABELS[row.status] ?? row.statusLabel}
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
              {hasActions ? (
                <TableCell>
                  <UserActionsMenu row={row} onAction={onAction} />
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
