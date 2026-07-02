'use client'

import { MoreHorizontal } from 'lucide-react'
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

import { AdminUsersEmpty } from './admin-users-empty'
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
      <AdminUsersEmpty
        title="Sin invitaciones"
        description="No encontramos invitaciones con estos filtros."
      />
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
                <span className="font-serif text-sm text-muted-foreground">
                  {row.expiresAtLabel}
                </span>
              </TableCell>
              {hasActions ? (
                <TableCell>
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
                </TableCell>
              ) : null}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}
