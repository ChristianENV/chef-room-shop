'use client'

import { Mail, MoreHorizontal } from 'lucide-react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
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

import { AdminUsersTableSkeleton } from './admin-users-loading'
import type { AdminUserInvitationsUiTableRow } from '../types/admin-invitations.types'

export type AdminInvitationTableAction = 'revoke' | 'resend'

type AdminInvitationsTableProps = {
  rows: AdminUserInvitationsUiTableRow[]
  loading?: boolean
  onAction?: (action: AdminInvitationTableAction, invitationId: string) => void
  canWrite?: boolean
}

const statusBadgeClass: Record<string, string> = {
  PENDING: 'border-warning/30 bg-warning/10 text-warning',
  ACCEPTED: 'border-success/30 bg-success/10 text-success',
  REVOKED: 'border-border bg-muted text-muted-foreground',
  EXPIRED: 'border-destructive/30 bg-destructive/10 text-destructive',
}

export function AdminInvitationsTable({
  rows,
  loading,
  onAction,
  canWrite = false,
}: AdminInvitationsTableProps) {
  if (loading) {
    return <AdminUsersTableSkeleton rows={6} />
  }

  if (rows.length === 0) {
    return (
      <div
        className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 px-4 text-center"
        data-testid="admin-invitations-empty"
      >
        <Mail className="mb-4 h-12 w-12 text-muted-foreground" aria-hidden />
        <h3 className="font-sans text-lg font-semibold text-foreground">Sin invitaciones</h3>
        <p className="mt-1 max-w-md font-serif text-sm text-muted-foreground">
          Las invitaciones permiten que clientes y miembros del equipo se unan a la app mediante un
          enlace seguro por correo. Crea una invitación o ajusta los filtros de búsqueda.
        </p>
      </div>
    )
  }

  const hasActions = !!onAction && canWrite

  return (
    <div
      className="overflow-x-auto rounded-lg border border-border"
      data-testid="admin-invitations-table"
    >
      <Table className="min-w-[960px]">
        <TableHeader>
          <TableRow>
            <TableHead className="font-sans">Email</TableHead>
            <TableHead className="font-sans">Rol</TableHead>
            <TableHead className="font-sans">Estado</TableHead>
            <TableHead className="font-sans">Invitado por</TableHead>
            <TableHead className="font-sans">Creado</TableHead>
            <TableHead className="font-sans">Expira</TableHead>
            {hasActions ? <TableHead className="w-12 font-sans" /> : null}
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id} data-testid={`admin-invitation-row-${row.id}`}>
              <TableCell>
                <span className="font-mono text-sm text-muted-foreground">{row.email}</span>
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="font-sans text-xs">
                  {row.targetRoleLabel}
                </Badge>
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
                <span className="font-sans text-sm text-foreground">{row.invitedByName}</span>
              </TableCell>
              <TableCell>
                <span className="font-serif text-sm text-muted-foreground">
                  {row.createdAtLabel}
                </span>
              </TableCell>
              <TableCell>
                <div className="flex flex-col gap-0.5">
                  <span className="font-serif text-sm text-muted-foreground">
                    {row.expiresAtLabel}
                  </span>
                  {row.expiresAtHint ? (
                    <span
                      className={cn(
                        'font-serif text-xs',
                        row.expiresAtHint === 'Expirada' ? 'text-destructive' : 'text-warning',
                      )}
                    >
                      {row.expiresAtHint}
                    </span>
                  ) : null}
                </div>
              </TableCell>
              {hasActions ? (
                <TableCell>
                  {row.canResend || row.canRevoke ? (
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          data-testid={`admin-invitation-actions-${row.id}`}
                        >
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        {row.canResend ? (
                          <DropdownMenuItem
                            onClick={() => onAction('resend', row.id)}
                            data-testid={`admin-invitation-resend-${row.id}`}
                          >
                            Reenviar
                          </DropdownMenuItem>
                        ) : null}
                        {row.canRevoke ? (
                          <DropdownMenuItem
                            onClick={() => onAction('revoke', row.id)}
                            className="text-destructive focus:text-destructive"
                            data-testid={`admin-invitation-revoke-${row.id}`}
                          >
                            Revocar
                          </DropdownMenuItem>
                        ) : null}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  ) : (
                    <span className="font-serif text-xs text-muted-foreground">—</span>
                  )}
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
