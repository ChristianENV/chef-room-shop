export const adminInvitationsQueryKeys = {
  all: ['adminUserInvitations'] as const,
  list: (variables?: unknown) => [...adminInvitationsQueryKeys.all, 'list', variables] as const,
}
