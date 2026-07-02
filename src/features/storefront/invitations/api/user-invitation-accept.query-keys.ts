export const userInvitationAcceptQueryKeys = {
  all: ['user-invitation-accept'] as const,
  preview: (token: string) => [...userInvitationAcceptQueryKeys.all, 'preview', token] as const,
}
